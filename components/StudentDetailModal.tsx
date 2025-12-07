import React from 'react';
import type { Student } from '../types';
import { Modal } from './Modal';
import { format } from 'date-fns';

interface StudentDetailModalProps {
    student: Student;
    onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="Member Details">
            <div className="p-6 space-y-4">
                <div className="flex flex-col items-center">
                    <img src={student.photoUrl} alt={student.name} className="w-24 h-24 rounded-full border-4 border-indigo-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{student.name}</h3>
                </div>
                <div className="space-y-2 text-center text-gray-600 dark:text-gray-400">
                    <p>
                        <span className="font-semibold">Joined:</span> {format(new Date(student.joinDate), 'MMMM d, yyyy')}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <span className="font-semibold">Current Status:</span> 
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${student.isUnpaid ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                            {student.isUnpaid ? 'Unpaid' : 'Paid'}
                        </span>
                    </p>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
