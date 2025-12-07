import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Student } from '../types';

// Helper function to calculate unpaid status, based on the logic from useStudentData.ts
const checkUnpaidStatus = (studentData: Omit<Student, 'id' | 'isUnpaid'>): boolean => {
    const today = new Date();
    if (!studentData.lastPaymentDate) {
        // If they have never paid, check against join date
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
 * Fetches a single student document from Firestore based on their mobile number.
 * Calculates their payment status and returns a complete Student object.
 * @param mobile The mobile number to search for.
 * @returns A Student object if found, otherwise null.
 */
export const getStudentByMobile = async (mobile: string): Promise<Student | null> => {
    try {
        const q = query(collection(db, "students"), where("mobile", "==", mobile));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null; // Student not found
        }
        
        // Assuming mobile numbers are unique, return the first match.
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data() as Omit<Student, 'id' | 'isUnpaid'>;

        // Construct the full Student object, including the calculated 'isUnpaid' field
        const student: Student = {
            id: studentDoc.id,
            ...studentData,
            isUnpaid: checkUnpaidStatus(studentData)
        };
        
        return student;

    } catch (error) {
        console.error("Error fetching student by mobile:", error);
        // Propagate the error to be handled by the calling component
        throw new Error("Failed to query student data.");
    }
};