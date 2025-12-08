
import React, { useState, useMemo } from 'react';
import type { Student, Approval } from '../types';
import { StudentCard } from './StudentCard';
import { StudentDetailModal } from './StudentDetailModal';
import { format, isThisMonth } from 'date-fns';
import { getStudentFeeStats } from '../services/feeService';

interface AdminDashboardProps {
    students: Student[];
    approvals: Approval[];
    onMarkCurrentMonthAsPaid: (studentId: string) => void;
    onPermanentDeleteStudent: (studentId: string) => void;
    onAddStudentClick: () => void;
    onDeactivateStudent: (studentId: string) => void;
    onReactivateStudent: (studentId: string) => void;
}

type AdminTab = 'all' | 'unpaid' | 'activity' | 'reminders';

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    students, 
    approvals, 
    onMarkCurrentMonthAsPaid, 
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
    
    const activeStudents = useMemo(() => studentsWithStats.filter(s => s.status === 'active'), [studentsWithStats]);
    const inactiveStudents = useMemo(() => studentsWithStats.filter(s => s.status === 'softDeleted'), [studentsWithStats]);
    const unpaidStudents = useMemo(() => activeStudents.filter(s => s.feeStats.unpaidCount > 0), [activeStudents]);
    
    const overviewStats = useMemo(() => {
        const totalIncome = activeStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
        const totalUnpaid = unpaidStudents.reduce((sum, s) => sum + s.feeStats.totalUnpaidAmount, 0);
        return {
            total: students.length,
            active: activeStudents.length,
            inactive: inactiveStudents.length,
            income: `₹${totalIncome.toLocaleString()}/mo`,
            unpaid: `₹${totalUnpaid.toLocaleString()}`
        };
    }, [students, activeStudents, inactiveStudents, unpaidStudents]);

    const handleCopyReminders = () => {
        const reminderText = unpaidStudents.map(student => {
            return `Dear ${student.name}, your B.D Library fee for ${student.feeStats.unpaidList.join(', ')} (total ₹${student.feeStats.totalUnpaidAmount}) is due. Please pay as soon as possible. – B.D Library`;
        }).join('\n\n');
        navigator.clipboard.writeText(reminderText).then(() => {
            alert('Reminder messages copied to clipboard!');
        });
    };

    const renderStudentsList = (list: typeof studentsWithStats) => (
        <div className="space-y-4">
            {list.map(student => (
                <StudentCard 
                    key={student.id} 
                    student={student} 
                    showPhone={true} 
                    isAdminView={true}
                    onCardClick={setSelectedStudent}
                    onDeactivate={onDeactivateStudent}
                    onReactivate={onReactivateStudent}
                    onPermanentDelete={onPermanentDeleteStudent}
                    onPayCurrentMonth={onMarkCurrentMonthAsPaid}
                />
            ))}
        </div>
    );

    const renderReminders = () => (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Click the button to copy a pre-filled reminder message for all unpaid students. You can then paste this into a WhatsApp broadcast or SMS.
                </p>
                <button
                    onClick={handleCopyReminders}
                    disabled={unpaidStudents.length === 0}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400"
                >
                    Copy Reminder Message for All ({unpaidStudents.length})
                </button>
            </div>
            {renderStudentsList(unpaidStudents)}
        </div>
    );

    const renderActivity = () => {
        const joinedThisMonth = students.filter(s => isThisMonth(new Date(s.joinDate)));
        const leftThisMonth = students.filter(s => s.exitDate && isThisMonth(new Date(s.exitDate)));
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">Joined This Month ({joinedThisMonth.length})</h3>
                    <div className="space-y-2 text-sm">
                        {joinedThisMonth.map(s => <div key={s.id}>{s.name} on {format(new Date(s.joinDate), 'MMM d')}</div>)}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">Left This Month ({leftThisMonth.length})</h3>
                    <div className="space-y-2 text-sm">
                        {leftThisMonth.map(s => <div key={s.id}>{s.name} on {format(new Date(s.exitDate!), 'MMM d')}</div>)}
                    </div>
                </div>
            </div>
        );
    };
    
    const tabs = [
        { id: 'all', label: `All Students (${students.length})` },
        { id: 'unpaid', label: `Unpaid (${unpaidStudents.length})` },
        { id: 'activity', label: 'Recent Activity' },
        { id: 'reminders', label: 'Reminders' }
    ];

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <button onClick={onAddStudentClick} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">+ Add Student</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard title="Total Students" value={overviewStats.total} color="text-indigo-500" />
                <StatCard title="Active" value={overviewStats.active} color="text-green-500" />
                <StatCard title="Inactive" value={overviewStats.inactive} color="text-yellow-500" />
                <StatCard title="Expected Income" value={overviewStats.income} color="text-blue-500" />
                <StatCard title="Total Unpaid" value={overviewStats.unpaid} color="text-red-500" />
            </div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as AdminTab)}
                            className={`${tab === t.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {tab === 'all' && renderStudentsList(studentsWithStats)}
                {tab === 'unpaid' && renderStudentsList(unpaidStudents)}
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
                    onMarkCurrentMonthAsPaid={onMarkCurrentMonthAsPaid}
                 />
            )}
        </div>
    );
};
