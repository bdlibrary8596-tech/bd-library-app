
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
    orderBy,
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
            // Build a clean student object to prevent circular dependencies
            const student: Student = {
                id: doc.id,
                name: data.name,
                phone: data.phone,
                fatherName: data.fatherName,
                address: data.address,
                joinDate: data.joinDate,
                photoUrl: data.photoUrl,
                payments: normalizePayments(data.payments),
                monthlyFee: data.monthlyFee,
                role: data.role || 'student',
                status: data.status || 'active',
                canLogin: data.canLogin !== undefined ? data.canLogin : true,
                softDeleted: data.softDeleted || false,
                reactiveAllowed: data.reactiveAllowed !== undefined ? data.reactiveAllowed : true,
                dueDay: data.dueDay || new Date(data.joinDate).getDate(),
                exitDate: data.exitDate,
                lastRejoinDate: data.lastRejoinDate,
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
            id: doc.id, ...doc.data()
        } as Approval));
        setApprovals(approvalsData);
    });

    return () => {
        unsubscribeStudents();
        unsubscribeApprovals();
    };
  }, []);

  const addStudent = useCallback(async (newStudentData: NewStudent) => {
      try {
        const joinDate = new Date(newStudentData.joinDate);
        const studentToAdd = {
            ...newStudentData,
            joinDate: joinDate.toISOString(),
            photoUrl: `https://picsum.photos/seed/${newStudentData.name}/200`,
            payments: [],
            role: 'student',
            status: 'active',
            canLogin: true,
            softDeleted: false,
            reactiveAllowed: true,
            dueDay: joinDate.getDate(),
            exitDate: null,
        };
        await addDoc(collection(db, "students"), studentToAdd);
      } catch (e) {
        console.error("Error adding student:", e);
      }
  }, []);

  const permanentDeleteStudent = useCallback(async (studentId: string) => {
    try {
        await deleteDoc(doc(db, "students", studentId));
        setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (e) {
        console.error("Error permanently deleting student:", e);
    }
  }, []);

  const deactivateStudent = async (studentId: string) => {
    const studentRef = doc(db, 'students', studentId);
    const updates = {
      status: 'softDeleted',
      canLogin: false,
      softDeleted: true,
      exitDate: new Date().toISOString(),
    };
    try {
      await updateDoc(studentRef, updates);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    } catch(e) {
       console.error("Error deactivating student:", e);
    }
  };

  const reactivateStudent = async (studentId: string) => {
    const studentRef = doc(db, 'students', studentId);
    const updates = {
      status: 'active',
      canLogin: true,
      softDeleted: false,
      exitDate: null,
      lastRejoinDate: new Date().toISOString(),
    };
    try {
      await updateDoc(studentRef, updates);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    } catch(e) {
        console.error("Error reactivating student:", e);
    }
  };

  const markCurrentMonthAsPaid = useCallback(async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const newPayment: PaymentInfo = {
      monthKey: currentMonthKey,
      amount: student.monthlyFee,
      status: 'paid',
      paidOn: new Date().toISOString(),
    };
    
    const currentPayments = normalizePayments(student.payments);
    // Remove any existing payment for this month before adding the new one
    const otherPayments = currentPayments.filter(p => p.monthKey !== currentMonthKey);
    const updatedPayments = [...otherPayments, newPayment];

    try {
      await updateDoc(doc(db, "students", studentId), { payments: updatedPayments });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, payments: updatedPayments } : s));
    } catch (e) {
      console.error("Error marking month as paid:", e);
    }
  }, [students]);

  const updateStudentProfile = useCallback(async (studentId: string, data: { photoUrl: string }) => {
     try {
        await updateDoc(doc(db, "students", studentId), data);
     } catch (e) {
        console.error("Error updating profile:", e);
     }
  }, []);

  return { 
    students, 
    approvals, 
    addStudent, 
    markCurrentMonthAsPaid, 
    permanentDeleteStudent, 
    updateStudentProfile, 
    deactivateStudent, 
    reactivateStudent, 
    loading, 
    error 
  };
};
