import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export const adminAuth = {
  login: async (email, password) => {
    if (
      email === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      const token = btoa(JSON.stringify({
        email,
        exp: Date.now() + 86400000 // 24 hours
      }));
      localStorage.setItem('admin_token', token);
      return token;
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    localStorage.removeItem('admin_token');
  },

  getToken: () => localStorage.getItem('admin_token'),

  isLoggedIn: () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token));
      if (Date.now() > payload.exp) {
        localStorage.removeItem('admin_token');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  verify: async () => {
    return adminAuth.isLoggedIn();
  },
};
