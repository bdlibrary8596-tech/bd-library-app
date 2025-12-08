
import React, { useMemo } from 'react';
import type { Student } from '../types';
import { Modal } from './Modal';
// FIX: The 'startOfMonth' and 'parseISO' functions are not available in the current date-fns version. Removed the imports.
import { format, eachMonthOfInterval } from 'date-fns';
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
        if (!student.joinDate) return <p className="text-gray-500">No join date recorded.</p>;
        // FIX: Replaced 'parseISO' with 'new Date()' and 'startOfMonth' with an inline implementation.
        const start = new Date(new Date(student.joinDate).getFullYear(), new Date(student.joinDate).getMonth(), 1);
        // FIX: Replaced 'parseISO' with 'new Date()' and 'startOfMonth' with an inline implementation.
        const end = student.status === 'softDeleted' && student.exitDate ? new Date(new Date(student.exitDate).getFullYear(), new Date(student.exitDate).getMonth(), 1) : new Date();
        if (end < start) return <p className="text-gray-500">No payment months in range.</p>;
        
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
                        {/* FIX: Replaced 'parseISO' with 'new Date()' to parse the ISO date string. */}
                        <p>{format(new Date(student.joinDate), 'MMM d, yyyy')}</p>
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
                        <p className={feeStats.totalUnpaidAmount > 0 ? "text-red-500 font-bold" : ""}>₹{feeStats.totalUnpaidAmount}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-md mb-2">Payment History</h4>
                    {renderMonthList()}
                </div>
                 {isAdmin && (
                    <div className="flex flex-wrap justify-center gap-2 pt-4 border-t">
                         {student.status === 'softDeleted' ? (
                            <button onClick={() => onReactivate?.(student.id)} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">Reactivate</button>
                        ) : (
                            <button onClick={() => window.confirm('Deactivate this student? They will be blocked from login.') && onDeactivate?.(student.id)} className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600">Deactivate</button>
                        )}
                        <button onClick={() => window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone.') && onPermanentDelete?.(student.id)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">Delete Permanently</button>
                        {feeStats.unpaidCount > 0 && student.status !== 'softDeleted' && (
                            <button onClick={() => onMarkCurrentMonthAsPaid?.(student.id)} className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">Pay Current Month</button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
