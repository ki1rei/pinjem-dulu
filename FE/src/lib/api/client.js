import axios from 'axios';

/** Axios client untuk backend terpisah. Base URL dari env. */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

export function isMockEnabled() {
  return (process.env.NEXT_PUBLIC_USE_MOCK ?? 'true') === 'true';
}

export function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
