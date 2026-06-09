import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!process.env.SUPABASE_URL) throw new Error('[extract] Missing SUPABASE_URL');
  if (!serviceKey) throw new Error('[extract] Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)');

  return createClient(process.env.SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const supabase = getSupabase();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

requireEnv('SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('[extract] Missing SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_SERVICE_KEY');
}
if (!process.env.SUPABASE_ANON_KEY) {
  console.warn('[extract] SUPABASE_ANON_KEY missing; falling back to SUPABASE_SERVICE_ROLE_KEY for Edge Function calls');
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('[extract] Missing SUPABASE_ANON_KEY and cannot fall back');
}

// Call Claude via your existing edge function
async function callClaude(systemPrompt, userMessage) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/claude-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    }
  );

  const result = await response.json();

  const text =
    result?.content?.[0]?.text ||
    result?.choices?.[0]?.message?.content ||
    result?.message?.content?.[0]?.text;

  if (!text) {
    throw new Error(
      `Claude response missing text. HTTP ${response.status}. Result: ${JSON.stringify(result).slice(0, 1500)}`
    );
  }

  return text;
}

// Parse Claude's JSON output (robust)
function parseJSON(text) {
  if (typeof text !== 'string') {
    throw new Error(`parseJSON expected string, got: ${typeof text}`);
  }

  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
    const candidate = trimmed.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(candidate);
  }

  return JSON.parse(trimmed);
}

function sanitizeArrayOfStrings(arr) {
  return Array.isArray(arr)
    ? arr.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
    : [];
}

function validateExtractedData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Claude output is not an object');
  }

  if (!Array.isArray(data.insights)) throw new Error('Missing insights array');
  if (!Array.isArray(data.tags)) throw new Error('Missing tags array');
  if (!Array.isArray(data.insight_tags)) throw new Error('Missing insight_tags array');
  if (!Array.isArray(data.quotes)) throw new Error('Missing quotes array');

  const allowedEvidence = new Set(['Strong', 'Moderate', 'Weak']);
  const allowedAction = new Set(['High', 'Medium', 'Low']);
  for (const [idx, ins] of data.insights.entries()) {
    if (!ins || typeof ins !== 'object') throw new Error(`insights[${idx}] not an object`);
    if (typeof ins.insight !== 'string' || !ins.insight.trim()) {
      throw new Error(`insights[${idx}].insight missing/empty`);
    }
    if (!allowedEvidence.has(ins.evidence_strength)) {
      throw new Error(
        `insights[${idx}].evidence_strength must be Strong|Moderate|Weak. Got: ${ins.evidence_strength}`
      );
    }
    if (!allowedAction.has(ins.actionability)) {
      throw new Error(
        `insights[${idx}].actionability must be High|Medium|Low. Got: ${ins.actionability}`
      );
    }
  }

  data.tags = sanitizeArrayOfStrings(data.tags);
  data.insight_tags = Array.isArray(data.insight_tags) ? data.insight_tags : [];
  data.quotes = Array.isArray(data.quotes) ? data.quotes : [];
  return data;
}

async function insertInsight(sourceId, insightId, insight) {
  const { error } = await supabase.from('ghonsi_insights').insert({
    insight_id: insightId,
    insight: insight.insight,
    evidence_strength: insight.evidence_strength,
    actionability: insight.actionability,
    source_id: sourceId,
  });

  if (error) throw error;
}

async function insertTag(tagName) {
  // First check if tag already exists
  const { data: existing } = await supabase
    .from('ghonsi_tags')
    .select('id')
    .eq('tag_name', tagName)
    .maybeSingle();

  if (existing) {
    return existing.id; // reuse existing ID
  }

  // Generate new ID based on current max
  const { data: maxRow } = await supabase
    .from('ghonsi_tags')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  let newNum = 1;
  if (maxRow && maxRow.length > 0) {
    const match = maxRow[0].id.match(/^TAG-(\d+)$/);
    if (match) newNum = parseInt(match[1]) + 1;
  }
  const tagId = `TAG-${String(newNum).padStart(3, '0')}`;

  const { error } = await supabase
    .from('ghonsi_tags')
    .insert({ id: tagId, tag_name: tagName });

  if (error) throw error;
  return tagId;
}


async function insertInsightTag(insightId, tagId) {
  const { error } = await supabase.from('ghonsi_insight_tags').insert({
    insight_id: insightId,
    tag_id: tagId,
  });

  if (error) throw error;
}

async function insertQuote(sourceId, quoteId, quote) {
  const { error } = await supabase.from('ghonsi_quotes').insert({
    quote_id: quoteId,
    quote: quote.quote,
    emotion: quote.emotion,
    speaker_type: quote.speaker_type,
    source_id: sourceId,
  });

  if (error) throw error;
}

