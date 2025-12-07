import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Student } from '../types';
import { normalizePayments } from './feeService';

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
        // FIX: Also check for 'softDeleted' status to prevent login.
        if (studentData.canLogin === false || studentData.status === 'inactive' || studentData.status === 'softDeleted') {
            throw new Error("Your account is inactive. Please contact B.D Library admin.");
        }

        const student: Student = {
            id: studentDoc.id,
            ...studentData,
            status: studentData.status || 'active',
            canLogin: studentData.canLogin !== undefined ? studentData.canLogin : true,
            role: studentData.role || 'student',
            payments: normalizePayments(studentData.payments), // Fix: ensure payments is an array
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