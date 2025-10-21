/**
 * API Helper functions for robust API calls with retry logic
 */

/**
 * Fetch with automatic retry logic
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise} - Response from fetch
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3, retryDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);

      const response = await fetch(url, options);

      // Si la respuesta es OK (200-299), retornar inmediatamente
      if (response.ok) {
        return response;
      }

      // Si es un error del cliente (400-499), no reintentar
      if (response.status >= 400 && response.status < 500) {
        console.warn(`[fetchWithRetry] Client error ${response.status}, not retrying`);
        return response;
      }

      // Si es un error del servidor (500-599), reintentar
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
        console.warn(`[fetchWithRetry] Server error ${response.status}, will retry`);
      }

    } catch (error) {
      // Errores de red (timeout, conexión perdida, etc.)
      lastError = error;
      console.warn(`[fetchWithRetry] Network error on attempt ${attempt + 1}:`, error.message);
    }

    // Si no es el último intento, esperar antes de reintentar
    if (attempt < maxRetries) {
      const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
      console.log(`[fetchWithRetry] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`[fetchWithRetry] All ${maxRetries + 1} attempts failed for ${url}`);
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Helper para llamadas API con autenticación y manejo de errores
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options
 * @param {object} config - Configuration object
 * @param {boolean} config.requireAuth - Whether to include auth token (default: true)
 * @param {number} config.maxRetries - Maximum retry attempts (default: 2)
 * @param {Function} config.onError - Error callback
 * @returns {Promise<object>} - Parsed JSON response
 */
export async function apiCall(url, options = {}, config = {}) {
  const {
    requireAuth = true,
    maxRetries = 2,
    onError = null,
    retryDelay = 1000
  } = config;

  // Preparar headers con autenticación si es necesario
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      const error = new Error('No authentication token found');
      if (onError) onError(error);
      throw error;
    }
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetchWithRetry(url, fetchOptions, maxRetries, retryDelay);

    // Intentar parsear JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn('[apiCall] Failed to parse JSON response:', parseError);
      data = { success: false, error: 'Invalid JSON response' };
    }

    // Si la respuesta no es OK, tratar como error
    if (!response.ok) {
      const error = new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;

      if (onError) onError(error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('[apiCall] Error:', error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Helper específico para GET requests
 */
export async function apiGet(url, config = {}) {
  return apiCall(url, { method: 'GET' }, config);
}

/**
 * Helper específico para POST requests
 */
export async function apiPost(url, body = {}, config = {}) {
  return apiCall(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }, config);
}

/**
 * Helper específico para PUT requests
 */
export async function apiPut(url, body = {}, config = {}) {
  return apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, config);
}

/**
 * Helper específico para DELETE requests
 */
export async function apiDelete(url, config = {}) {
  return apiCall(url, { method: 'DELETE' }, config);
}
