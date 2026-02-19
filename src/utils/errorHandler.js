/**
 * Parse error message from API response
 * Handles multiple error formats:
 * 1. Object with field errors: { "field_name": ["Error message"] }
 * 2. Array of messages: ["Error message"]
 * 3. Array with prefixed messages: ["message: Error message"]
 * 4. String error
 */
export const parseErrorMessage = (errorMessage) => {
  if (!errorMessage) return "An error occurred";

  // Handle string errors
  if (typeof errorMessage === 'string') {
    return errorMessage;
  }

  // Handle array errors
  if (Array.isArray(errorMessage)) {
    const messages = errorMessage.map(msg => {
      if (typeof msg === 'string') {
        // Remove "message: " prefix if present
        return msg.replace(/^message:\s*/i, '');
      }
      return String(msg);
    });
    return messages.join(', ');
  }

  // Handle object errors (field validation errors)
  if (typeof errorMessage === 'object' && errorMessage !== null) {
    // Check for non_field_errors first
    if (errorMessage.non_field_errors && Array.isArray(errorMessage.non_field_errors)) {
      return errorMessage.non_field_errors.map(msg => 
        typeof msg === 'string' ? msg.replace(/^message:\s*/i, '') : String(msg)
      ).join(', ');
    }

    // Handle nested message object
    if (errorMessage.message) {
      if (Array.isArray(errorMessage.message)) {
        return errorMessage.message.map(msg => 
          typeof msg === 'string' ? msg.replace(/^message:\s*/i, '') : String(msg)
        ).join(', ');
      }
      if (typeof errorMessage.message === 'string') {
        return errorMessage.message.replace(/^message:\s*/i, '');
      }
    }

    // Handle field-specific errors
    const fieldErrors = [];
    for (const [field, errors] of Object.entries(errorMessage)) {
      if (Array.isArray(errors)) {
        const errorTexts = errors.map(msg => 
          typeof msg === 'string' ? msg.replace(/^message:\s*/i, '') : String(msg)
        );
        // Format as "Field: error message" or just "error message" if it contains the field name
        const errorText = errorTexts.join(', ');
        if (errorText.toLowerCase().includes(field.toLowerCase())) {
          fieldErrors.push(errorText);
        } else {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          fieldErrors.push(`${fieldName}: ${errorText}`);
        }
      } else if (typeof errors === 'string') {
        const errorText = errors.replace(/^message:\s*/i, '');
        if (errorText.toLowerCase().includes(field.toLowerCase())) {
          fieldErrors.push(errorText);
        } else {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          fieldErrors.push(`${fieldName}: ${errorText}`);
        }
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }
  }

  // Fallback
  return "An error occurred";
};

/**
 * Extract error message from API error response
 * Handles different response structures
 */
export const getErrorMessage = (error, defaultMessage = "An error occurred") => {
  // Check if error has response with ErrorMessage
  if (error?.response?.ErrorMessage) {
    return parseErrorMessage(error.response.ErrorMessage);
  }

  // Check for direct ErrorMessage
  if (error?.ErrorMessage) {
    return parseErrorMessage(error.ErrorMessage);
  }

  // Check for standard error response data
  if (error?.response?.data) {
    if (error.response.data.ErrorMessage) {
      return parseErrorMessage(error.response.data.ErrorMessage);
    }
    if (error.response.data.message) {
      return parseErrorMessage(error.response.data.message);
    }
    if (error.response.data.error) {
      return parseErrorMessage(error.response.data.error);
    }
  }

  // Check for direct error message
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  return defaultMessage;
};
