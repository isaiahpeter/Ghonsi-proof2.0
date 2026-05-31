/**
 * Smart Tags Utility
 * 
 * Extracts and saves AI-powered tags for proofs to enable better
 * categorization, search, and discovery.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Extract and save smart tags for a proof
 * 
 * @param {string} proofId - The proof UUID
 * @param {object} proofData - Proof data containing name, type, summary, etc.
 * @returns {Promise<string[]>} Array of extracted tags
 */
export const extractAndSaveSmartTags = async (proofId, proofData) => {
  try {
    const response = await fetch(`${API_URL}/api/proofs/${proofId}/smart-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proofName: proofData.proof_name || proofData.proofName,
        proofType: proofData.proof_type || proofData.proofType,
        summary: proofData.summary,
        extractedData: proofData.extracted_data || proofData.extractedData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract tags: ${response.statusText}`);
    }

    const result = await response.json();
    return result.tags || [];
  } catch (error) {
    console.error('[Smart Tags] Extraction error:', error);
    return [];
  }
};

/**
 * Search proofs by tags
 * 
 * @param {string[]} tags - Array of tags to search for
 * @param {boolean} matchAll - If true, proof must have ALL tags. If false, ANY tag matches.
 * @returns {Promise<object[]>} Array of matching proofs
 */
export const searchProofsByTags = async (tags, matchAll = false) => {
  try {
    const response = await fetch(`${API_URL}/api/proofs/search-by-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags, matchAll }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search by tags: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Smart Tags] Search error:', error);
    return [];
  }
};

/**
 * Get all unique tags from the database
 * 
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<string[]>} Array of unique tags
 */
export const getAllUniqueTags = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('smart_tags')
      .not('smart_tags', 'is', null);

    if (error) throw error;

    // Flatten and deduplicate tags
    const allTags = data.flatMap(proof => proof.smart_tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    return uniqueTags;
  } catch (error) {
    console.error('[Smart Tags] Get unique tags error:', error);
    return [];
  }
};

/**
 * Get tag statistics (count of proofs per tag)
 * 
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<object[]>} Array of {tag, count} objects
 */
export const getTagStatistics = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('smart_tags')
      .not('smart_tags', 'is', null);

    if (error) throw error;

    // Count occurrences of each tag
    const tagCounts = {};
    data.forEach(proof => {
      (proof.smart_tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('[Smart Tags] Get tag statistics error:', error);
    return [];
  }
};

/**
 * Get user's most common tags
 * 
 * @param {object} supabase - Supabase client instance
 * @param {string} userId - User UUID
 * @param {number} limit - Maximum number of tags to return
 * @returns {Promise<object[]>} Array of {tag, count} objects
 */
export const getUserTopTags = async (supabase, userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('smart_tags')
      .eq('user_id', userId)
      .not('smart_tags', 'is', null);

    if (error) throw error;

    // Count occurrences of each tag
    const tagCounts = {};
    data.forEach(proof => {
      (proof.smart_tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array, sort by count, and limit
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('[Smart Tags] Get user top tags error:', error);
    return [];
  }
};
