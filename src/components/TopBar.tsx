import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface TopBarProps {
  user: Profile | null;
}

export default function TopBar({ user }: TopBarProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button aria-label="Notifications" className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.full_name || 'User'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">{user?.full_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">Role: {user?.role}</p>
              </div>

              <button onClick={() => navigate('/' + user?.role.toLowerCase() + '/profile')} className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100">
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
