
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Student } from '../types';

// Helper function to calculate unpaid status, based on the logic from useStudentData.ts
const checkUnpaidStatus = (studentData: Omit<Student, 'id' | 'isUnpaid'>): boolean => {
    const today = new Date();
    if (!studentData.lastPaymentDate) {
        const joinDate = new Date(studentData.joinDate);
        const diffTime = Math.abs(today.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    }
    const lastPayment = new Date(studentData.lastPaymentDate);
    const diffTime = Math.abs(today.getTime() - lastPayment.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
};


/**
 * Fetches a single student document from Firestore based on their phone number.
 * Calculates their payment status and returns a complete Student object.
 * @param phone The phone number to search for.
 * @returns A Student object if found, otherwise null.
 */
export const getStudentByPhone = async (phone: string): Promise<Student | null> => {
    try {
        const q = query(collection(db, "students"), where("phone", "==", phone));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null; // Student not found
        }
        
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();

        // **New Login Logic Checks**
        if (studentData.canLogin === false || studentData.status === 'inactive') {
            throw new Error("Your account is inactive. Please contact B.D Library admin.");
        }

        const student: Student = {
            id: studentDoc.id,
            ...studentData,
            status: studentData.status || 'active',
            canLogin: studentData.canLogin !== undefined ? studentData.canLogin : true,
            role: studentData.role || 'student',
            payments: studentData.payments || [],
            isUnpaid: checkUnpaidStatus(studentData as Omit<Student, 'id' | 'isUnpaid'>)
        } as Student;
        
        return student;

    } catch (error) {
        console.error("Error fetching student by phone:", error);
        if (error instanceof Error) {
            // Propagate specific error messages
            throw error;
        }
        throw new Error("Failed to query student data.");
    }
};
