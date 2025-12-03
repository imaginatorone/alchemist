const API = "http://127.0.0.1:8000"

export const requestCode = (email: string) =>
  fetch(`${API}/auth/request-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  }).then(r => r.json())

export const verifyCode = (email: string, code: string) =>
  fetch(`${API}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
    credentials: "include",
  }).then(r => r.json())