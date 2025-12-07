
export interface Payment {
  [date: string]: number;
}

export interface Student {
  id: string;
  name: string;
  mobile: string;
  joinDate: string; // YYYY-MM-DD
  photoUrl: string;
  payments: Payment;
  lastPaymentDate: string | null; // YYYY-MM-DD
  monthlyFee: number;
  isUnpaid: boolean;
}

export type NewStudent = Omit<Student, 'id' | 'isUnpaid' | 'payments' | 'lastPaymentDate' | 'photoUrl'>

export interface Approval {
  id: string;
  adminId: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string; // YYYY-MM-DD
}