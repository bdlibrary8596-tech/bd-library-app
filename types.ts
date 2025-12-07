export interface PaymentInfo {
  month: number; // 1-12
  year: number;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  fatherName?: string;
  address?: string;
  joinDate: string; // YYYY-MM-DD
  photoUrl: string;
  payments: PaymentInfo[];
  lastPaymentDate: string | null; // YYYY-MM-DD - This can be deprecated or kept for quick reference
  monthlyFee: number;
  role: 'student' | 'admin';
  
  // New fields
  status: 'active' | 'inactive' | 'softDeleted' | 'deleted';
  leftDate?: string | null; // YYYY-MM-DD
  lastRejoinDate?: string; // YYYY-MM-DD
  canLogin: boolean;
  // FIX: Add optional softDeleted property to align with Firestore data model and fix type error.
  softDeleted?: boolean;
}

// FIX: Cleaned up Omit<> by removing deprecated 'isUnpaid' property and adding 'softDeleted'.
export type NewStudent = Omit<Student, 'id' | 'payments' | 'lastPaymentDate' | 'photoUrl' | 'role' | 'status' | 'leftDate' | 'lastRejoinDate' | 'canLogin' | 'softDeleted'> & { name: string; phone: string; monthlyFee: number; joinDate: string; };

export interface Approval {
  id: string;
  adminId: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string; // YYYY-MM-DD
}