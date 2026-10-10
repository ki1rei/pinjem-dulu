'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { login as loginRequest, getCurrentUser as getCurrentUserRequest } from '@/lib/api/auth';
import { AUTH_STORAGE_KEY } from '@/lib/constants';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => null,
  logout: () => null,
  hasRole: () => false,
});

/**
 * User shape yang disimpan di context (tanpa field sensitif, tanpa status_akun
 * karena status sudah divalidasi saat login/load sesi).
 */
function mapUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    nama: raw.nama,
    nim: raw.nim,
    email: raw.email,
    organisasi: raw.organisasi,
    role: raw.role,
  };
}

/**
 * Membaca user tersimpan di localStorage (aman terhadap SSR: cek window dulu).
 * @returns {{ user: object|null }}
 */
function readStoredUser() {
  if (typeof window === 'undefined') return { user: null };
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return { user: null };
    const parsed = JSON.parse(stored);
    if (!parsed || !parsed.id) return { user: null };
    return { user: parsed };
  } catch {
    return { user: null };
  }
}

function writeStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const AuthProvider = ({ children }) => {
  // Hydration-safe: inisial state null di server & render client pertama.
  // Efek berikutnya yang mengisi dari localStorage setelah mount.
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Baca sesi yang tersimpan (hanya setelah mount client, untuk
  // menghindari SSR mismatch).
  useEffect(() => {
    let mounted = true;
    const { user: stored } = readStoredUser();
    if (!stored) {
      if (mounted) setIsLoading(false);
      return;
    }

    // Step 2: Validasi sesi yang tersimpan (apakah user masih ada & aktif).
    // Jika gagal, bersihkan sesi.
    (async () => {
      try {
        const result = await getCurrentUserRequest(stored.id);
        if (!mounted) return;
        const next = mapUser(result?.user);
        if (next) {
          setUser(next);
        } else {
          writeStoredUser(null);
          setUser(null);
        }
      } catch {
        if (mounted) {
          writeStoredUser(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const result = await loginRequest(payload);
    const nextUser = mapUser(result.user);
    setUser(nextUser);
    writeStoredUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredUser(null);
  }, []);

  const hasRole = useCallback((role) => user?.role === role, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
