'use client';

import { useEffect, useState } from 'react';
import LoginScreen from '@/components/kundenzugang/LoginScreen';
import AdminShell from '@/components/kundenzugang/AdminShell';
import { useAuthStore } from '@/lib/kundenzugang-store';

export default function KundenzugangPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-[#0b0e0c]" />;

  return isAuthenticated ? <AdminShell /> : <LoginScreen />;
}
