import React from 'react';
import { Home, Battery, LayoutDashboard, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (to: string) => void;
  userRole: 'rider' | 'host';
}

export default function Navbar({ currentScreen, onNavigate, userRole }: NavbarProps) {
  const { signOut } = useAuth();

  const tabs = [
    { id: 'home', icon: Home, label: 'Search' },
    { id: 'range', icon: Battery, label: 'Range' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Host' },
  ];

  const { setRole } = useAuth();

  return (
    <nav className="absolute bottom-6 left-6 right-6 bg-white border border-slate-200 rounded-[28px] shadow-2xl flex items-center justify-around py-2 px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'dashboard') {
                setRole('host');
              } else if (tab.id === 'home' || tab.id === 'range') {
                setRole('rider');
              }
              onNavigate(tab.id);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-300",
              isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive && "fill-white")} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActive ? "text-white" : "text-slate-400"
            )}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
