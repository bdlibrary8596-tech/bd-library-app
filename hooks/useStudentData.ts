import { useState, useEffect, useCallback } from 'react';
import type { Student, Approval, NewStudent, PaymentInfo } from '../types';
import { format } from 'date-fns';
import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    query,
    writeBatch,
    orderBy,
    arrayUnion,
    where,
    deleteDoc
} from 'firebase/firestore';
import { normalizePayments } from '../services/feeService';

export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, "students"), where("status", "!=", "deleted"));
    
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => {
            const data = doc.data();
            const student: Student = {
                id: doc.id,
                name: data.name,
                phone: data.phone,
                fatherName: data.fatherName,
                address: data.address,
                joinDate: data.joinDate,
                photoUrl: data.photoUrl,
                payments: normalizePayments(data.payments),
                lastPaymentDate: data.lastPaymentDate,
                monthlyFee: data.monthlyFee,
                role: data.role || 'student',
                status: data.status || 'active',
                leftDate: data.leftDate,
                lastRejoinDate: data.lastRejoinDate,
                canLogin: data.canLogin !== undefined ? data.canLogin : true,
                softDeleted: data.softDeleted || false, // Ensure softDeleted exists
            };
            return student;
        });
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
            payments: [],
            lastPaymentDate: null,
            role: 'student',
            status: 'active',
            canLogin: true,
            softDeleted: false,
            dueDay: new Date(newStudentData.joinDate).getDate(),
            exitDate: null,
            reactiveAllowed: true
        };
        await addDoc(collection(db, "students"), studentToAdd);
      } catch (e) {
        console.error("Error adding student:", e);
        setError("Could not add student. Please try again.");
      }
  }, []);

  const permanentDeleteStudent = useCallback(async (studentId: string) => {
    try {
        await deleteDoc(doc(db, "students", studentId));
        setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (e) {
        console.error("Error permanently deleting student:", e);
        setError("Could not permanently delete student. Please try again.");
    }
  }, []);

  const approvePayment = useCallback(async (studentId: string, paymentMonthDate: Date) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        setError("Student not found to process payment.");
        return;
    }

    const year = paymentMonthDate.getFullYear();
    const month = paymentMonthDate.getMonth() + 1;
    const newPayment: PaymentInfo = { year, month };

    const currentPayments = normalizePayments(student.payments);
    const isAlreadyPaid = currentPayments.some(p => p.year === year && p.month === month);

    if (isAlreadyPaid) {
        // Optionally provide feedback that it's already paid
        console.log(`Month ${month}/${year} is already paid for student ${student.name}.`);
        return; 
    }

    const updatedPayments = [...currentPayments, newPayment];
    const studentRef = doc(db, "students", studentId);

    try {
        // Firestore write
        await updateDoc(studentRef, {
            payments: updatedPayments,
            lastPaymentDate: format(new Date(), 'yyyy-MM-dd'),
        });

        // Local state update for immediate UI refresh
        setStudents(prev => 
            prev.map(s => 
                s.id === studentId 
                    ? { ...s, payments: updatedPayments } 
                    : s
            )
        );
    } catch (e) {
        console.error("Error approving payment:", e);
        setError("Could not approve payment. Please try again.");
    }
  }, [students]);

   const deactivateStudent = async (studentId: string) => {
      const studentRef = doc(db, 'students', studentId);
      try {
        // Firestore write
        // FIX: Update status to 'softDeleted' to align with UI components and set the leftDate.
        await updateDoc(studentRef, {
            status: 'softDeleted',
            canLogin: false,
            softDeleted: true,
            leftDate: format(new Date(), 'yyyy-MM-dd'),
        });
        // Local state update for immediate UI refresh
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, status: 'softDeleted', canLogin: false, softDeleted: true, leftDate: format(new Date(), 'yyyy-MM-dd') }
                    : s
            )
        );
      } catch(e) {
         console.error("Error deactivating student:", e);
         setError("Could not deactivate student.");
      }
    };

    const reactivateStudent = async (studentId: string) => {
        const studentRef = doc(db, 'students', studentId);
        try {
            // Firestore write
            // FIX: Clear leftDate and set lastRejoinDate upon reactivation for accurate record-keeping.
            await updateDoc(studentRef, {
                status: 'active',
                canLogin: true,
                softDeleted: false,
                leftDate: null,
                lastRejoinDate: format(new Date(), 'yyyy-MM-dd'),
            });
            // Local state update for immediate UI refresh
            setStudents(prev =>
                prev.map(s =>
                    s.id === studentId
                        ? { ...s, status: 'active', canLogin: true, softDeleted: false, leftDate: null, lastRejoinDate: format(new Date(), 'yyyy-MM-dd') }
                        : s
                )
            );
        } catch(e) {
            console.error("Error reactivating student:", e);
            setError("Could not reactivate student.");
        }
    };

  const updateStudentProfile = useCallback(async (studentId: string, data: { photoUrl: string }) => {
     try {
        await updateDoc(doc(db, "students", studentId), data);
     } catch (e) {
        console.error("Error updating profile:", e);
        setError("Could not update profile. Please try again.");
     }
  }, []);


  return { students, approvals, addStudent, approvePayment, permanentDeleteStudent, updateStudentProfile, deactivateStudent, reactivateStudent, loading, error };
};