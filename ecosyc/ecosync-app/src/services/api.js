// Helper to get auth headers
// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper to handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || response.statusText);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (name, email, password, coordinates) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, coordinates })
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },
  
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Items API
export const itemsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/items`);
    return handleResponse(response);
  },
  
  getNearby: async (lng, lat, maxDistance = 5000, category = null) => {
    let url = `${API_BASE_URL}/items/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`;
    if (category) url += `&category=${category}`;
    const response = await fetch(url);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`);
    return handleResponse(response);
  },
  
  create: async (itemData) => {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },
  
  update: async (id, itemData) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Requests API
export const requestsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/requests`);
    return handleResponse(response);
  },
  
  getNearby: async (lng, lat, maxDistance = 5000) => {
    const response = await fetch(`${API_BASE_URL}/requests/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`);
    return handleResponse(response);
  },
  
  create: async (requestData) => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return handleResponse(response);
  },
  
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getUserTransactions: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
  },
  
  update: async (id, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
  },

  rate: async (id, ratingData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}/rate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(ratingData)
    });
    return handleResponse(response);
  }
};

// Users API
export const usersAPI = {
  getLeaderboard: async () => {
    const response = await fetch(`${API_BASE_URL}/users/leaderboard`);
    return handleResponse(response);
  },

  getProfile: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
  },
  
  updateProfile: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  updatePoints: async (id, points) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/points`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ points })
    });
    return handleResponse(response);
  }
};


// AI API
export const aiAPI = {
  getRecommendations: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getEcoInsights: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/insights`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getAchievementSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/achievement-summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  analyzeImage: async (imageBase64) => {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageBase64 })
    });
    return handleResponse(response);
  },
  
  getSmartBadges: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/smart-badges`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  chat: async (message) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(response);
  },
  
  getProfileSuggestions: async (partialProfile) => {
    const response = await fetch(`${API_BASE_URL}/ai/profile-suggestions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(partialProfile)
    });
    return handleResponse(response);
  }
};