async function extractFromSource(sourceId, sourceRows, insightStartIndex, tagStartIndex, quoteStartIndex) {
  const rawTexts = sourceRows.map(r => r.raw_text).join('\n\n---\n\n');
  const context = sourceRows[0] || {};

  const systemPrompt = `
You are an expert Nigerian market research analyst. You will receive raw interview/survey responses from a Nigerian respondent.

Your task is to extract the following in a single JSON object:

1. "insights": An array of objects, each with:
   - "insight": A concise, self-contained observation (1-2 sentences) about Nigerian marketing based on the data.
   - "evidence_strength": "Strong" | "Moderate" | "Weak" (how well the data supports it).
   - "actionability": "High" | "Medium" | "Low" (how practical it is for marketers).
   - "frequency": How many times this idea appears across all sources (use 1 for now, unless you see clear repetition).

2. "tags": An array of unique tag strings that apply to the insights (e.g., "consumer_trust", "mobile_money", "referral_dynamics").

3. "insight_tags": An array of objects mapping insights (by index in the insights array) to tags (by tag name):
   - { "insight_index": 0, "tag": "consumer_trust" }

4. "quotes": An array of direct, verbatim quotes from the respondent that are particularly impactful. Each quote object:
   - "quote": The exact text.
   - "emotion": "positive" | "negative" | "neutral" (the speaker's tone).
   - "speaker_type": A short label (e.g., "founder", "marketer", "SME owner").

Return ONLY valid JSON. No markdown, no extra text.
  `.trim();

  const userPrompt = `
Respondent: ${context.persona || 'Unknown'}
Ecosystem: ${context.ecosystem || 'Unknown'}
Business stage: ${context.business_stage || 'Unknown'}

Raw responses:
${rawTexts}
  `.trim();

  console.log(`[extract] processing source ${sourceId}...`);
  const text = await callClaude(systemPrompt, userPrompt);
  const parsed = parseJSON(text);
  return validateExtractedData(parsed);
}

async function main() {
  console.log('[extract] fetching sources...');
  // Use id (auto-generated) instead of non-existent source_id
  const { data: sources, error } = await supabase
    .from('ghonsi_sources')
    .select('id, source_code, persona, ecosystem, business_stage, raw_text')
    .order('id');

  if (error) throw error;

  // Group by id (unique source row)
  const groups = {};
  for (const row of sources) {
    const key = row.id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const sourceIds = Object.keys(groups);
  console.log(`[extract] found ${sourceIds.length} unique sources`);

  // Get current max IDs for naming
  async function getMaxNumericId(table, idCol, prefix) {
    const { data, error } = await supabase
      .from(table)
      .select(idCol)
      .order(idCol, { ascending: false })
      .limit(1);
    if (error) throw error;
    const v = data?.[0]?.[idCol];
    if (!v || typeof v !== 'string') return 0;
    const m = v.match(new RegExp(`^${prefix}-(\\d+)$`));
    return m ? Number(m[1]) : 0;
  }

  let insightOffset = await getMaxNumericId('ghonsi_insights', 'insight_id', 'INS');
  let tagOffset = await getMaxNumericId('ghonsi_tags', 'id', 'TAG');
  let quoteOffset = await getMaxNumericId('ghonsi_quotes', 'quote_id', 'Q');

  console.log(`[extract] starting offsets: INS=${insightOffset}, TAG=${tagOffset}, Q=${quoteOffset}`);

  for (const sourceId of sourceIds) {
    const rows = groups[sourceId];

    try {
      const extracted = await extractFromSource(sourceId, rows, insightOffset, tagOffset, quoteOffset);

      // Insert insights and build mapping from local insight index -> global insight_id
      const insightIdByIndex = new Map();
      for (let i = 0; i < extracted.insights.length; i++) {
        const insight = extracted.insights[i];
        const insightId = `INS-${String(insightOffset + i + 1).padStart(3, '0')}`;
        insightIdByIndex.set(i, insightId);
        await insertInsight(parseInt(sourceId), insightId, insight);
        console.log(`[extract] ✓ insight ${insightId}`);
      }
      insightOffset += extracted.insights.length;

      // Insert tags (unique within this group). Build mapping from tag name -> global tag id
      const uniqueTagNames = Array.from(new Set(extracted.tags));
      
      // Insert tags and build mapping
const tagIdByName = new Map();
for (const tagName of uniqueTagNames) {
  const tagId = await insertTag(tagName);
  tagIdByName.set(tagName, tagId);
  console.log(`[extract] ✓ tag ${tagId}: ${tagName}`);
}

      // Insert insight_tags
      for (const mapping of extracted.insight_tags) {
        const insightIndex = mapping.insight_index;
        const tagName = mapping.tag;
        const insightId = insightIdByIndex.get(insightIndex);
        const tagId = tagIdByName.get(tagName);
        if (insightId && tagId) {
          await insertInsightTag(insightId, tagId);
          console.log(`[extract] ✓ insight_tag ${insightId} <-> ${tagName}`);
        }
      }

      // Insert quotes
      for (let i = 0; i < extracted.quotes.length; i++) {
        const quote = extracted.quotes[i];
        const quoteId = `Q-${String(quoteOffset + i + 1).padStart(3, '0')}`;
        await insertQuote(parseInt(sourceId), quoteId, quote);
        console.log(`[extract] ✓ quote ${quoteId}`);
      }
      quoteOffset += extracted.quotes.length;

      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[extract] error on source ${sourceId}:`, err.message);
    }
  }

  console.log('[extract] all done');
}

main().catch(console.error);