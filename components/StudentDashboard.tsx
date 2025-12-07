import React, { useState } from 'react';
import type { Student } from '../types';
import { format, differenceInDays } from 'date-fns';
import { PaymentHistory } from './PaymentHistory';
import { Modal } from './Modal';
import { StudentDetailModal } from './StudentDetailModal';

interface StudentDashboardProps {
    currentUser: Student;
    allStudents: Student[];
    onUpdateProfile: (studentId: string, data: { photoUrl: string }) => void;
}

const EditProfileForm: React.FC<{ student: Student; onSave: (data: { photoUrl: string }) => void; onCancel: () => void; }> = ({ student, onSave, onCancel }) => {
    
    // In a real app, you would use a file input and upload logic.
    // Here, we simulate changing the picture by generating a new random one.
    const handleChangePicture = () => {
        const newPhotoUrl = `https://picsum.photos/seed/${student.name}/${Date.now()}/200`;
        onSave({ photoUrl: newPhotoUrl });
    };

    return (
        <div className="p-4 text-center">
            <img src={student.photoUrl} alt={student.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Only profile picture can be changed.</p>
            <div className="flex justify-center gap-2">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
                <button type="button" onClick={handleChangePicture} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Change Profile Picture</button>
            </div>
        </div>
    );
};


export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, allStudents, onUpdateProfile }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const lastPaymentDaysAgo = currentUser.lastPaymentDate
        ? differenceInDays(new Date(), new Date(currentUser.lastPaymentDate))
        : differenceInDays(new Date(), new Date(currentUser.joinDate));

    const handleSaveProfile = (data: { photoUrl: string }) => {
        onUpdateProfile(currentUser.id, data);
        setIsEditModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-indigo-500" />
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold">{currentUser.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{currentUser.mobile}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Joined on: {format(new Date(currentUser.joinDate), 'MMM d, yyyy')}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900 transition">
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">Payment Status</h3>
                    <p className={`text-2xl font-bold mt-2 ${currentUser.isUnpaid ? 'text-red-500' : 'text-green-500'}`}>
                        {currentUser.isUnpaid ? 'Unpaid' : 'Paid'}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">Last Payment</h3>
                    <p className="text-2xl font-bold mt-2">{lastPaymentDaysAgo} days ago</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">Monthly Fee</h3>
                    <p className="text-2xl font-bold mt-2">₹{currentUser.monthlyFee}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Payment History</h3>
                <PaymentHistory payments={currentUser.payments} />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Library Members</h3>
                <ol className="space-y-2 max-h-60 overflow-y-auto list-decimal list-inside">
                    {allStudents.map((student, index) => (
                        <li key={student.id}>
                            <button 
                                onClick={() => setSelectedStudent(student)}
                                className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <span className="font-semibold">{student.name}</span>
                            </button>
                        </li>
                    ))}
                </ol>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
                <EditProfileForm student={currentUser} onSave={handleSaveProfile} onCancel={() => setIsEditModalOpen(false)} />
            </Modal>
            
            {selectedStudent && (
                 <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
        </div>
    );
};