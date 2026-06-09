import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const OPENROUTER_EMBED_URL = 'https://openrouter.ai/api/v1/embeddings';
const FREE_EMBED_MODEL = 'nvidia/llama-nemotron-embed-vl-1b-v2:free';

// ------------------------------------------------------------
// Supabase client
// ------------------------------------------------------------
function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!process.env.SUPABASE_URL || !serviceKey) {
    throw new Error('[embed] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return createClient(process.env.SUPABASE_URL, serviceKey);
}

// ------------------------------------------------------------
// Store a content embedding + metadata
// ------------------------------------------------------------
export async function embedAndStore(content, metadata) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[embed] OPENROUTER_API_KEY not set – skipping embed');
    return;
  }

  try {
    const response = await fetch(OPENROUTER_EMBED_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FREE_EMBED_MODEL,
        input: [
          { content: [{ type: 'text', text: content }] }
        ],
        encoding_format: 'float',
      }),
    });

    const json = await response.json();
    const embedding = json.data?.[0]?.embedding;
    if (!embedding) {
      console.error('[embed] No embedding returned:', JSON.stringify(json).slice(0, 300));
      return;
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('ghonsi_embeddings')
      .insert({
        chunk_text: content,
        embedding: embedding,
        source_id: metadata.source_id,
        source_type: metadata.source_type,
        category: metadata.category,
        tags: metadata.tags,
        persona: metadata.persona,
        ecosystem: metadata.ecosystem,
        source_table: metadata.source_table,
        source_row_id: metadata.source_row_id,
      });

    if (error) console.error('[embed] Insert error:', error.message);
  } catch (err) {
    console.error('[embed] Silent failure:', err.message);
  }
}

// ------------------------------------------------------------
// Generate an embedding for a search query
// ------------------------------------------------------------
export async function embedQuery(text) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('[embedQuery] OPENROUTER_API_KEY not set');

  const response = await fetch(OPENROUTER_EMBED_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: FREE_EMBED_MODEL,
      input: [
        { content: [{ type: 'text', text: text }] }
      ],
      encoding_format: 'float',
    }),
  });

  const json = await response.json();
  if (!json.data?.[0]?.embedding) {
    throw new Error('[embedQuery] Failed: ' + JSON.stringify(json));
  }
  return json.data[0].embedding;
}