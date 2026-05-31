import { supabase } from '@/lib/supabaseClient';

/**
 * Domain Questions API
 */

/**
 * Save domain questions responses for hirers
 */
export const saveDomainQuestions = async (userId, responses) => {
  const { data, error } = await supabase
    .from('domain_questions_hirers')
    .upsert(
      {
        user_id: userId,
        platform_usage: responses.platformUsage,
        marketing_types: responses.marketingTypes,
        other_marketing_type: responses.otherMarketingType || null,
        hiring_for: responses.hiringFor,
        evaluation_criteria: responses.evaluationCriteria,
      },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get domain questions responses for a hirer
 */
export const getDomainQuestions = async (userId) => {
  const { data, error } = await supabase
    .from('domain_questions_hirers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Check if hirer has completed domain questions
 */
export const hasDomainQuestions = async (userId) => {
  const { data } = await supabase
    .from('domain_questions_hirers')
    .select('id')
    .eq('user_id', userId)
    .single();
  return !!data;
};

/**
 * Save domain questions responses for professionals
 */
export const saveDomainQuestionsProfessionals = async (userId, responses) => {
  const payload = {
    user_id: userId,
    platform_usage: responses.platformUsage,
    market_industry: responses.marketIndustry,
    other_industry: responses.otherIndustry || null,
    state_region: responses.stateRegion,
    other_state_region: responses.otherStateRegion || null,
    end_consumer: responses.endConsumer,
  };

  // Try insert first
  const { data: insertData, error: insertError } = await supabase
    .from('domain_questions_professionals')
    .insert(payload)
    .select()
    .single();

  // If insert succeeds, return data
  if (!insertError) return insertData;

  // If duplicate key error, try update
  if (insertError.code === '23505') {
    const { data: updateData, error: updateError } = await supabase
      .from('domain_questions_professionals')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updateData;
  }

  // Other errors
  throw insertError;
};

/**
 * Get domain questions responses for a professional
 */
export const getDomainQuestionsProfessionals = async (userId) => {
  const { data, error } = await supabase
    .from('domain_questions_professionals')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Check if professional has completed domain questions
 */
export const hasDomainQuestionsProfessionals = async (userId) => {
  const { data } = await supabase
    .from('domain_questions_professionals')
    .select('id')
    .eq('user_id', userId)
    .single();
  return !!data;
};
