import React, { useMemo } from 'react';
import type { Student } from '../types';
import { getStudentFeeStats } from '../services/feeService';

interface StudentCardProps {
    student: Student;
    showPhone?: boolean;
    onCardClick?: (student: Student) => void;
    isAdminView?: boolean;
    onDeactivate?: (id: string) => void;
    onReactivate?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
    onApprovePayment?: (id: string, month: Date) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
    student, 
    showPhone = false, 
    onCardClick, 
    isAdminView = false,
    onDeactivate,
    onReactivate,
    onPermanentDelete,
    onApprovePayment
}) => {
    const feeStats = useMemo(() => getStudentFeeStats(student), [student]);
    const isUnpaid = feeStats.unpaidCount > 0;

    const handleDeactivate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeactivate && window.confirm("Deactivate this student? They will be blocked from login but data will remain and can be reactivated.")) {
            onDeactivate(student.id);
        }
    };

    const handleReactivate = (e: React.MouseEvent) => {
        e.stopPropagation();
         if (onReactivate && window.confirm("Reactivate this student so they can log in again?")) {
            onReactivate(student.id);
        }
    };

    const handlePermanentDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPermanentDelete && window.confirm("Delete this student permanently? This will remove all their data and they will not be able to log in again.")) {
            onPermanentDelete(student.id);
        }
    };

    const handlePayCurrentMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onApprovePayment) {
            onApprovePayment(student.id, new Date());
        }
    }
    
    const cardStatusStyles = () => {
        if (student.status === 'softDeleted') return 'border-gray-500 opacity-60';
        if (isUnpaid) return 'border-red-500';
        return 'border-green-500';
    };

    return (
        <div 
            className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 transition-all duration-300 border-l-4 ${cardStatusStyles()} ${onCardClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
            onClick={() => onCardClick?.(student)}
        >
            <div className="flex items-start gap-4">
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {showPhone ? student.phone : '**********'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {feeStats.unpaidCount > 0 ? `${feeStats.unpaidCount} month(s) unpaid` : 'All fees paid'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">₹{student.monthlyFee}/mo</p>
                    <p className={`text-sm font-bold capitalize ${
                         student.status === 'softDeleted' ? 'text-gray-500' : isUnpaid ? 'text-red-500' : 'text-green-500'
                    }`}>
                        {student.status === 'softDeleted' ? 'Deactivated' : isUnpaid ? 'Unpaid' : 'Paid'}
                    </p>
                </div>
            </div>
            
            {isAdminView && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                    {student.status === 'softDeleted' ? (
                        <>
                            <button onClick={handleReactivate} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">Reactivate</button>
                            <button onClick={handlePermanentDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition">Delete Permanently</button>
                        </>
                    ) : (
                        <>
                             <button onClick={handleDeactivate} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition">Deactivate</button>
                            <button onClick={handlePermanentDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition">Delete Permanently</button>
                            {onApprovePayment && <button onClick={handlePayCurrentMonth} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 transition">Pay Current Month</button>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};