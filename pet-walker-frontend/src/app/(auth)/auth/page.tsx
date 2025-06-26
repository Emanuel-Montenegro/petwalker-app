import { useState } from 'react';
import PetWalkerLogo from '@/components/shared/PetWalkerLogo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const handleToggle = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <PetWalkerLogo className="mb-8" size={48} />
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Contenedor deslizante */}
        <div className={`flex w-[200%] h-full transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-1/2'}`}>
          {/* Panel de Login */}
          <div className="w-1/2 flex">
            {/* Formulario de Login */}
            <div className="w-3/5 p-8 flex flex-col justify-center">
              {/* ... existing login form ... */}
            </div>
            {/* Panel lateral de Login */}
            <div className="w-2/5 bg-gradient-to-br from-primary to-accent text-white p-8 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4">¡Hola de nuevo!</h2>
              <p className="text-center mb-6 opacity-90">Para mantenerte conectado con nosotros, inicia sesión con tu información personal</p>
              <button
                onClick={handleToggle}
                className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
              >
                Registrarse
              </button>
            </div>
          </div>
          {/* Panel de Registro */}
          <div className="w-1/2 flex">
            {/* Panel lateral de Registro */}
            <div className="w-2/5 bg-gradient-to-br from-accent to-primary text-white p-8 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4">¡Bienvenido!</h2>
              <p className="text-center mb-6 opacity-90">Ingresa tus datos personales y comienza tu viaje con nosotros</p>
              <button
                onClick={handleToggle}
                className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-accent transition-all duration-300"
              >
                Iniciar Sesión
              </button>
            </div>
            {/* Formulario de Registro */}
            <div className="w-3/5 p-8 flex flex-col justify-center">
              {/* ... existing register form ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ... existing code ... 