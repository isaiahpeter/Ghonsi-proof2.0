/**
 * Form Persistence Utility
 * Handles saving and retrieving form data using localStorage with automatic cleanup
 */

const FORM_DATA_PREFIX = 'form_data_';
const FORM_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save form data to localStorage
 * @param {string} formName - Unique identifier for the form
 * @param {object} data - Form data to save
 */
export const saveFormData = (formName, data) => {
  try {
    const key = `${FORM_DATA_PREFIX}${formName}`;
    const payload = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    console.log(`Form data saved for ${formName}`);
  } catch (error) {
    console.error(`Error saving form data for ${formName}:`, error);
  }
};

/**
 * Retrieve form data from localStorage
 * @param {string} formName - Unique identifier for the form
 * @returns {object|null} - Form data if valid and not expired, null otherwise
 */
export const getFormData = (formName) => {
  try {
    const key = `${FORM_DATA_PREFIX}${formName}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }

    const payload = JSON.parse(stored);
    const isExpired = Date.now() - payload.timestamp > FORM_EXPIRY_TIME;

    if (isExpired) {
      localStorage.removeItem(key);
      console.log(`Form data expired for ${formName}`);
      return null;
    }

    console.log(`Form data retrieved for ${formName}`);
    return payload.data;
  } catch (error) {
    console.error(`Error retrieving form data for ${formName}:`, error);
    return null;
  }
};

/**
 * Clear form data from localStorage
 * @param {string} formName - Unique identifier for the form
 */
export const clearFormData = (formName) => {
  try {
    const key = `${FORM_DATA_PREFIX}${formName}`;
    localStorage.removeItem(key);
    console.log(`Form data cleared for ${formName}`);
  } catch (error) {
    console.error(`Error clearing form data for ${formName}:`, error);
  }
};

/**
 * Clear all form data from localStorage
 */
export const clearAllFormData = () => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(FORM_DATA_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`All form data cleared`);
  } catch (error) {
    console.error(`Error clearing all form data:`, error);
  }
};
