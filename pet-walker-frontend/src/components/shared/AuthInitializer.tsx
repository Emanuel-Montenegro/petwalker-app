"use client";
import { useAuthInit } from '../../lib/store/useAuthInit';

const AuthInitializer = () => {
  useAuthInit();
  return null;
};

export default AuthInitializer;