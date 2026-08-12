import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import apiServerClient from '@/lib/apiServerClient.js';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Admin auth is decided by the API, never in the browser.
//
// This previously compared the submitted values against VITE_ADMIN_EMAIL /
// VITE_ADMIN_PASSWORD and minted its own unsigned base64 "token". Vite inlines
// VITE_* into the public bundle, so making that work at all would have meant
// publishing the admin password to every visitor — and the token it produced
// was forgeable from the browser console. Credentials now live only on the API
// service, which returns an HMAC-signed token.
export const adminAuth = {
  login: async (email, password) => {
    let res;
    try {
      res = await apiServerClient.fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Could not reach the server. Please try again.');
    }

    if (res.status === 503) {
      throw new Error('Admin login is not configured on the server.');
    }
    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const { token } = await res.json();
    if (!token) throw new Error('Invalid credentials');

    localStorage.setItem('admin_token', token);
    return token;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
  },

  getToken: () => localStorage.getItem('admin_token'),

  // Cheap local check for rendering only — it reads the unverified payload to
  // avoid showing a logged-in shell with an obviously expired token. It is NOT
  // a security boundary: the signature is only ever checked by the API, which
  // rejects anything forged regardless of what this returns.
  isLoggedIn: () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    try {
      const [encodedPayload] = token.split('.');
      const payload = JSON.parse(atob(encodedPayload));
      if (!payload?.exp || Date.now() > payload.exp) {
        localStorage.removeItem('admin_token');
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem('admin_token');
      return false;
    }
  },

  // Real check — asks the API to verify the signature.
  verify: async () => {
    const token = adminAuth.getToken();
    if (!token) return false;
    try {
      const res = await apiServerClient.fetch('/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('admin_token');
        return false;
      }
      return true;
    } catch {
      return false; // network blip — don't destroy a possibly-valid session
    }
  },
};
