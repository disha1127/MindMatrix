import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, getDocs } from 'firebase/firestore';
import { MapPin, Search as SearchIcon, Filter, Zap, Star, RefreshCcw } from 'lucide-react';
import { db, getDistance } from '../lib/firebase';
import { ChargingPoint } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  onSelectPoint: (point: ChargingPoint) => void;
}

export default function Home({ onSelectPoint }: HomeProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState<ChargingPoint[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Get real location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          // Default to a central rural Bihar coord for demo if denied
          setUserLocation({ lat: 25.6, lng: 85.1 });
        }
      );
    }
  }, []);

  // Listen to data
  useEffect(() => {
    const q = query(collection(db, 'charging_points'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChargingPoint));
      setPoints(docs);
      setLoading(false);
      
      // Seed data if empty (for demo)
      if (docs.length === 0 && !loading) {
        seedMockData();
      }
    });
    return unsubscribe;
  }, [loading]);

  const seedMockData = async () => {
    if (!user) return;
    
    // Check again to be super safe against race conditions
    const existing = await getDocs(query(collection(db, 'charging_points')));
    if (!existing.empty) return;

    const mockPoints = [
      {
        hostId: user.uid, // Associate this one with current user for dashboard demo
        hostName: 'Ram Sharan Kirana Store',
        address: 'Bishunpur, Main Market Road',
        latitude: userLocation?.lat || 25.6,
        longitude: userLocation?.lng ? userLocation.lng + 0.005 : 85.105,
        socketType: '15A',
        pricePerHour: 20,
        availabilityStatus: 'available',
        contactNumber: '+91 9876543210',
        description: 'Large space for parking. Accessible 24/7.',
        rating: 4.8
      },
      {
        hostId: 'host2',
        hostName: 'Kumar Electricals',
        address: 'Hajipur Highway, Near Petrol Pump',
        latitude: userLocation?.lat ? userLocation.lat + 0.01 : 25.61,
        longitude: userLocation?.lng ? userLocation.lng + 0.012 : 85.12,
        socketType: '5A',
        pricePerHour: 15,
        availabilityStatus: 'available',
        contactNumber: '+91 9123456789',
        description: 'Authorized local electrician. Safe charging.',
        rating: 4.5
      },
      {
        hostId: 'host3',
        hostName: 'Sita Devi Residency',
        address: 'Station Road, Ward No. 4',
        latitude: userLocation?.lat ? userLocation.lat - 0.01 : 25.59,
        longitude: userLocation?.lng ? userLocation.lng - 0.01 : 85.09,
        socketType: '15A',
        pricePerHour: 25,
        availabilityStatus: 'available',
        contactNumber: '+91 8888888888',
        description: 'Home charging socket available in veranda.',
        rating: 4.9
      }
    ];

    for (const p of mockPoints) {
      await addDoc(collection(db, 'charging_points'), p);
    }
  };

  const calculateDistanceDisplay = (p: ChargingPoint) => {
    if (!userLocation) return '...';
    const dist = getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
    return dist.toFixed(1);
  };

  const filteredPoints = React.useMemo(() => {
    return points
      .map(p => ({
        ...p,
        distance: userLocation ? getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude) : 999
      }))
      .filter(p => {
        if (filter === 'all') return true;
        if (filter === 'available') return p.availabilityStatus === 'available';
        if (filter === '15A') return p.socketType === '15A';
        if (filter === 'cheap') return p.pricePerHour <= 15;
        return true;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [points, filter, userLocation]);

  return (
    <div className="flex flex-col h-full">
      {/* Map Mock Header */}
      <div className="h-64 bg-slate-200 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center grayscale opacity-80 contrast-125"></div>
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
        
        {/* Animated Pins */}
        {filteredPoints.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute"
            style={{ 
              top: `${40 + Math.sin(i * 1.5) * 20}%`, 
              left: `${40 + Math.cos(i * 1.5) * 30}%` 
            }}
          >
            <div className={cn(
              "p-2 rounded-full shadow-lg border-2 border-white",
              p.availabilityStatus === 'available' ? "bg-green-500" : "bg-red-500"
            )}>
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
          </motion.div>
        ))}

        {/* Current Location mock */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-2">
          <div className="flex-1 bg-white rounded-2xl shadow-xl flex items-center px-4 py-3 border border-slate-100">
            <SearchIcon className="w-5 h-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search local shops..." 
              className="bg-transparent border-none outline-none text-slate-700 w-full font-medium"
            />
          </div>
          <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-600">
            <RefreshCcw className="w-5 h-5" onClick={() => window.location.reload()} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nearby Hosts</span>
          <div className="w-5 h-5 rounded-full bg-slate-200/50 flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {['all', 'available', '15A', 'cheap'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold capitalize whitespace-nowrap transition-all",
                filter === f ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-500 border border-slate-200"
              )}
            >
              {f === 'all' ? 'Discovery' : f}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <RefreshCcw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">Scanning Grid...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPoints.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectPoint(p)}
                  className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl shrink-0 flex items-center justify-center relative border border-slate-100 group-hover:scale-105 transition-transform">
                    <span className="text-xl">🏪</span>
                    {p.availabilityStatus === 'available' && (
                      <div className="absolute -top-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shadow-green-500/20"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate pr-2 tracking-tight">{p.hostName}</h3>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[9px] font-bold text-slate-600">{p.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium mb-3">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate uppercase tracking-tight">{p.address.split(',')[0]} • {calculateDistanceDisplay(p)} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-100">
                          {p.socketType} Socket
                        </span>
                      </div>
                      <p className="font-black text-slate-900 text-sm">
                        ₹{p.pricePerHour}<span className="text-[9px] font-bold text-slate-400 ml-0.5 italic">/hr</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
