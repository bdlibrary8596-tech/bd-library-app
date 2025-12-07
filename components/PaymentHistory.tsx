import React from 'react';
import { format } from 'date-fns';
import type { Payment } from '../types';

interface PaymentHistoryProps {
    payments: Payment;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    const paymentEntries = Object.entries(payments).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    if (paymentEntries.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">No payment history available.</p>;
    }

    return (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {paymentEntries.map(([date, amount]) => (
                <div key={date} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{format(new Date(date), 'MMMM d, yyyy')}</p>
                    <p className="font-bold text-green-600 dark:text-green-400">₹{amount}</p>
                </div>
            ))}
        </div>
    );
};
