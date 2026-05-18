import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Splash from './screens/Splash';
import Home from './screens/Home';
import HostProfile from './screens/HostProfile';
import Booking from './screens/Booking';
import RangeCalculator from './screens/RangeCalculator';
import HostDashboard from './screens/HostDashboard';
import Navbar from './components/layout/Navbar';
import { ChargingPoint } from './types';
import { Zap } from 'lucide-react';

function AppContent() {
  const { profile } = useAuth();
  const [screen, setScreen] = useState<string>('splash');
  const [selectedPoint, setSelectedPoint] = useState<ChargingPoint | null>(null);

  const navigate = (to: string, params?: any) => {
    if (params?.point) setSelectedPoint(params.point);
    setScreen(to);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <Splash onContinue={() => navigate('home')} />;
      case 'home':
        return <Home onSelectPoint={(point) => navigate('host-profile', { point })} />;
      case 'host-profile':
        return selectedPoint ? (
          <HostProfile point={selectedPoint} onBack={() => navigate('home')} onBook={() => navigate('booking')} />
        ) : <Home onSelectPoint={(point) => navigate('host-profile', { point })} />;
      case 'booking':
        return selectedPoint ? (
          <Booking point={selectedPoint} onBack={() => navigate('host-profile')} onConfirm={() => navigate('home')} />
        ) : <Home onSelectPoint={(point) => navigate('host-profile', { point })} />;
      case 'range':
        return <RangeCalculator />;
      case 'dashboard':
        return <HostDashboard />;
      default:
        return <Home onSelectPoint={(point) => navigate('host-profile', { point })} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden shadow-2xl relative font-sans text-slate-800">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">EV-Grama <span className="text-blue-600">Charge</span></h1>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Community Grid</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-tight">Demo Mode</div>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        {renderScreen()}
      </main>
      
      {screen !== 'splash' && (
        <Navbar 
          currentScreen={screen} 
          onNavigate={navigate} 
          userRole={profile?.role || 'rider'} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
