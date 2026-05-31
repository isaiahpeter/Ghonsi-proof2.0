/**
 * Extraction API Integration
 * Handles communication with the document extraction service
 */

if (!process.env.NEXT_PUBLIC_EXTRACTION_API_URL) {
  console.error('NEXT_PUBLIC_EXTRACTION_API_URL is not defined in environment variables');
}

const API_URL = process.env.NEXT_PUBLIC_EXTRACTION_API_URL 
  ? `${process.env.NEXT_PUBLIC_EXTRACTION_API_URL}/api/extract/`
  : null;

/**
 * Map UI proof types to API proof types
 */
export const proofTypeMapping = {
  'certificates': 'certificate',
  'job_history': 'job',
  'skills': 'skill',
  'milestones': 'milestone',
  'community_contributions': 'contribution',
};

/**
 * Check if a proof type supports extraction
 */
export const supportsExtraction = (proofType) => {
  return proofType in proofTypeMapping;
};

/**
 * Normalize the extracted_data fields into a consistent shape that
 * upload.jsx can use regardless of proof type.
 *
 * Always returns: { title, summary, raw }
 *   title   → used to pre-fill the "Proof Name" input
 *   summary → used to pre-fill the "Summary" textarea
 *   raw     → the full extracted_data object, stored as extractedData in the DB
 */
const normalizeExtractedData = (proofType, extractedData) => {
  if (!extractedData) return { title: null, summary: null, raw: null };

  switch (proofType) {
    case 'certificate': {
      const title = extractedData.certificate_title || null;
      const parts = [
        extractedData.issuer && `Issuer: ${extractedData.issuer}`,
        extractedData.credential_type && `Type: ${extractedData.credential_type}`,
        extractedData.program_category && `Category: ${extractedData.program_category}`,
        extractedData.completion_date && `Completed: ${extractedData.completion_date}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData };
    }

    case 'job': {
      const title = extractedData.job_title
        ? `${extractedData.job_title}${extractedData.company ? ` at ${extractedData.company}` : ''}`
        : null;
      const parts = [
        extractedData.employment_type && `Type: ${extractedData.employment_type}`,
        extractedData.date_range && `Period: ${extractedData.date_range}`,
        extractedData.location && `Location: ${extractedData.location}`,
        extractedData.job_category && `Category: ${extractedData.job_category}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData };
    }

    case 'skill': {
      const skills = extractedData.skills;
      const skillList = Array.isArray(skills) && skills.length > 0
        ? skills.join(', ')
        : extractedData.skill_name || null;
      const title = skillList ? `Skills: ${skillList}` : null;
      const parts = [
        extractedData.skill_category && `Category: ${extractedData.skill_category}`,
        extractedData.proficiency_level && `Level: ${extractedData.proficiency_level}`,
        extractedData.evidence_type && `Evidence: ${extractedData.evidence_type}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData };
    }

    case 'milestone': {
      const title = extractedData.milestone_type
        ? `${extractedData.milestone_type}${extractedData.issuer ? ` from ${extractedData.issuer}` : ''}`
        : null;
      const summary = extractedData.milestone_summary || null;
      return { title, summary, raw: extractedData };
    }

    case 'contribution': {
      const title = extractedData.title || extractedData.contribution_type || null;
      const parts = [
        extractedData.platform_name && `Platform: ${extractedData.platform_name}`,
        extractedData.date && `Date: ${extractedData.date}`,
        extractedData.url && `URL: ${extractedData.url}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData };
    }

    default:
      return { title: null, summary: null, raw: extractedData };
  }
};

/**
 * Extract data from a document using the extraction API.
 *
 * Returns a normalized object: { title, summary, raw, needsReview, flaggedFields, validationHash }
 * or null if extraction fails.
 */
export const extractDocumentData = async (file, proofType) => {
  if (!supportsExtraction(proofType)) {
    console.log(`Extraction not supported for proof type: ${proofType}`);
    return null;
  }

  const apiProofType = proofTypeMapping[proofType];

  const formData = new FormData();
  formData.append('file', file);
  formData.append('proof_type', apiProofType);

  // Abort after 60 seconds — Render cold start + OCR + LLM can easily cross 40s
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    if (!API_URL) {
      throw new Error('Extraction API URL is not configured. Please set NEXT_PUBLIC_EXTRACTION_API_URL in your .env file');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Extraction failed with status ${response.status}`
      );
    }

    // API envelope: { proof_type, extracted_data, needs_review, flagged_fields, validation_hash, cached }
    const envelope = await response.json();
    const normalized = normalizeExtractedData(apiProofType, envelope.extracted_data);

    return {
      ...normalized,                          // title, summary, raw
      needsReview: envelope.needs_review,
      flaggedFields: envelope.flagged_fields,
      validationHash: envelope.validation_hash,
      cached: envelope.cached,
    };    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Extraction request timed out');
      // Return null instead of throwing to allow proof creation to continue without extracted data
      return null;
    }
    console.error('Extraction error:', error);
    throw error;
  }
};

/**
 * Get the API proof type from UI proof type
 */
export const getApiProofType = (proofType) => {
  return proofTypeMapping[proofType] || proofType;
};