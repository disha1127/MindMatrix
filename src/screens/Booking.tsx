import React, { useState } from 'react';
import { ChevronLeft, Zap, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ChargingPoint } from '../types';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface BookingProps {
  point: ChargingPoint;
  onBack: () => void;
  onConfirm: () => void;
}

export default function Booking({ point, onBack, onConfirm }: BookingProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');

  const slots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        pointId: point.id,
        hostId: point.hostId,
        slotTime: serverTimestamp(),
        duration: 1,
        totalPrice: point.pricePerHour,
        status: 'confirmed',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 text-center font-medium mb-8">
          Your slot is reserved at {point.hostName}. Navigate to the location to start charging.
        </p>
        <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-sm font-bold text-slate-400">HOST</span>
            <span className="font-bold text-slate-800">{point.hostName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-slate-400">TIME SLOT</span>
            <span className="font-bold text-slate-800">{selectedSlot}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-8 pt-16 pb-8 rounded-b-[40px] shadow-sm">
        <button onClick={onBack} className="mb-6 p-2 -ml-2 text-slate-400 hover:text-slate-800">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Slot</h1>
        <p className="text-slate-500 font-medium tracking-tight italic">Confirm your 1-hour session info</p>
      </div>

      <div className="flex-1 p-8 overflow-y-auto space-y-8">
        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select Start Time</h3>
          <div className="grid grid-cols-3 gap-3">
            {slots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "py-3 rounded-2xl text-xs font-black transition-all border",
                  selectedSlot === slot 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" 
                    : "bg-white text-slate-600 border-slate-200"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-[32px] border border-slate-100 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-bottom border-slate-50">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Host Point</p>
              <p className="font-bold text-slate-800">{point.hostName}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Duration</span>
              <span className="font-bold text-slate-800">1 Hour Slot</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Socket Type</span>
              <span className="font-bold text-slate-800">{point.socketType} Socket</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Price</span>
              <span className="font-bold text-blue-600">₹{point.pricePerHour}.00</span>
            </div>
          </div>
        </section>

        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-green-600 mt-1 shrink-0" />
          <div>
            <h4 className="font-black text-green-800 text-sm mb-1 uppercase tracking-tighter">Charging Benefit</h4>
            <p className="text-sm font-medium text-green-700/80 leading-snug">
              An 1-hour charge via {point.socketType} will gain approximately <span className="font-bold text-green-900">45-60 km</span> of extra range for your vehicle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-4 text-slate-400">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium">Please arrive 5 mins early. Payment is handled directly at the host shop.</p>
        </div>
      </div>

      <div className="p-8 pb-32">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
          {!loading && <CheckCircle2 className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}
