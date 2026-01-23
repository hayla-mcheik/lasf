export const useApi = () => {
  const baseURL = 'http://localhost:8000/api' // Update with your API URL
  
  const request = async (endpoint, options = {}) => {
    const { useAuth = true, ...fetchOptions } = options
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
    
    // Add auth token if available
    if (useAuth) {
      const auth = useAuthStore()
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }
    }
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...fetchOptions,
        headers
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
  
  return {
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
  }
}