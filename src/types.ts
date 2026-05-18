export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'rider' | 'host';
}

export interface ChargingPoint {
  id: string;
  hostId: string;
  hostName: string;
  address: string;
  latitude: number;
  longitude: number;
  socketType: '5A' | '15A';
  pricePerHour: number;
  availabilityStatus: 'available' | 'busy';
  contactNumber: string;
  description?: string;
  rating: number;
}

export interface Booking {
  id: string;
  userId: string;
  pointId: string;
  hostId: string;
  slotTime: any; // Firestore Timestamp
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
}
