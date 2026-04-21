const API_URL = "https://painel-pecuario-api.onrender.com";

let _token = null;

export function setToken(token) {
  _token = token;
}

export function clearToken() {
  _token = null;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (_token) {
    headers.Authorization = `Bearer ${_token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.error || "Falha na requisição.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => request("/api/auth/me"),

  changePassword: (currentPassword, newPassword) =>
    request("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getData: () => request("/api/data"),

  saveData: (payload, baseRevision) =>
    request("/api/data", {
      method: "POST",
      body: JSON.stringify({ payload, baseRevision }),
    }),

  getUsers: () => request("/api/users"),

  createUser: (username, password, role) =>
    request("/api/users", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    }),

  deleteUser: (id) =>
    request(`/api/users/${id}`, { method: "DELETE" }),
};
