/**
 * BISaarthi Frontend API Client for Phase 7B FastAPI Integration.
 */

import {
  ChatRequest,
  ChatResponse,
  CompareStandardsRequest,
  CompareStandardsResponse,
  StandardDetailsResponse,
  StandardSearchResponse,
} from '@/types';

function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (!raw) {
    return 'http://localhost:8000/api';
  }
  if (!raw.endsWith('/api')) {
    return `${raw}/api`;
  }
  return raw;
}

const API_BASE_URL = getApiBaseUrl();

export class APIError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Generic fetch wrapper with timeout, JSON parsing, and unified error mapping.
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;

      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
          errorCode = errorData.error.code;
        } else if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to HTTP status text
      }

      throw new APIError(errorMessage, response.status, errorCode);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    const msg = error instanceof Error ? error.message : 'Network request failed';
    throw new APIError(
      msg.includes('Failed to fetch') || msg.includes('NetworkError')
        ? 'Unable to connect to BISaarthi backend. Please verify the backend is running.'
        : msg,
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * 1. Health check
 */
export async function getHealth(): Promise<{ status: string; service: string }> {
  return fetchAPI<{ status: string; service: string }>('/health');
}

/**
 * 2. Search / list authoritative standards from 100-standard corpus
 */
export async function searchStandards(params: {
  q?: string;
  category?: string;
  is_number?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<StandardSearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.q?.trim()) queryParams.append('q', params.q.trim());
  if (params.category?.trim()) queryParams.append('category', params.category.trim());
  if (params.is_number?.trim()) queryParams.append('is_number', params.is_number.trim());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());

  const queryString = queryParams.toString();
  const endpoint = `/standards${queryString ? `?${queryString}` : ''}`;

  return fetchAPI<StandardSearchResponse>(endpoint, { method: 'GET' });
}

/**
 * 3. Retrieve authoritative standard detail by IS number or ID
 */
export async function getStandardDetails(
  isNumberOrId: string | number
): Promise<StandardDetailsResponse> {
  const identifier = encodeURIComponent(String(isNumberOrId).trim());
  return fetchAPI<StandardDetailsResponse>(`/standards/${identifier}`, {
    method: 'GET',
  });
}

/**
 * 3b. Retrieve enriched multi-tab official BIS standard details
 */
export async function getOfficialStandardDetails(
  isNumberOrId: string | number
): Promise<import('@/types').OfficialStandardDetailDocument> {
  const identifier = encodeURIComponent(String(isNumberOrId).trim());
  return fetchAPI<import('@/types').OfficialStandardDetailDocument>(`/standards/${identifier}/official-details`, {
    method: 'GET',
  });
}

/**
 * 4. Compare two standards from the authoritative MVP corpus
 */
export async function compareStandards(
  request: CompareStandardsRequest
): Promise<CompareStandardsResponse> {
  return fetchAPI<CompareStandardsResponse>('/standards/compare', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 5. Submit a question to the context-grounded AI Chatbot
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 6. User Authentication: Login
 */
export async function loginUser(payload: { email: string; password: string }): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  user: import('@/context/AuthContext').AuthUser;
}> {
  return fetchAPI<{
    access_token: string;
    token_type: string;
    expires_in: number;
    user: import('@/context/AuthContext').AuthUser;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 7. User Authentication: Register / Signup
 */
export async function registerUser(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  user: import('@/context/AuthContext').AuthUser;
}> {
  return fetchAPI<{
    access_token: string;
    token_type: string;
    expires_in: number;
    user: import('@/context/AuthContext').AuthUser;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 8. User Authentication: Get Profile
 */
export async function getCurrentUser(token: string): Promise<import('@/context/AuthContext').AuthUser> {
  return fetchAPI<import('@/context/AuthContext').AuthUser>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 9. Update User Preferences
 */
export async function updateUserPreferences(
  payload: { preferred_language?: string; theme?: string; name?: string },
  token: string
): Promise<import('@/context/AuthContext').AuthUser> {
  return fetchAPI<import('@/context/AuthContext').AuthUser>('/auth/me/preferences', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * 10. Saved Standards: Get List
 */
export async function getSavedStandards(token: string, page = 1, pageSize = 20): Promise<{
  items: Array<{
    id: number;
    user_id: string;
    standard_is_number: string;
    saved_at: string;
    notes?: string;
    standard?: {
      is_number: string;
      title: string;
      status: string;
      scope?: string;
      categories?: string[];
    };
  }>;
  total: number;
  page: number;
  page_size: number;
}> {
  return fetchAPI<{
    items: Array<{
      id: number;
      user_id: string;
      standard_is_number: string;
      saved_at: string;
      notes?: string;
      standard?: {
        is_number: string;
        title: string;
        status: string;
        scope?: string;
        categories?: string[];
      };
    }>;
    total: number;
    page: number;
    page_size: number;
  }>(`/standards/saved?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 11. Saved Standards: Save / Bookmark
 */
export async function saveStandardApi(
  isNumber: string,
  token: string
): Promise<{ status: string; is_number: string; message: string }> {
  const identifier = encodeURIComponent(isNumber.trim());
  return fetchAPI<{ status: string; is_number: string; message: string }>(`/standards/${identifier}/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 12. Saved Standards: Unsave / Delete
 */
export async function deleteSavedStandardApi(
  isNumber: string,
  token: string
): Promise<{ status: string; is_number: string; message: string }> {
  const identifier = encodeURIComponent(isNumber.trim());
  return fetchAPI<{ status: string; is_number: string; message: string }>(`/standards/${identifier}/save`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 13. Conversations: List user conversations
 */
export async function getConversations(
  token: string,
  page = 1,
  pageSize = 20
): Promise<{
  items: Array<{
    id: string;
    user_id: string;
    title: string;
    preview?: string;
    message_count: number;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
}> {
  return fetchAPI(`/conversations?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 14. Conversations: Create new conversation thread
 */
export async function createConversation(
  payload: { title?: string; initial_message?: string },
  token: string
): Promise<{
  id: string;
  user_id: string;
  title: string;
  messages: Array<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    source_refs?: any[];
    verification_status?: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}> {
  return fetchAPI('/conversations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * 15. Conversations: Get conversation thread details
 */
export async function getConversationDetails(
  conversationId: string,
  token: string
): Promise<{
  id: string;
  user_id: string;
  title: string;
  messages: Array<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    source_refs?: any[];
    verification_status?: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}> {
  return fetchAPI(`/conversations/${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 16. Conversations: Delete conversation thread
 */
export async function deleteConversationApi(
  conversationId: string,
  token: string
): Promise<void> {
  return fetchAPI(`/conversations/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 17. Conversations: Append message to conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  payload: {
    role: string;
    content: string;
    source_refs?: any[];
    verification_status?: string;
  },
  token: string
): Promise<{
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  source_refs?: any[];
  verification_status?: string;
  created_at: string;
}> {
  return fetchAPI(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

