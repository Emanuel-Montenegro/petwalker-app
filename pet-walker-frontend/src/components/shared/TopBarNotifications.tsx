"use client";
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/lib/store/notificationsStore';

export default function TopBarNotifications() {
  const { notifications, unreadCount, markAllAsRead } = useNotificationsStore();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) markAllAsRead();
  };

  return (
    <>
      {/* Icon */}
      <button
        onClick={toggle}
        className="hidden md:inline-flex fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-md transition-colors border border-gray-200 dark:border-gray-700"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="hidden md:block">
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-4 top-16 w-80 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-2xl z-50 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notificaciones
            </h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tienes notificaciones</p>
            ) : (
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    {n.mensaje}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
} 