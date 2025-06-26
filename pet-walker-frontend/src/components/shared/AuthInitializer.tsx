"use client";
import { useAuthInit } from '@/lib/store/useAuthInit';

export default function AuthInitializer() {
  useAuthInit();
  return null;
} 