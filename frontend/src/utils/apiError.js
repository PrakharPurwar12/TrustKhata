function extractFirstFieldError(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const firstKey = Object.keys(data)[0];
  if (!firstKey) {
    return null;
  }

  const firstValue = data[firstKey];

  if (Array.isArray(firstValue) && firstValue.length > 0) {
    return firstValue[0];
  }

  if (typeof firstValue === 'string' && firstValue.trim()) {
    return firstValue;
  }

  return null;
}

export function parseApiError(error) {
  if (error?.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (typeof data === 'object') {
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }

      if (data.error?.message) {
        return data.error.message;
      }

      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail;
      }

      const firstFieldError = extractFirstFieldError(data);
      if (firstFieldError) {
        return firstFieldError;
      }

      return JSON.stringify(data);
    }

    return String(data);
  }

  return 'Network error. Please try again.';
}

export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  const parsedMessage = parseApiError(error);

  if (parsedMessage === 'Network error. Please try again.' && fallbackMessage) {
    return fallbackMessage;
  }

  return parsedMessage || fallbackMessage;
}
