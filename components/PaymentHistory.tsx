
import React from 'react';
import { format } from 'date-fns';
import type { PaymentInfo } from '../types';

interface PaymentHistoryProps {
    payments: PaymentInfo[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    // Sort payments by year, then month, in descending order
    const sortedPayments = [...payments].sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }
        return b.month - a.month;
    });

    if (sortedPayments.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">No payment history available.</p>;
    }

    return (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {sortedPayments.map((payment, index) => {
                // Create a date object for formatting. Day doesn't matter.
                const paymentDate = new Date(payment.year, payment.month - 1, 1);
                return (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{format(paymentDate, 'MMMM yyyy')}</p>
                        <p className="font-bold text-green-600 dark:text-green-400">Paid</p>
                    </div>
                )
            })}
        </div>
    );
};
