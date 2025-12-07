import { useState, useEffect, useCallback } from 'react';
import type { Student, Approval, NewStudent } from '../types';
import { format } from 'date-fns';
import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    updateDoc,
    query,
    writeBatch,
    orderBy
} from 'firebase/firestore';

const today = new Date();

const checkUnpaidStatus = (student: Student): boolean => {
    if (!student.lastPaymentDate) {
        // If they have never paid, check against join date
        const joinDate = new Date(student.joinDate);
        const diffTime = Math.abs(today.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    }
    const lastPayment = new Date(student.lastPaymentDate);
    const diffTime = Math.abs(today.getTime() - lastPayment.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
};


export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, "students"));
    
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isUnpaid: checkUnpaidStatus({ id: doc.id, ...doc.data() } as Student)
        } as Student));
        setStudents(studentsData);
        setLoading(false);
    }, (err) => {
        console.error("Firestore students listener error:", err);
        setError("Failed to fetch student data.");
        setLoading(false);
    });

    const approvalsQuery = query(collection(db, "approvals"), orderBy("date", "desc"));
    
    const unsubscribeApprovals = onSnapshot(approvalsQuery, (snapshot) => {
        const approvalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Approval));
        setApprovals(approvalsData);
    }, (err) => {
        console.error("Firestore approvals listener error:", err);
        setError("Failed to fetch approval history.");
    });

    return () => {
        unsubscribeStudents();
        unsubscribeApprovals();
    };
  }, []);

  const addStudent = useCallback(async (newStudentData: NewStudent) => {
      try {
        const studentToAdd = {
            ...newStudentData,
            photoUrl: `https://picsum.photos/seed/${newStudentData.name}/200`,
            payments: {},
            lastPaymentDate: null,
        };
        await addDoc(collection(db, "students"), studentToAdd);
      } catch (e) {
        console.error("Error adding student:", e);
        setError("Could not add student. Please try again.");
      }
  }, []);

  const removeStudent = useCallback(async (studentId: string) => {
    try {
        await deleteDoc(doc(db, "students", studentId));
    } catch (e) {
        console.error("Error removing student:", e);
        setError("Could not remove student. Please try again.");
    }
  }, []);

  const approvePayment = useCallback(async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        console.error("Student not found for payment approval");
        return;
    }

    try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const batch = writeBatch(db);

        // 1. Update Student's payment info
        const studentRef = doc(db, "students", studentId);
        const updatedPayments = { ...student.payments, [todayStr]: student.monthlyFee };
        batch.update(studentRef, {
            lastPaymentDate: todayStr,
            payments: updatedPayments
        });

        // 2. Create a new approval record
        const approvalRef = doc(collection(db, "approvals"));
        const newApproval = {
            adminId: 'admin1',
            studentId: student.id,
            studentName: student.name,
            amount: student.monthlyFee,
            date: todayStr,
        };
        batch.set(approvalRef, newApproval);

        await batch.commit();
    } catch (e) {
        console.error("Error approving payment:", e);
        setError("Could not approve payment. Please try again.");
    }
  }, [students]);

  const updateStudentProfile = useCallback(async (studentId: string, data: { photoUrl: string }) => {
     try {
        await updateDoc(doc(db, "students", studentId), data);
     } catch (e) {
        console.error("Error updating profile:", e);
        setError("Could not update profile. Please try again.");
     }
  }, []);


  return { students, approvals, addStudent, approvePayment, removeStudent, updateStudentProfile, loading, error };
};