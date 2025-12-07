import React, { useState, useMemo } from 'react';
import type { Student, Approval } from '../types';
import { StudentCard } from './StudentCard';
import { StudentDetailModal } from './StudentDetailModal';
import { format, isThisMonth } from 'date-fns';
import { getStudentFeeStats } from '../services/feeService';

interface AdminDashboardProps {
    students: Student[];
    approvals: Approval[];
    onApprovePayment: (studentId: string, paymentMonth: Date) => void;
    onPermanentDeleteStudent: (studentId: string) => void;
    onAddStudentClick: () => void;
    onDeactivateStudent: (studentId: string) => void;
    onReactivateStudent: (studentId: string) => void;
}

type AdminTab = 'all' | 'unpaid' | 'activity' | 'reminders';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    students, 
    approvals, 
    onApprovePayment, 
    onAddStudentClick, 
    onDeactivateStudent, 
    onReactivateStudent,
    onPermanentDeleteStudent
}) => {
    const [tab, setTab] = useState<AdminTab>('all');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const studentsWithStats = useMemo(() => {
        return students.map(s => ({
            ...s,
            feeStats: getStudentFeeStats(s)
        }));
    }, [students]);
    
    // Filter out soft-deleted for general unpaid list, but keep them in 'all'
    const unpaidStudents = useMemo(() => studentsWithStats.filter(s => s.feeStats.unpaidCount > 0 && s.status === 'active'), [studentsWithStats]);

    const renderAllStudents = () => (
        <div className="space-y-4">
            {studentsWithStats.map(student => (
                <StudentCard 
                    key={student.id} 
                    student={student} 
                    showPhone={true} 
                    isAdminView={true}
                    onCardClick={setSelectedStudent}
                    onDeactivate={onDeactivateStudent}
                    onReactivate={onReactivateStudent}
                    onPermanentDelete={onPermanentDeleteStudent}
                    onApprovePayment={onApprovePayment}
                />
            ))}
        </div>
    );
    
    const renderUnpaid = () => (
         <div className="space-y-4">
            {unpaidStudents.map(student => (
                <StudentCard 
                    key={student.id} 
                    student={student} 
                    showPhone={true} 
                    isAdminView={true}
                    onCardClick={setSelectedStudent}
                    onDeactivate={onDeactivateStudent}
                    onReactivate={onReactivateStudent}
                    onPermanentDelete={onPermanentDeleteStudent}
                    onApprovePayment={onApprovePayment}
                />
            ))}
        </div>
    );

    const renderActivity = () => {
        const today = new Date();
        const joinedThisMonth = students.filter(s => isThisMonth(new Date(s.joinDate)));
        const leftThisMonth = students.filter(s => s.status === 'softDeleted' && s.leftDate && isThisMonth(new Date(s.leftDate)));
        const paymentsThisMonth = approvals.filter(a => isThisMonth(new Date(a.date)));

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">Joined This Month ({joinedThisMonth.length})</h3>
                    <div className="space-y-2">
                        {joinedThisMonth.map(s => <div key={s.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">{s.name} - Joined on {format(new Date(s.joinDate), 'MMM d')}</div>)}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2">Payments This Month ({paymentsThisMonth.length})</h3>
                     <div className="space-y-2">
                        {paymentsThisMonth.map(p => <div key={p.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">{p.studentName} - ₹{p.amount} on {format(new Date(p.date), 'MMM d')}</div>)}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Left This Month ({leftThisMonth.length})</h3>
                    <div className="space-y-2">
                         {leftThisMonth.map(s => <div key={s.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">{s.name} - Left on {format(new Date(s.leftDate!), 'MMM d')}</div>)}
                    </div>
                </div>
            </div>
        );
    };

    const renderReminders = () => {
        const today = new Date();
        const dayOfMonth = today.getDate();
        const studentsToRemind = unpaidStudents.filter(s => {
            const joinDay = new Date(s.joinDate).getDate();
            return dayOfMonth >= joinDay - 2 && dayOfMonth <= joinDay;
        });

        const handleSendReminder = (student: typeof studentsWithStats[0]) => {
             const msg = encodeURIComponent(
              `Namaste ${student.name},\n` +
              `B.D Library se yaad dilaya ja raha hai ki aapki library fee ₹${student.feeStats.totalUnpaidAmount} ` +
              `(${student.feeStats.unpaidCount} month) pending hai.\n` +
              `Kripya jaldi se payment kare.\n- B.D Library`
            );
            const url = `https://wa.me/91${student.phone}?text=${msg}`;
            window.open(url, '_blank');
        };

        return (
            <div className="space-y-4">
                {studentsToRemind.length > 0 ? studentsToRemind.map(student => (
                     <StudentCard key={student.id} student={student} showPhone={true}>
                         <div className="flex gap-2 mt-4">
                             <button
                                 onClick={() => handleSendReminder(student)}
                                 className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                             >
                                 Send WhatsApp Reminder
                             </button>
                         </div>
                     </StudentCard>
                )) : <p className="text-center text-gray-500">No students need a reminder today.</p>}
            </div>
        );
    };

    const tabs: { id: AdminTab, label: string }[] = [
        { id: 'all', label: `All Students (${studentsWithStats.length})` },
        { id: 'unpaid', label: `Unpaid (${unpaidStudents.length})` },
        { id: 'activity', label: 'Recent Activity' },
        { id: 'reminders', label: 'Reminders' }
    ];

    return (
        <div className="grid grid-cols-1">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
                <button
                    onClick={onAddStudentClick}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    + Add Student
                </button>
            </div>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`${
                                tab === t.id
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {tab === 'all' && renderAllStudents()}
                {tab === 'unpaid' && renderUnpaid()}
                {tab === 'activity' && renderActivity()}
                {tab === 'reminders' && renderReminders()}
            </div>
            
            {selectedStudent && (
                 <StudentDetailModal 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)}
                    isAdmin={true}
                    onDeactivate={onDeactivateStudent}
                    onReactivate={onReactivateStudent}
                    onPermanentDelete={onPermanentDeleteStudent}
                    onApprovePayment={onApprovePayment}
                 />
            )}
        </div>
    );
};