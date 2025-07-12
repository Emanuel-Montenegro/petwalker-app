import { Notification } from '../../types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export const fetchNotifications = async (token: string): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('[Frontend] Error al obtener notificaciones:', data);
    throw new Error('Error al obtener notificaciones');
  }
  return data;
};

export const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Error al marcar notificaciones como leídas');
  }
}; 