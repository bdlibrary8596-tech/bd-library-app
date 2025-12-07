import React from 'react';
import type { Student } from '../types';
import { differenceInDays } from 'date-fns';

interface StudentCardProps {
    student: Student;
    children?: React.ReactNode;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, children }) => {
    const daysSinceLastPayment = student.lastPaymentDate
        ? differenceInDays(new Date(), new Date(student.lastPaymentDate))
        : differenceInDays(new Date(), new Date(student.joinDate));

    return (
        <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 transition-all duration-300 ${student.isUnpaid ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
            <div className="flex items-start gap-4">
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.mobile}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last paid: {student.lastPaymentDate ? `${daysSinceLastPayment} days ago` : 'Never'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">₹{student.monthlyFee}/mo</p>
                    <p className={`text-sm font-bold ${student.isUnpaid ? 'text-red-500' : 'text-green-500'}`}>
                        {student.isUnpaid ? 'Unpaid' : 'Paid'}
                    </p>
                </div>
            </div>
            {children && <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">{children}</div>}
        </div>
    );
};
