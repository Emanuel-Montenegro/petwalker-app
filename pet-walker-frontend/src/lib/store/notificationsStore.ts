import { create } from 'zustand';
import { Notification } from '../../types/index';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notis: Notification[]) => void;
  addNotification: (noti: Notification) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notis) => set({
    notifications: notis,
    unreadCount: notis.filter(n => !n.leida).length,
  }),
  addNotification: (noti) => set((state) => ({
    notifications: [noti, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, leida: true })),
    unreadCount: 0,
  })),
})); 