
import React, { useState } from 'react';
import { format } from 'date-fns';
import type { NewStudent } from '../types';

interface AddStudentFormProps {
    onSubmit: (data: NewStudent) => void;
    onCancel: () => void;
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [address, setAddress] = useState('');
    const [monthlyFee, setMonthlyFee] = useState(500);
    const [joinDate, setJoinDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && monthlyFee > 0 && joinDate) {
            onSubmit({ name, phone, fatherName, address, monthlyFee, joinDate });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name (Optional)</label>
                <input type="text" id="fatherName" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address (Optional)</label>
                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Fee (₹)</label>
                <input type="number" id="monthlyFee" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} required min="0" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</label>
                <input type="date" id="joinDate" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Add Student</button>
            </div>
        </form>
    );
};
