'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getUnreadCount } from '@/utils/messagesApi';

function NotificationWidget() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        const count = await getUnreadCount(user.id);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  if (!isAuthenticated || unreadCount === 0) return null;

  return (
    <div
      onClick={() => router.push('/message')}
      className="fixed bottom-6 right-6 z-50 bg-[#C19A4A] text-[#0B0F1B] px-4 py-3 rounded-lg shadow-lg cursor-pointer hover:bg-[#D4AB58] transition-all flex items-center gap-3 animate-[slideIn_0.3s_ease-out]"
    >
      <div className="relative">
        <Bell size={20} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      </div>
      <span className="text-sm font-semibold">
        {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
      </span>
    </div>
  );
}

export default NotificationWidget;
