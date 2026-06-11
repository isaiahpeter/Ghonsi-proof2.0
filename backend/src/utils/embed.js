// src/utils/embed.js
import { pipeline } from '@xenova/transformers';

let embedder;

async function getEmbedder() {
  if (!embedder) {
    console.log('[embed] Loading local model (all-MiniLM-L6-v2) …');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[embed] Model loaded');
  }
  return embedder;
}

export async function embedAndStore(content, metadata) {
  try {
    const pipe = await getEmbedder();
    const output = await pipe(content, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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

export async function embedQuery(text) {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}