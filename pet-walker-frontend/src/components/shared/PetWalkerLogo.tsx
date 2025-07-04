"use client";
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useRef, memo } from 'react';

interface PetWalkerLogoProps {
  className?: string;
  size?: number;
}

const PetWalkerLogo = memo(function PetWalkerLogo({ className = "", size = 32 }: PetWalkerLogoProps) {
  const { isAuthenticated, usuario } = useAuthStore();
  const router = useRouter();
  const pawRef = useRef<HTMLSpanElement>(null);

  const handleClick = () => {
    // Animación bounce con detención automática
    if (pawRef.current) {
      pawRef.current.classList.remove('animate-bounce');
      void pawRef.current.offsetWidth;
      pawRef.current.classList.add('animate-bounce');
      setTimeout(() => {
        if (pawRef.current) {
          pawRef.current.classList.remove('animate-bounce');
        }
      }, 1000);
    }
    // Navegación
    if (isAuthenticated && usuario) {
      if (usuario.rol === 'DUENO') router.push('/dashboard');
      else if (usuario.rol === 'PASEADOR') router.push('/dashboard/paseos');
      else if (usuario.rol === 'ADMIN') router.push('/dashboard/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <button
      className={`flex items-center gap-2 group select-none focus:outline-none ${className}`}
      onClick={handleClick}
      aria-label="Ir a inicio o dashboard"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') handleClick(); }}
    >
      <span
        ref={pawRef}
        className="inline-block transition-transform duration-200 group-hover:rotate-12 group-active:scale-110"
      >
        {/* SVG Patita redondeada */}
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="16" cy="24" rx="7" ry="5" fill="#16a34a" />
          <ellipse cx="7.5" cy="14" rx="2.5" ry="3.5" fill="#16a34a" />
          <ellipse cx="24.5" cy="14" rx="2.5" ry="3.5" fill="#16a34a" />
          <ellipse cx="11" cy="8.5" rx="2" ry="2.5" fill="#16a34a" />
          <ellipse cx="21" cy="8.5" rx="2" ry="2.5" fill="#16a34a" />
        </svg>
      </span>
      <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text tracking-tight">
        Pet Walker
      </span>
    </button>
  );
});

export default PetWalkerLogo; 