const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Call:', url, options.method || 'GET');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log('API Response:', url, data);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data.data || data;
  } catch (error) {
    console.error('API Error:', endpoint, error);
    throw error;
  }
};

// Auth APIs - Firebase Integration
export const createUserProfile = async (userData, token) => {
  return apiCall('/users/firebase-register', {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const syncFirebaseUser = async (firebaseUid, userData) => {
  return apiCall('/users/sync', {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, ...userData }),
  });
};

export const getUserProfile = async () => {
  return apiCall('/users/profile');
};

export const updateUserProfile = async (profileData) => {
  return apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

// Skills APIs
export const getSkills = async (category = '', search = '') => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  return apiCall(`/skills?${params.toString()}`);
};

export const createSkill = async (skillData) => {
  return apiCall('/skills', {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
};

// Trades APIs
export const getTrades = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.role) params.append('role', filters.role);
  
  return apiCall(`/trades?${params.toString()}`);
};

export const getTradeById = async (tradeId) => {
  return apiCall(`/trades/${tradeId}`);
};

export const createTrade = async (tradeData) => {
  return apiCall('/trades', {
    method: 'POST',
    body: JSON.stringify(tradeData),
  });
};

export const startTrade = async (tradeId) => {
  return apiCall(`/trades/${tradeId}/start`, {
    method: 'PUT',
  });
};

export const completeTrade = async (tradeId, data = {}) => {
  return apiCall(`/trades/${tradeId}/complete`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const cancelTrade = async (tradeId, reason) => {
  return apiCall(`/trades/${tradeId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
};

export const rateTrade = async (tradeId, rating) => {
  return apiCall(`/trades/${tradeId}/rate`, {
    method: 'PUT',
    body: JSON.stringify(rating),
  });
};

// Coins APIs
export const getCoinBalance = async () => {
  return apiCall('/coins/balance');
};

export const getTransactions = async (type = '', limit = 50) => {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('limit', limit);
  
  return apiCall(`/coins/transactions?${params.toString()}`);
};

// Users APIs
export const getUsers = async () => {
  return apiCall('/users');
};

// Posts APIs
export const getPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.skill) params.append('skill', filters.skill);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit);
  
  return apiCall(`/posts?${params.toString()}`);
};

export const getPostById = async (postId) => {
  return apiCall(`/posts/${postId}`);
};

export const getMyPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  
  return apiCall(`/posts/my?${params.toString()}`);
};

export const createPost = async (postData) => {
  return apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const updatePost = async (postId, postData) => {
  return apiCall(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (postId) => {
  return apiCall(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const incrementPostView = async (postId) => {
  return apiCall(`/posts/${postId}/view`, {
    method: 'POST',
  });
};

export const togglePostInterest = async (postId) => {
  return apiCall(`/posts/${postId}/interest`, {
    method: 'POST',
  });
};

// Trade Proposals APIs
export const createProposal = async (proposalData) => {
  return apiCall('/trade-proposals/propose', {
    method: 'POST',
    body: JSON.stringify(proposalData),
  });
};

export const getSentProposals = async (status = '') => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  return apiCall(`/trade-proposals/sent?${params.toString()}`);
};

export const getReceivedProposals = async (status = '') => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  return apiCall(`/trade-proposals/received?${params.toString()}`);
};

export const acceptProposal = async (proposalId, data = {}) => {
  return apiCall(`/trade-proposals/${proposalId}/accept`, {
    method: 'PUT',
    body: JSON.stringify({
      responseMessage: data.message || 'Proposal accepted!',
      coinAmount: data.coinAmount || 50,
      duration: data.duration || 60,
    }),
  });
};

export const rejectProposal = async (proposalId, message = '') => {
  return apiCall(`/trade-proposals/${proposalId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ message }),
  });
};

export const scheduleSession = async (proposalId, sessionData) => {
  return apiCall(`/trade-proposals/${proposalId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
};

export const completeSession = async (proposalId, sessionId) => {
  return apiCall(`/trade-proposals/${proposalId}/sessions/${sessionId}/complete`, {
    method: 'PUT',
  });
};

// Feed APIs
export const getPersonalizedFeed = async (page = 1, limit = 30) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  return apiCall(`/feed?${params.toString()}`);
};

export const getTrendingPosts = async (limit = 10) => {
  const params = new URLSearchParams();
  params.append('limit', limit);
  
  return apiCall(`/feed/trending?${params.toString()}`);
};

export const getRecentPosts = async (page = 1, limit = 30) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  return apiCall(`/feed/recent?${params.toString()}`);
};

// Messaging APIs
export const getConversations = async () => {
  return apiCall('/messages/conversations');
};

export const createConversation = async (recipientId, relatedData = {}) => {
  return apiCall('/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ recipientId, ...relatedData }),
  });
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  
  return apiCall(`/messages/conversations/${conversationId}/messages?${params.toString()}`);
};

export const sendMessage = async (conversationId, content, attachments = []) => {
  return apiCall(`/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, attachments }),
  });
};

export const getUnreadCount = async () => {
  return apiCall('/messages/unread-count');
};

export const deleteMessage = async (messageId) => {
  return apiCall(`/messages/${messageId}`, {
    method: 'DELETE',
  });
};

export const archiveConversation = async (conversationId) => {
  return apiCall(`/messages/conversations/${conversationId}/archive`, {
    method: 'PUT',
  });
};

// Courses APIs
export const getCourses = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.skill) params.append('skill', filters.skill);
  if (filters.category) params.append('category', filters.category);
  if (filters.level) params.append('level', filters.level);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit);
  
  return apiCall(`/courses?${params.toString()}`);
};

export const getCourseById = async (courseId) => {
  // Return full response to get hasAccess field
  const response = await apiCall(`/courses/${courseId}`);
  // apiCall returns data.data || data, but we need the full response
  // So we need to make a direct fetch call here
  try {
    const url = `${API_BASE_URL}/courses/${courseId}`;
    const token = localStorage.getItem('token');
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch course');
    }
    
    return data; // Return full response with hasAccess field
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const getMyCourses = async () => {
  return apiCall('/courses/my/created');
};

export const getUserCourses = async (userId) => {
  return apiCall(`/courses/instructor/${userId}`);
};

export const createCourse = async (courseData) => {
  return apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });
};

export const updateCourse = async (courseId, courseData) => {
  return apiCall(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });
};

export const deleteCourse = async (courseId) => {
  return apiCall(`/courses/${courseId}`, {
    method: 'DELETE',
  });
};

export const publishCourse = async (courseId) => {
  return apiCall(`/courses/${courseId}/publish`, {
    method: 'PUT',
  });
};

export const enrollInCourse = async (courseId) => {
  return apiCall(`/courses/${courseId}/enroll`, {
    method: 'POST',
  });
};

export const rateCourse = async (courseId, rating, review = '') => {
  return apiCall(`/courses/${courseId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  });
};

export const generateUrduDubbing = async (courseId, videoId, urduScript) => {
  return apiCall(`/courses/${courseId}/videos/${videoId}/dub`, {
    method: 'POST',
    body: JSON.stringify({ urduScript }),
  });
};

// Trades APIs
export const getMyTrades = async () => {
  return apiCall('/trades');
};

export const updateTradeStatus = async (tradeId, status) => {
  return apiCall(`/trades/${tradeId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};
