import { embedQuery } from './embed.js';
import { query } from '../db/connection.js';

export async function searchInsights(searchText, limit = 5) {
  const embedding = await embedQuery(searchText);

  const result = await query(
    `SELECT chunk_text, embedding <=> $1 AS similarity
     FROM ghonsi_embeddings
     WHERE chunk_text IS NOT NULL
     ORDER BY similarity ASC
     LIMIT $2`,
    [embedding, limit]
  );

  return result.rows;
}