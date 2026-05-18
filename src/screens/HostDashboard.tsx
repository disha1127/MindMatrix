import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChargingPoint, Booking } from '../types';
import { Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function HostDashboard() {
  const { user } = useAuth();
  const [point, setPoint] = useState<ChargingPoint | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Get host's charging point
    const qPoint = query(collection(db, 'charging_points'), where('hostId', '==', user.uid));
    const unsubPoint = onSnapshot(qPoint, (snapshot) => {
      if (!snapshot.empty) {
        const pointData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ChargingPoint;
        setPoint(pointData);
      }
      setLoading(false);
    });

    // Get today's bookings
    const qBookings = query(collection(db, 'bookings'), where('hostId', '==', user.uid));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(docs);
    });

    return () => {
      unsubPoint();
      unsubBookings();
    };
  }, [user]);

  const toggleAvailability = async () => {
    if (!point) return;
    const newStatus = point.availabilityStatus === 'available' ? 'busy' : 'available';
    await updateDoc(doc(db, 'charging_points', point.id), {
      availabilityStatus: newStatus
    });
  };

  const totalEarnings = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!point) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
       <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
         <Zap className="w-10 h-10 text-slate-400" />
       </div>
       <h2 className="text-xl font-black text-slate-800 mb-2">No Station Listed</h2>
       <p className="text-slate-500 font-medium mb-8 text-sm">Listing is automatic upon joining the network in demo mode.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-slate-900 text-white p-8 shrink-0 rounded-b-[40px] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold tracking-tight">Host Panel</h1>
          <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse shadow-lg shadow-green-500/20">Live</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-lg font-black shadow-lg shadow-blue-500/20">
            {point.hostName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">{point.hostName}</div>
            <div className="text-xs text-white/50 font-medium uppercase tracking-widest">{point.address.split(',')[0]}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 space-y-6 overflow-y-auto pt-8 pb-32">
        <section className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between shadow-sm">
           <div className="text-sm font-black text-blue-900 uppercase tracking-tighter">Active Status</div>
           <button 
             onClick={toggleAvailability}
             className={cn(
               "w-14 h-7 rounded-full relative p-1 transition-colors duration-300",
               point.availabilityStatus === 'available' ? "bg-blue-600" : "bg-slate-300"
             )}
           >
              <motion.div 
                animate={{ x: point.availabilityStatus === 'available' ? 28 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-sm" 
              />
           </button>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm transition-transform hover:scale-105">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Today's Sales</div>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-sm">₹</span>{totalEarnings}
            </div>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm transition-transform hover:scale-105">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Riders</div>
            <div className="text-2xl font-black text-slate-900">
              {bookings.length < 10 ? `0${bookings.length}` : bookings.length}
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Bookings</h3>
            <span className="text-[10px] font-bold text-blue-600 cursor-pointer">View All History</span>
          </div>
          
          <div className="space-y-3">
            {bookings.length === 0 ? (
               <div className="bg-slate-50 p-10 rounded-[32px] border border-dashed border-slate-200 text-center flex flex-col items-center">
                  <Clock className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-400 italic">No bookings yet today</p>
               </div>
            ) : (
              bookings.map((b, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={b.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <UserIcon userId={b.userId} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs tracking-tight">Rider #{b.userId.slice(-4).toUpperCase()}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">11:30 AM - 12:30 PM</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    b.status === 'confirmed' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-300"
                  )} />
                </motion.div>
              ))
            )}
          </div>
        </section>

        <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative shadow-xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-20 h-20" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-white/60">Host Insights</h4>
          <p className="text-sm font-medium leading-relaxed mb-4">
            Riders prefer points with 15A sockets. Upgrade your listing to earn 30% more.
          </p>
          <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 border-b border-blue-400/30 pb-0.5">View Growth Tips</button>
        </div>
      </div>
    </div>
  );
}

function UserIcon({ userId }: { userId: string }) {
  return (
    <img 
      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} 
      className="w-full h-full rounded-2xl" 
      alt="User"
    />
  );
}
