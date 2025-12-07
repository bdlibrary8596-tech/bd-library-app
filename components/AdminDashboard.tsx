import React, { useState, useMemo } from 'react';
import type { Student, Approval } from '../types';
import { StudentCard } from './StudentCard';
import { generatePaymentReminder } from '../services/geminiService';
import { Modal } from './Modal';
import { format, differenceInDays } from 'date-fns';

interface AdminDashboardProps {
    students: Student[];
    approvals: Approval[];
    onApprovePayment: (studentId: string) => void;
    onRemoveStudent: (studentId: string) => void;
    onAddStudentClick: () => void;
}

const ApprovalHistoryItem: React.FC<{ approval: Approval }> = ({ approval }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{approval.studentName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Approved on {format(new Date(approval.date), 'MMM d, yyyy')}</p>
        </div>
        <p className="font-bold text-green-600 dark:text-green-400">₹{approval.amount}</p>
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, approvals, onApprovePayment, onRemoveStudent, onAddStudentClick }) => {
    const [reminder, setReminder] = useState<{ studentName: string; message: string } | null>(null);
    const [isReminderLoading, setIsReminderLoading] = useState(false);

    const unpaidStudents = useMemo(() => students.filter(s => s.isUnpaid).sort((a,b) => new Date(a.lastPaymentDate || a.joinDate).getTime() - new Date(b.lastPaymentDate || b.joinDate).getTime()), [students]);
    
    const handleGenerateReminder = async (student: Student) => {
        setIsReminderLoading(true);
        setReminder({ studentName: student.name, message: 'Generating...' });
        const lastPaid = student.lastPaymentDate || student.joinDate;
        const daysOverdue = differenceInDays(new Date(), new Date(lastPaid)) - 30;
        const message = await generatePaymentReminder(student.name, daysOverdue > 0 ? daysOverdue : 1);
        setReminder({ studentName: student.name, message });
        setIsReminderLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Unpaid Students Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Unpaid Students ({unpaidStudents.length})</h2>
                        <button
                            onClick={onAddStudentClick}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            + Add Student
                        </button>
                    </div>
                    {unpaidStudents.length > 0 ? (
                        <div className="space-y-4">
                            {unpaidStudents.map(student => (
                                <StudentCard key={student.id} student={student}>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => onApprovePayment(student.id)}
                                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                                        >
                                            Approve Payment
                                        </button>
                                        <button
                                            onClick={() => handleGenerateReminder(student)}
                                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
                                        >
                                            AI Reminder
                                        </button>
                                        <button
                                            onClick={() => onRemoveStudent(student.id)}
                                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </StudentCard>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-green-500 font-semibold">All payments are up to date!</p>
                        </div>
                    )}
                </div>

                {/* All Students Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">All Students ({students.length})</h2>
                    <div className="space-y-4">
                        {students.map(student => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Approval History */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                    <h3 className="text-xl font-bold mb-4">Approval History</h3>
                    <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
                        {approvals.length > 0 ? approvals.map(approval => (
                           <ApprovalHistoryItem key={approval.id} approval={approval} />
                        )) : <p className="text-gray-500">No approvals yet.</p>}
                    </div>
                </div>
            </div>
             <Modal isOpen={!!reminder} onClose={() => setReminder(null)} title={`Reminder for ${reminder?.studentName}`}>
                <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reminder?.message}</p>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setReminder(null)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};