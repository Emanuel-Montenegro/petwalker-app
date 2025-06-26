import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {

  return (
    <div className="flex flex-col items-center bg-gray-50">

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 text-center bg-white shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            El Cuidado que tu Mascota Merece,
            <br className="hidden md:inline"/> Con Total Tranquilidad para Ti.
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Conecta con paseadores verificados, sigue cada paso de tu mejor amigo en tiempo real,
            y asegúrate de que recibe el mejor cuidado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-accent hover:bg-green-600">
                ¡Quiero Registrarme!
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-white">
                Ya tengo una cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-primary mb-12">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Regístrate</h3>
              <p className="text-gray-600">Crea tu perfil como dueño o paseador.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Encuentra</h3>
              <p className="text-gray-600">Dueños encuentran paseadores verificados cerca.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Disfruta</h3>
              <p className="text-gray-600">Sigue el paseo en vivo y califica el servicio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Verified Caregivers */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <div className="w-full h-64 md:h-80 bg-gray-300 flex items-center justify-center text-gray-600">Placeholder Imagen 1</div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">Paseadores de Confianza, Siempre.</h2>
            <p className="text-lg text-gray-700 mb-4">
              Seleccionamos cuidadosamente a cada paseador, verificando su identidad y credenciales.
              Tu mascota estará en manos expertas y responsables.
            </p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Verificación de identidad rigurosa.</li>
              <li>Historial de servicios y calificaciones.</li>
              <li>Posibilidad de ver certificados y cursos.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Section: Real-Time Tracking (Alternating Layout) */}
      <section className="w-full py-20 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">Monitoreo en Vivo del Paseo.</h2>
            <p className="text-lg text-gray-700 mb-4">
              Sigue la ubicación de tu paseador y el recorrido exacto de tu mascota en tiempo real
              a través de nuestro mapa interactivo.
            </p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Mapa interactivo con geolocalización.</li>
              <li>Historial de rutas completadas.</li>
              <li>Tranquilidad total desde donde estés.</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <div className="w-full h-64 md:h-80 bg-gray-300 flex items-center justify-center text-gray-600">Placeholder Imagen 2 (Mapa)</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-primary mb-12">Lo Que Dicen Nuestros Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-left">
              <p className="text-gray-700 italic mb-4">"Increíble servicio! Pude seguir todo el paseo de mi perro en tiempo real y el paseador fue muy amable. Totalmente recomendado."</p>
              <p className="text-gray-800 font-semibold">Ana G. - Dueña de Max</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-left">
              <p className="text-gray-700 italic mb-4">"Encontré paseos fácilmente cerca de mi zona y el sistema de pago es muy práctico. Me siento segura dejando a mi gato a cargo."</p>
              <p className="text-gray-800 font-semibold">Carlos R. - Dueño de Luna</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="w-full py-20 md:py-24 text-center bg-primary text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Listo para Darle el Mejor Paseo a tu Mascota?</h2>
          <p className="text-xl mb-10">Únete a nuestra comunidad de dueños y paseadores responsables.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-accent hover:bg-green-600 text-white">
                ¡Crear mi Cuenta Ahora!
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg font-semibold border-white text-white hover:bg-white hover:text-primary">
                Ya soy Miembro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Basic Placeholder) */}
      <footer className="w-full py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Paseo Seguro y Profesional. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
