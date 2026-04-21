// Central API client for the AWAAZ backend
// All fetch calls go through here so tokens are always included

const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('awaaz_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  
  const contentType = res.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.error(`Non-JSON response from ${path}:`, text.slice(0, 200));
    throw new Error(`Server returned non-JSON response (${res.status}). Ensure the backend is running and the endpoint exists.`);
  }

  if (!res.ok) {
    throw new Error(data?.message || `API error (${res.status})`);
  }
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function register(name, email, password, role) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  if (data.token) localStorage.setItem('awaaz_token', data.token);
  if (data.user)  localStorage.setItem('awaaz_user', JSON.stringify(data.user));
  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) localStorage.setItem('awaaz_token', data.token);
  if (data.user)  localStorage.setItem('awaaz_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('awaaz_token');
  localStorage.removeItem('awaaz_user');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('awaaz_user');
  return u ? JSON.parse(u) : null;
}

export async function getMyProfile() {
  return apiFetch('/auth/me');
}

export async function getAllUsers() {
  return apiFetch('/auth/users');
}

export async function updateProfile(data) {
  const result = await apiFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (result.user) {
    localStorage.setItem('awaaz_user', JSON.stringify(result.user));
  }
  return result;
}

// ─── Payments & Blockchain Ledger ──────────────────────────────────────────────

/**
 * Initiates a Stripe Checkout session for funding a project.
 */
export async function createCheckoutSession(projectId, amount) {
  return apiFetch('/payments/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ projectId, amount }),
  });
}

/**
 * Verifies the Stripe session after user is redirected back.
 */
export async function verifyPaymentSession(sessionId) {
  return apiFetch('/payments/verify-session', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

/**
 * Fetches the public cryptographic ledger.
 */
export async function getLedger(projectId = null) {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiFetch(`/payments/ledger${query}`);
}

// ─── Problems ────────────────────────────────────────────────────────────────
export async function getProblems() {
  return apiFetch('/problems');
}

export async function createProblem(problemData) {
  return apiFetch('/problems', {
    method: 'POST',
    body: JSON.stringify(problemData),
  });
}

export async function upvoteProblem(id) {
  return apiFetch(`/problems/${id}/upvote`, { method: 'POST' });
}

// Admin moderation
export async function getFlaggedProblems() {
  return apiFetch('/problems/flagged');
}

export async function approveProblem(id) {
  return apiFetch(`/problems/${id}/approve`, { method: 'PATCH' });
}

export async function deleteProblem(id) {
  return apiFetch(`/problems/${id}`, { method: 'DELETE' });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function getProjects() {
  return apiFetch('/projects');
}

export async function getProject(id) {
  return apiFetch(`/projects/${id}`);
}

export async function getProjectByProblem(problemId) {
  return apiFetch(`/projects/problem/${problemId}`);
}

export async function createProject(problemId, fundingGoal, milestones) {
  return apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({ problemId, fundingGoal, milestones }),
  });
}

export async function fundProject(id, amount) {
  // Original method (might still be used for internal transfers)
  return apiFetch(`/projects/${id}/fund`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function addMilestone(id, milestoneData) {
  return apiFetch(`/projects/${id}/milestone`, {
    method: 'POST',
    body: JSON.stringify(milestoneData),
  });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
export async function checkHealth() {
  return apiFetch('/health');
}
