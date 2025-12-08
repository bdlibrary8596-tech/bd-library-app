
import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { format } from 'date-fns';
import { Modal } from './Modal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentCard } from './StudentCard';
import { getStudentFeeStats, normalizePayments } from '../services/feeService';

interface StudentDashboardProps {
    currentUser: Student;
    allStudents: Student[];
    onUpdateProfile: (studentId: string, data: { photoUrl: string }) => void;
}

type StudentView = 'account' | 'fees' | 'all';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, allStudents, onUpdateProfile }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<StudentView>('account');

    const feeStats = useMemo(() => getStudentFeeStats(currentUser), [currentUser]);

    const renderAccountView = () => (
         <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
             <div className="flex justify-between items-start">
                <div>
                     <h3 className="text-xl font-bold mb-4">Your Account Details</h3>
                     <div className="space-y-2 text-gray-700 dark:text-gray-300">
                         <p><span className="font-semibold">Name:</span> {currentUser.name}</p>
                         <p><span className="font-semibold">Joined On:</span> {format(new Date(currentUser.joinDate), 'MMM d, yyyy')}</p>
                         <p><span className="font-semibold">Status:</span> <span className="capitalize font-medium">{currentUser.status.replace('softDeleted', 'Inactive')}</span></p>
                         <p><span className="font-semibold">Monthly Fee:</span> ₹{currentUser.monthlyFee}</p>
                         <p><span className="font-semibold">Unpaid Months:</span> {feeStats.unpaidCount}</p>
                         <p><span className="font-semibold">Total Due:</span> ₹{feeStats.totalUnpaidAmount}</p>
                     </div>
                 </div>
                 <button onClick={() => setIsEditModalOpen(true)} className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 text-sm">Change DP</button>
             </div>
        </div>
    );
    
    const renderReceipts = () => {
        const paidPayments = normalizePayments(currentUser.payments).filter(p => p.status === 'paid');
        if (paidPayments.length === 0) {
            return <p className="text-gray-500">No receipts available.</p>;
        }
        return (
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {paidPayments.sort((a,b) => b.monthKey.localeCompare(a.monthKey)).map(p => (
                    <div key={p.monthKey} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <span>{format(new Date(p.monthKey), 'MMM yyyy')}</span>
                        <span className="font-semibold">₹{p.amount}</span>
                        <span>{p.paidOn ? `Paid on ${format(new Date(p.paidOn), 'MMM d')}` : 'Paid'}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderFeesView = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Fee Track</h3>
                {feeStats.unpaidList.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold mb-1">Pending Months</h4>
                        <p className="text-red-500">{feeStats.unpaidList.join(', ')}</p>
                    </div>
                )}
                <div>
                     <h4 className="font-semibold mb-2">Receipts</h4>
                     {renderReceipts()}
                </div>
            </div>
        </div>
    );

    const renderAllStudentsView = () => {
        const studentsWithStats = allStudents.map(s => ({ ...s, feeStats: getStudentFeeStats(s) }));
        return (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Library Members</h3>
                <div className="space-y-3">
                    {studentsWithStats.filter(s => s.status === 'active').map((student) => (
                        <button key={student.id} onClick={() => setSelectedStudent(student)} className="w-full text-left">
                            <StudentCard student={student} showPhone={false} />
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    const views = [
        { id: 'account', label: 'Your Account' }, { id: 'fees', label: 'Fee Track' }, { id: 'all', label: 'All Members' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-center gap-6">
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-indigo-500" />
                <div>
                    <h2 className="text-3xl font-bold">Welcome, {currentUser.name}</h2>
                    <p className="text-gray-500">{currentUser.phone}</p>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                {views.map(v => (
                    <button key={v.id} onClick={() => setView(v.id as StudentView)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition ${view === v.id ? 'bg-white shadow' : 'hover:bg-white/50'}`}>
                        {v.label}
                    </button>
                ))}
            </div>
            <div>
                {view === 'account' && renderAccountView()}
                {view === 'fees' && renderFeesView()}
                {view === 'all' && renderAllStudentsView()}
            </div>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Change Profile Picture">
                 <div className="p-4 text-center">
                    <p className="mb-4">Click below to get a new random profile picture.</p>
                    <button onClick={() => { onUpdateProfile(currentUser.id, { photoUrl: `https://picsum.photos/seed/${currentUser.name}/${Date.now()}/200` }); setIsEditModalOpen(false); }} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Generate New Picture</button>
                </div>
            </Modal>
            {selectedStudent && (
                 <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
        </div>
    );
};
