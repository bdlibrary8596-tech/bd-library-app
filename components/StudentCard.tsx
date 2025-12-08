
import React, { useMemo } from 'react';
import type { Student } from '../types';
import { getStudentFeeStats } from '../services/feeService';
// FIX: The 'parseISO' function is not available in the current date-fns version. Removed the import.
import { isThisMonth } from 'date-fns';

interface StudentCardProps {
    student: Student & { feeStats: ReturnType<typeof getStudentFeeStats> };
    showPhone?: boolean;
    onCardClick?: (student: Student) => void;
    isAdminView?: boolean;
    onDeactivate?: (id: string) => void;
    onReactivate?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
    onPayCurrentMonth?: (id: string) => void;
}

const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{text}</span>
);

export const StudentCard: React.FC<StudentCardProps> = ({ 
    student, 
    showPhone = false, 
    onCardClick, 
    isAdminView = false,
    onDeactivate,
    onReactivate,
    onPermanentDelete,
    onPayCurrentMonth
}) => {
    const { feeStats } = student;
    const isUnpaid = feeStats.unpaidCount > 0;

    const statusBadge = useMemo(() => {
        if (student.status === 'softDeleted') return <Badge text="Inactive" color="bg-gray-200 text-gray-700" />;
        // FIX: Replaced 'parseISO' with the native 'new Date()' constructor to parse the ISO date string.
        if (isThisMonth(new Date(student.joinDate))) return <Badge text="New Member" color="bg-blue-200 text-blue-800" />;
        if (isUnpaid) return <Badge text="Pending" color="bg-red-200 text-red-800" />;
        return <Badge text="On Time Payer" color="bg-green-200 text-green-800" />;
    }, [student, isUnpaid]);
    
    const cardStatusStyles = student.status === 'softDeleted' ? 'border-gray-400 opacity-70' : isUnpaid ? 'border-red-500' : 'border-green-500';

    return (
        <div 
            className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 transition-all border-l-4 ${cardStatusStyles} ${onCardClick && isAdminView ? 'cursor-pointer hover:shadow-lg' : ''}`}
            onClick={() => onCardClick?.(student)}
        >
            <div className="flex items-start gap-4">
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold">{student.name}</h3>
                    <p className="text-sm text-gray-500">{showPhone ? student.phone : '**********'}</p>
                    <div className="mt-1">{statusBadge}</div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg">₹{student.monthlyFee}/mo</p>
                    <p className={`text-sm font-bold ${isUnpaid && student.status !== 'softDeleted' ? 'text-red-500' : 'text-green-500'}`}>
                        {feeStats.unpaidCount > 0 ? `${feeStats.unpaidCount} mo due` : 'Paid Up'}
                    </p>
                </div>
            </div>
            
            {isAdminView && (
                <div className="mt-4 border-t pt-3 flex flex-wrap gap-2 justify-end" onClick={e => e.stopPropagation()}>
                    {student.status === 'softDeleted' ? (
                        <>
                            <button onClick={() => onReactivate?.(student.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600">Reactivate</button>
                            <button onClick={() => window.confirm('Permanently delete this student? This action cannot be undone.') && onPermanentDelete?.(student.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700">Delete Permanently</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => window.confirm('Deactivate this student? They will be blocked from login but can be reactivated later.') && onDeactivate?.(student.id)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600">Deactivate</button>
                            <button onClick={() => window.confirm('Permanently delete this student? This action cannot be undone.') && onPermanentDelete?.(student.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700">Delete Permanently</button>
                            {isUnpaid && <button onClick={() => onPayCurrentMonth?.(student.id)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600">Pay Current Month</button>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
