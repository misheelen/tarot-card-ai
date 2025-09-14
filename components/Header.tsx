
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="absolute top-4 right-4 z-20 flex items-center gap-4 animate-fade-in">
      <div className="text-right">
        <p className="text-sm text-amber-100/90">{user.name}</p>
        <p className="text-xs text-amber-100/60">{user.email}</p>
      </div>
      {user.picture && (
        <img src={user.picture} alt="User" className="w-10 h-10 rounded-full border-2 border-amber-300/50" />
      )}
      <button
        onClick={onLogout}
        className="bg-purple-600/50 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
      >
        Гарах
      </button>
    </header>
  );
};

export default Header;
