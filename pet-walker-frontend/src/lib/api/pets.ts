import { Mascota } from "@/types"; // Importamos el tipo Mascota

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export async function fetchUserPets(): Promise<Mascota[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/mascotas/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la lista de mascotas');
    }

    const pets: Mascota[] = await response.json();
    return pets; // Esperamos un array de objetos Mascota

  } catch (error) {
    console.error('Error fetching user pets:', error);
    throw error; // Relanzar el error
  }
}

// Nueva función para crear una mascota
export async function createPet(petData: Omit<Mascota, 'id' | 'usuarioId'>): Promise<Mascota> {
    try {
      const response = await fetch(`${API_BASE_URL}/mascotas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la mascota');
      }
  
      const newPet: Mascota = await response.json();
      return newPet; // Esperamos el objeto Mascota creada del backend
  
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error; // Relanzar el error
    }
  }

// Podemos añadir más funciones aquí para actualizar o eliminar mascotas. 