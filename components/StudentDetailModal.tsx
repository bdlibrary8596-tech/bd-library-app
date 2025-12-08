
import React, { useMemo } from 'react';
import type { Student } from '../types';
import { Modal } from './Modal';
import { format, eachMonthOfInterval, startOfMonth, parseISO } from 'date-fns';
import { getStudentFeeStats, normalizePayments } from '../services/feeService';

interface StudentDetailModalProps {
    student: Student;
    onClose: () => void;
    isAdmin?: boolean;
    onDeactivate?: (id: string) => void;
    onReactivate?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
    onMarkCurrentMonthAsPaid?: (id: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ 
    student, onClose, isAdmin = false, onDeactivate, onReactivate, onPermanentDelete, onMarkCurrentMonthAsPaid 
}) => {
    const feeStats = useMemo(() => getStudentFeeStats(student), [student]);
    const paidSet = useMemo(() => new Set(normalizePayments(student.payments).filter(p=>p.status === 'paid').map(p => p.monthKey)), [student.payments]);

    const renderMonthList = () => {
        const start = startOfMonth(parseISO(student.joinDate));
        const end = student.status === 'softDeleted' && student.exitDate ? startOfMonth(parseISO(student.exitDate)) : new Date();
        if (end < start) return <p>No payment months in range.</p>;
        
        const months = eachMonthOfInterval({ start, end }).reverse();

        return (
             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {months.map(monthDate => {
                    const monthKey = format(monthDate, 'yyyy-MM');
                    const isPaid = paidSet.has(monthKey);
                    return (
                        <div key={monthKey} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="font-semibold">{format(monthDate, 'MMMM yyyy')}</span>
                             <span className={`font-bold ${isPaid ? 'text-green-500' : 'text-red-500'}`}>{isPaid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={isAdmin ? "Admin View: Member Details" : "Member Details"}>
            <div className="p-6 space-y-4">
                <div className="text-center">
                    <img src={student.photoUrl} alt={student.name} className="w-24 h-24 rounded-full border-4 border-indigo-500 mb-4 mx-auto" />
                    <h3 className="text-2xl font-bold">{student.name}</h3>
                     {isAdmin && <p className="text-gray-500">{student.phone}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                        <p className="font-semibold text-gray-500">Joined Date</p>
                        <p>{format(parseISO(student.joinDate), 'MMM d, yyyy')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-500">Status</p>
                        <p className="capitalize">{student.status.replace('softDeleted', 'Inactive')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-500">Unpaid Months</p>
                        <p className={feeStats.unpaidCount > 0 ? "text-red-500 font-bold" : ""}>{feeStats.unpaidCount}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Total Due</p>
                        <p className={feeStats.totalUnpaidAmount > <strong>Please include the following files in your request: `components/Auth.tsx`.</strong>