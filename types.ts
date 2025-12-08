
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
  status: 'active' | 'inactive' | 'softDeleted' | 'deleted';
  canLogin: boolean;
  softDeleted: boolean;
  reactiveAllowed: boolean;
  dueDay: number;
  exitDate?: string | null;
  lastRejoinDate?: string | null;
  // New fields for chat
  lastActive?: string; // ISO Date string
  blockedUserIds?: string[];
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
  'lastRejoinDate' |
  'lastActive' |
  'blockedUserIds'
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

// --- NEW TYPES FOR NEW FEATURES ---

export interface StoreItem {
    id: string;
    title: string;
    description: string;
    price: number;
    category: "notes" | "test-series" | "bundle" | "stationery";
    imageUrl: string;
    isActive: boolean;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
}

export interface Chat {
    id: string; // combination of participant IDs
    participants: string[];
    participantDetails: {
        [key: string]: { name: string; photoUrl: string; }
    };
    lastMessage?: { text: string; senderId: string; timestamp: string; };
    updatedAt: string; // ISO Date string
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string; // ISO Date string
    seenBy: string[];
}

export interface GameSession {
    id: string; // same as chatId
    players: { [key: string]: 'X' | 'O' }; // map studentId to symbol
    board: ('X' | 'O' | '')[];
    currentTurn: string; // studentId
    status: 'in-progress' | 'finished';
    winnerId?: string | null; // can be 'draw'
    updatedAt: string; // ISO Date string
}
