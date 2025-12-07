
import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { format, differenceInDays } from 'date-fns';
import { PaymentHistory } from './PaymentHistory';
import { Modal } from './Modal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentCard } from './StudentCard';
import { calculateFeeStats } from '../services/feeService';

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

    const feeStats = useMemo(
        () => calculateFeeStats(currentUser.joinDate, currentUser.monthlyFee, currentUser.payments, currentUser.status, currentUser.leftDate),
        [currentUser]
    );

    const handleSaveProfile = (data: { photoUrl: string }) => {
        onUpdateProfile(currentUser.id, data);
        setIsEditModalOpen(false);
    };

    const renderAccountView = () => (
         <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
             <div className="flex justify-between items-start">
                <div>
                     <h3 className="text-xl font-bold mb-4">Your Account Details</h3>
                     <div className="space-y-2 text-gray-700 dark:text-gray-300">
                         <p><span className="font-semibold">Name:</span> {currentUser.name}</p>
                         <p><span className="font-semibold">Father's Name:</span> {currentUser.fatherName || 'N/A'}</p>
                         <p><span className="font-semibold">Address:</span> {currentUser.address || 'N/A'}</p>
                         <p><span className="font-semibold">Phone:</span> {currentUser.phone}</p>
                         <p><span className="font-semibold">Joined On:</span> {format(new Date(currentUser.joinDate), 'MMM d, yyyy')}</p>
                         <p><span className="font-semibold">Monthly Fee:</span> ₹{currentUser.monthlyFee}</p>
                     </div>
                 </div>
                 <button onClick={() => setIsEditModalOpen(true)} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900 transition text-sm">
                    Change DP
                </button>
             </div>
        </div>
    );

    const renderFeesView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">Unpaid Months</h3>
                    <p className={`text-3xl font-bold mt-2 ${feeStats.unpaidMonths > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {feeStats.unpaidMonths}
                    </p>
                </div>
                 <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">Total Due</h3>
                    <p className={`text-3xl font-bold mt-2 ${feeStats.totalDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ₹{feeStats.totalDue}
                    </p>
                </div>
            </div>
            {feeStats.unpaidList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-2">Pending Months</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feeStats.unpaidList.join(', ')}</p>
                </div>
            )}
             <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Payment History</h3>
                <PaymentHistory payments={currentUser.payments} />
            </div>
        </div>
    );

    const renderAllStudentsView = () => (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Library Members</h3>
            <div className="space-y-3">
                {allStudents.filter(s => s.status === 'active').map((student) => (
                    <button 
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="w-full text-left"
                    >
                        <StudentCard 
                            student={student} 
                            showPhone={currentUser.id === student.id} 
                        />
                    </button>
                ))}
            </div>
        </div>
    );
    
    const views = [
        { id: 'account', label: 'Your Account' },
        { id: 'fees', label: 'Fee Track' },
        { id: 'all', label: 'All Members' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-indigo-500" />
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold">Welcome, {currentUser.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{currentUser.phone}</p>
                </div>
            </div>
            
             <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                {views.map(v => (
                    <button 
                        key={v.id}
                        onClick={() => setView(v.id as StudentView)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition ${view === v.id ? 'bg-white text-indigo-700 shadow dark:bg-gray-800' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            <div>
                {view === 'account' && renderAccountView()}
                {view === 'fees' && renderFeesView()}
                {view === 'all' && renderAllStudentsView()}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
                 <div className="p-4 text-center">
                    <img src={currentUser.photoUrl} alt={currentUser.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Only profile picture can be changed.</p>
                    <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
                        <button type="button" onClick={() => handleSaveProfile({ photoUrl: `https://picsum.photos/seed/${currentUser.name}/${Date.now()}/200` })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Change Profile Picture</button>
                    </div>
                </div>
            </Modal>
            
            {selectedStudent && (
                 <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
        </div>
    );
};
