
export interface PaymentInfo {
  monthKey: string; // "YYYY-MM"
  amount: number;
  status: "paid" | "unpaid";
  paidOn?: string | null; // ISO Date string
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  fatherName?: string;
  address?: string;
  joinDate: string; // ISO Date string
  photoUrl: string;
  payments: PaymentInfo[];
  monthlyFee: number;
  role: 'student' | 'admin';
  
  // New/Updated fields for detailed status tracking
  status: 'active' | 'inactive' | 'softDeleted' | 'deleted';
  canLogin: boolean;
  softDeleted: boolean; // For easier Firestore querying
  reactiveAllowed: boolean;
  dueDay: number; // Day of the month fee is due
  exitDate?: string | null; // ISO Date string
  lastRejoinDate?: string; // ISO Date string
}

export type NewStudent = Omit<Student, 
  'id' | 
  'photoUrl' | 
  'payments' | 
  'role' | 
  'status' | 
  'canLogin' | 
  'softDeleted' |
  'reactiveAllowed' |
  'dueDay' |
  'exitDate' |
  'lastRejoinDate'
> & { 
  name: string; 
  phone: string; 
  monthlyFee: number; 
  joinDate: string; 
};

export interface Approval {
  id: string;
  adminId: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string; // YYYY-MM-DD
}
