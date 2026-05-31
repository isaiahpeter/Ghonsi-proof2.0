import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agentId, gigId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const [{ data: gig }, { data: agent }] = await Promise.all([
      supabase.from('gigs').select('*').eq('id', gigId).single(),
      supabase.from('mini_them_agents').select('*').eq('id', agentId).single()
    ])

    if (!gig || !agent) {
      return new Response(JSON.stringify({ error: 'Gig or agent not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: `You are ${agent.agent_name}, a professional assistant. Style: ${agent.style_summary}. Skills: ${agent.learned_skills?.join(', ')}.`,
        messages: [{
          role: 'user',
          content: `Write a concise professional proposal for this gig:\nTitle: ${gig.title}\nDescription: ${gig.description}\nBudget: $${gig.budget}\nSkills: ${gig.skills?.join(', ')}`
        }]
      })
    })

    const claudeData = await claudeRes.json()
    const proposal = claudeData.content[0].text

    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .insert({
        agent_id: agentId,
        gig_id: gigId,
        task_type: 'job_application',
        task_description: `Proposal for: ${gig.title}`,
        proposed_output: proposal,
        status: 'pending_approval',
        requires_approval: true,
      })
      .select()
      .single()

    if (taskError) throw taskError

    return new Response(JSON.stringify(task), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

