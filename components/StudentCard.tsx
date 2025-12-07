
import React, { useMemo } from 'react';
import type { Student } from '../types';
import { calculateFeeStats } from '../services/feeService';

interface StudentCardProps {
    student: Student;
    children?: React.ReactNode;
    showPhone?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, children, showPhone = false }) => {
    const feeStats = useMemo(
        () => calculateFeeStats(student.joinDate, student.monthlyFee, student.payments, student.status, student.leftDate),
        [student]
    );

    const isUnpaid = feeStats.unpaidMonths > 0;

    return (
        <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 transition-all duration-300 border-l-4 ${
            student.status === 'inactive' ? 'border-gray-500 opacity-70' : isUnpaid ? 'border-red-500' : 'border-green-500'
        }`}>
            <div className="flex items-start gap-4">
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {showPhone ? student.phone : '**********'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {feeStats.unpaidMonths > 0 ? `${feeStats.unpaidMonths} month(s) unpaid` : 'All fees paid'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">₹{student.monthlyFee}/mo</p>
                    <p className={`text-sm font-bold ${
                         student.status === 'inactive' ? 'text-gray-500' : isUnpaid ? 'text-red-500' : 'text-green-500'
                    }`}>
                        {student.status === 'inactive' ? 'Inactive' : isUnpaid ? 'Unpaid' : 'Paid'}
                    </p>
                </div>
            </div>
            {children && <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">{children}</div>}
        </div>
    );
};
