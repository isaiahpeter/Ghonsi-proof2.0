import 'dotenv/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { embedAndStore } from '../src/utils/embed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

console.log('[ingest] SUPABASE_URL:', process.env.SUPABASE_URL);

const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length) {
  console.error('[ingest] Missing environment variables:', missing.join(', '));
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ingestInsights() {
  console.log('[ingest] fetching insights...');

  const { data: insights, error } = await supabase
    .from('ghonsi_insights')
    .select(`
      insight_id,
      insight,
      evidence_strength,
      actionability,
      source_id,
      ghonsi_sources ( id, source_code, source_type, persona, ecosystem ),
      ghonsi_insight_tags ( ghonsi_tags ( tag_name ) )
    `);

  if (error) {
    console.error('[ingest] fetch failed:', error.message);
    return;
  }

  console.log(`[ingest] embedding ${insights.length} insights...`);

  for (const row of insights) {
    const tags = (row.ghonsi_insight_tags || [])
      .map(t => t.ghonsi_tags?.tag_name)
      .filter(Boolean);

    const source = Array.isArray(row.ghonsi_sources) ? row.ghonsi_sources[0] : row.ghonsi_sources;

    // Fetch a representative quote for this source
    const { data: quotes } = await supabase
      .from('ghonsi_quotes')
      .select('quote, speaker_type')
      .eq('source_id', row.source_id)
      .limit(1);

    const quote = quotes?.[0];

    const content = [
      `INSIGHT: ${row.insight}`,
      `EVIDENCE: ${row.evidence_strength}`,
      `ACTIONABILITY: ${row.actionability}`,
      `SOURCE TYPE: ${source?.source_type || 'unknown'}`,
      `PERSONA: ${source?.persona || 'unknown'}`,
      `ECOSYSTEM: ${source?.ecosystem || 'unknown'}`,
      `TAGS: ${tags.join(', ')}`,
      quote ? `PRACTITIONER QUOTE: "${quote.quote}" — ${quote.speaker_type}` : null,
    ].filter(Boolean).join('\n');

    await embedAndStore(content, {
      source_type: 'insight',
      category: 'consumer_behaviour',
      tags,
      persona: source?.persona || null,
      ecosystem: source?.ecosystem || null,
      source_table: 'ghonsi_insights',
      source_row_id: String(row.insight_id),
    });

    await new Promise(r => setTimeout(r, 300));
    console.log(`[ingest] ✓ ${row.insight_id}`);
  }

  console.log('[ingest] insights complete');
}

async function ingestQuotes() {
  console.log('[ingest] fetching quotes...');

  const { data: quotes, error } = await supabase
    .from('ghonsi_quotes')
    .select('*');

  if (error) {
    console.error('[ingest] quotes fetch failed:', error.message);
    return;
  }

  console.log(`[ingest] embedding ${quotes.length} quotes...`);

  for (const row of quotes) {
    const content = [
      `PRACTITIONER QUOTE: "${row.quote}"`,
      `EMOTION: ${row.emotion}`,
      `SPEAKER TYPE: ${row.speaker_type}`,
    ].join('\n');

    await embedAndStore(content, {
      source_type: 'quote',
      category: 'practitioner_voice',
      source_table: 'ghonsi_quotes',
      source_row_id: String(row.quote_id),
    });

    await new Promise(r => setTimeout(r, 300));
    console.log(`[ingest] ✓ quote ${row.quote_id}`);
  }

  console.log('[ingest] quotes complete');
}

// Run
await ingestInsights();
await ingestQuotes();
console.log('[ingest] all done');