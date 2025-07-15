import { Mascota } from "@/types"; // Importamos el tipo Mascota

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export async function fetchUserPets(): Promise<Mascota[]> {
  try {
    const response = await fetch(`${API_URL}/mascotas/me`, {
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
export async function createPet(petData: any) {
  try {

    const response = await fetch(`${API_URL}/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify(petData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear la mascota');
    }

    return response.json();
  } catch (error) {
    console.error('Error creando mascota:', error);
    throw error;
  }
}

export async function updatePet(id: number, petData: any) {
  const response = await fetch(`${API_URL}/mascotas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar la mascota');
  }

  return response.json();
}

export async function deletePet(id: number) {
  const response = await fetch(`${API_URL}/mascotas/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar la mascota');
  }

  return response.json();
}

// Podemos añadir más funciones aquí para actualizar o eliminar mascotas. 