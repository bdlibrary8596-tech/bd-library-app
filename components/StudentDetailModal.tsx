
import React, { useMemo } from 'react';
import type { Student, PaymentInfo } from '../types';
import { Modal } from './Modal';
import { format, eachMonthOfInterval, startOfMonth } from 'date-fns';
import { getStudentFeeStats, normalizePayments } from '../services/feeService';

interface StudentDetailModalProps {
    student: Student;
    onClose: () => void;
    isAdmin?: boolean;
    onDeactivate?: (id: string) => void;
    onReactivate?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
    onApprovePayment?: (id: string, month: Date) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ 
    student, 
    onClose, 
    isAdmin = false, 
    onDeactivate, 
    onReactivate, 
    onPermanentDelete, 
    onApprovePayment 
}) => {
    const feeStats = getStudentFeeStats(student);
    const paymentsArray = normalizePayments(student.payments);
    const paidSet = useMemo(() => new Set(paymentsArray.map(p => `${p.year}-${p.month}`)), [paymentsArray]);

    const handleDeactivate = () => {
        if (onDeactivate && window.confirm("Deactivate this student? They will be blocked from login but data will remain and can be reactivated.")) {
            onDeactivate(student.id);
        }
    };

    const handleReactivate = () => {
        if (onReactivate && window.confirm("Reactivate this student so they can log in again?")) {
            onReactivate(student.id);
        }
    };

    const handlePermanentDelete = () => {
        if (onPermanentDelete && window.confirm("Delete this student permanently? This will remove all their data and they will not be able to log in again.")) {
            onPermanentDelete(student.id);
        }
    };

    const renderMonthList = () => {
        if (!student.joinDate) return null;
        const start = startOfMonth(new Date(student.joinDate));
        const end = student.status === 'softDeleted' && student.leftDate ? startOfMonth(new Date(student.leftDate)) : new Date();
        
        if (end < start) return <p className="text-gray-500">No payment months in range.</p>;
        
        const monthsToDisplay = eachMonthOfInterval({ start, end }).reverse();

        return (
             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {monthsToDisplay.map(monthDate => {
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth() + 1;
                    const key = `${year}-${month}`;
                    const isPaid = paidSet.has(key);
                    return (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="font-semibold">{format(monthDate, 'MMMM yyyy')}</span>
                             {isPaid ? (
                                <span className="font-bold text-green-500">Paid</span>
                            ) : (
                                <span className="font-bold text-red-500">Unpaid</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={isAdmin ? "Admin View: Member Details" : "Member Details"}>
            <div className="p-6 space-y-4">
                <div className="flex flex-col items-center">
                    <img src={student.photoUrl} alt={student.name} className="w-24 h-24 rounded-full border-4 border-indigo-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{student.name}</h3>
                     {isAdmin && <p className="text-gray-500 dark:text-gray-400">{student.phone}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Joined Date</p>
                        <p>{format(new Date(student.joinDate), 'MMM d, yyyy')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Status</p>
                        <p className="capitalize">{student.status}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Unpaid Months</p>
                        {/* FIX: Changed feeStats.unpaidCount to feeStats.unpaidMonths to match the returned object from getStudentFeeStats. */}
                        <p className={feeStats.unpaidMonths > 0 ? "text-red-500 font-bold" : ""}>{feeStats.unpaidMonths}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Total Due</p>
                        {/* FIX: Changed feeStats.totalUnpaidAmount to feeStats.totalDue to match the returned object from getStudentFeeStats. */}
                        <p className={feeStats.totalDue > 0 ? "text-red-500 font-bold" : ""}>₹{feeStats.totalDue}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-md mb-2">Payment History</h4>
                    {renderMonthList()}
                </div>

                 {isAdmin && (
                    <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                         {student.status === 'softDeleted' ? (
                            <button onClick={handleReactivate} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">Reactivate</button>
                        ) : (
                            <button onClick={handleDeactivate} className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition">Deactivate</button>
                        )}
                        <button onClick={handlePermanentDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition">Delete Permanently</button>
                        {onApprovePayment && student.status !== 'softDeleted' && (
                            <button onClick={() => onApprovePayment(student.id, new Date())} className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition">Pay Current Month</button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
