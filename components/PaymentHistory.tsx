import React from 'react';
import { format } from 'date-fns';
import type { PaymentInfo } from '../types';
import { normalizePayments } from '../services/feeService';

interface PaymentHistoryProps {
    payments: any; // Accept any type to be robust
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    const paymentsArray = normalizePayments(payments);

    // FIX: Sort payments by monthKey (YYYY-MM string) in descending order
    const sortedPayments = [...paymentsArray].sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    if (sortedPayments.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">No payment history available.</p>;
    }

    return (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {sortedPayments.map((payment) => {
                // FIX: Create a date object directly from the monthKey string
                const paymentDate = new Date(payment.monthKey);
                return (
                    // FIX: Use the unique monthKey for the React key prop
                    <div key={payment.monthKey} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{format(paymentDate, 'MMMM yyyy')}</p>
                        <p className="font-bold text-green-600 dark:text-green-400">Paid</p>
                    </div>
                )
            })}
        </div>
    );
};
