// worker.js – Mini‑Them auto‑apply background worker (CommonJS)

const { createClient } = require('@supabase/supabase-js');

// 1. Service‑role client (bypasses RLS so we can insert tasks)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 2. Anon key for calling Edge Functions (public)
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;

// Safety: delay between API calls to avoid rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function countAgentTasksToday(agentId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('agent_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    console.error(`[Worker] Task count error for agent ${agentId}:`, error.message);
    return Infinity; // fail-safe: block creation if we can't count
  }
  return count || 0;
}

function hasSkillOverlap(agentSkills, gigSkills) {
  if (!agentSkills?.length || !gigSkills?.length) return true; // no filter if either side is empty
  return agentSkills.some((skill) =>
    gigSkills.some((gigSkill) => gigSkill.toLowerCase() === skill.toLowerCase())
  );
}

async function processGigs() {
  console.log(`[Worker] Tick ${new Date().toISOString()}`);

  // Fetch active agents with auto-apply enabled
  const { data: agents, error: agentError } = await supabase
    .from('mini_them_agents')
    .select('id, user_id, style_summary, custom_instructions, learned_skills, agent_name, settings')
    .eq('status', 'active')
    .eq('settings->>auto_apply_jobs', 'true');

  if (agentError) {
    console.error('[Worker] Agent fetch error:', agentError.message);
    return;
  }
  if (!agents?.length) {
    console.log('[Worker] No active auto‑apply agents');
    return;
  }

  // Fetch open gigs from last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: gigs, error: gigError } = await supabase
    .from('gigs')
    .select('*')
    .eq('status', 'open')
    .gte('created_at', since);

  if (gigError) {
    console.error('[Worker] Gig fetch error:', gigError.message);
    return;
  }
  if (!gigs?.length) {
    console.log('[Worker] No open gigs in last 24h');
    return;
  }

  console.log(`[Worker] ${agents.length} agent(s), ${gigs.length} gig(s)`);

  for (const agent of agents) {
    const settings = agent.settings || {};
    const maxDaily = settings.max_daily_tasks ?? 10;
    let tasksToday = await countAgentTasksToday(agent.id);

    if (tasksToday >= maxDaily) {
      console.log(`[Worker] Agent ${agent.id} reached daily limit (${tasksToday}/${maxDaily})`);
      continue;
    }

    for (const gig of gigs) {
      // Respect daily limit inside inner loop as well
      if (tasksToday >= maxDaily) break;

      // Skip if a task already exists for this pair
      const { data: existing } = await supabase
        .from('agent_tasks')
        .select('id')
        .eq('agent_id', agent.id)
        .eq('gig_id', gig.id);

      if (existing?.length) continue;

      // Basic skill overlap guard
      if (!hasSkillOverlap(agent.learned_skills, gig.skills)) {
        console.log(`[Worker] Agent ${agent.id} skipped gig "${gig.title}" (no skill overlap)`);
        continue;
      }

      console.log(`[Worker] Agent ${agent.id} → Gig "${gig.title}"`);

      try {
        // Build prompts exactly as generateProposalForGig does
        const systemPrompt = [
          `You are a Mini‑Them agent named "${agent.agent_name || 'Mini-Them'}".`,
          `You work in the same style as the user who trained you.`,
          `Style: ${agent.style_summary || 'Professional, clear, concise.'}`,
          `Skills: ${agent.learned_skills?.join(', ') || 'General problem solving'}.`,
          `Custom instructions: ${agent.custom_instructions || 'Be persuasive and specific.'}`,
        ].join('\n');

        const userPrompt = [
          `Write a winning proposal for this job. Adopt the exact tone and format the user would use.`,
          ``,
          `Job title: ${gig.title}`,
          `Description: ${gig.description}`,
          `Budget: $${gig.budget ?? 'Not specified'}`,
          `Required skills: ${gig.skills?.join(', ') || 'Not specified'}`,
          ``,
          `The proposal should highlight relevant skills, mention past work,`,
          `and end with a clear call to action.`,
        ].join('\n');

        // 3. Call the claude-chat Edge Function (using anon key)
        const edgeResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/claude-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 1500,
              system: systemPrompt,
              messages: [{ role: 'user', content: userPrompt }]
            })
          }
        );

        if (!edgeResponse.ok) {
          const errText = await edgeResponse.text();
          throw new Error(`Claude edge function error (${edgeResponse.status}): ${errText}`);
        }

        const result = await edgeResponse.json();

        // Safe extraction of proposal text
        let proposalText = '';
        if (result.content?.[0]?.text) {
          proposalText = result.content[0].text;
        } else if (result.choices?.[0]?.message?.content) {
          proposalText = result.choices[0].message.content;
        } else if (typeof result.text === 'string') {
          proposalText = result.text;
        } else {
          throw new Error('Unexpected response shape from claude-chat edge function');
        }

        // 4. Insert the task with service‑role client
        const { error: insertError } = await supabase
          .from('agent_tasks')
          .insert({
            agent_id: agent.id,
            gig_id: gig.id,
            task_type: 'gig_completion',
            task_description: `Proposal for "${gig.title}"`,
            proposed_output: proposalText,
            output: proposalText,
            status: 'pending_approval',
            requires_approval: true,
          });

        if (insertError) {
          throw new Error(`Task insert error: ${insertError.message}`);
        }

        console.log(`[Worker] ✅ Task created for agent ${agent.id} / gig ${gig.title}`);

        // Increment local counter so we don't exceed daily limit
        tasksToday += 1;

        // Small delay to avoid hammering the edge function
        await delay(500);
      } catch (err) {
        console.error(`[Worker] ❌ Error for agent ${agent.id} / gig ${gig.title}:`, err.message);
      }
    }

    // Delay between agents to be polite to the API
    await delay(1000);
  }
}

// Run immediately and then every 60 seconds
processGigs();
setInterval(processGigs, 60_000).unref();

console.log('[Worker] Mini‑Them auto‑apply worker started (60s interval)');

