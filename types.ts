
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
  status: 'active' | 'inactive';
  leftDate?: string; // YYYY-MM-DD
  lastRejoinDate?: string; // YYYY-MM-DD
  canLogin: boolean;
}

export type NewStudent = Omit<Student, 'id' | 'isUnpaid' | 'payments' | 'lastPaymentDate' | 'photoUrl' | 'role' | 'status' | 'leftDate' | 'lastRejoinDate' | 'canLogin'> & { name: string; phone: string; monthlyFee: number; joinDate: string; };

export interface Approval {
  id: string;
  adminId: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string; // YYYY-MM-DD
}
