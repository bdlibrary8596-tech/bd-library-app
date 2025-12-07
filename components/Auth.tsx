import React, { useState } from 'react';
import type { Student } from '../types';
import { getStudentByMobile } from '../services/studentService';

interface AuthProps {
    onLogin: (role: 'admin' | 'student', user: Student) => void;
    students: Student[]; // Kept for admin login mock, can be removed if admin has a db entry
}

const ADMIN_PASSWORD = 'BD1145'; // Updated admin password

export const Auth: React.FC<AuthProps> = ({ onLogin, students }) => {
    const [view, setView] = useState<'select' | 'student' | 'admin'>('select');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Student form state
    const [mobile, setMobile] = useState('');

    // Admin form state
    const [adminPassword, setAdminPassword] = useState('');
    
    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!mobile) {
            setError('Please enter your mobile number.');
            return;
        }
        setIsLoading(true);

        try {
            const existingStudent = await getStudentByMobile(mobile);
            if (existingStudent) {
                // Login successful with a complete Student object
                onLogin('student', existingStudent);
            } else {
                // Handle case where student is not found
                setError('This mobile number is not registered. Please contact the admin.');
            }
        } catch (err) {
            console.error("Error during student login:", err);
            setError("An error occurred during login. Please try again.");
        } finally {
            // This block ensures the loading spinner always stops
            setIsLoading(false);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (adminPassword === ADMIN_PASSWORD) {
            onLogin('admin', { id: 'admin01', name: 'Admin', isUnpaid: false } as Student);
        } else {
            setError('Incorrect admin password.');
        }
    };
    
    const renderSelection = () => (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Select Your Role</h2>
            <div className="space-y-4">
                 <button onClick={() => setView('student')} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg">
                    Student Login
                </button>
                <button onClick={() => setView('admin')} className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-lg">
                    Admin Login
                </button>
            </div>
        </div>
    );

    const renderStudentForm = () => (
        <form onSubmit={handleStudentSubmit} className="space-y-4">
             <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Student Login</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registered Mobile Number</label>
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter your mobile number to login" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isLoading ? 'Verifying...' : 'Login'}
            </button>
            <button type="button" onClick={() => { setView('select'); setError(''); }} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:underline mt-2">Back to role selection</button>
        </form>
    );

     const renderAdminForm = () => (
        <form onSubmit={handleAdminSubmit} className="space-y-4">
             <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Admin Login</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Password</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700">Login</button>
            <button type="button" onClick={() => { setView('select'); setError(''); }} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:underline mt-2">Back to role selection</button>
        </form>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
             <div className="w-full max-w-md">
                 <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">Welcome to B.D Library</h1>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                    {view === 'select' && renderSelection()}
                    {view === 'student' && renderStudentForm()}
                    {view === 'admin' && renderAdminForm()}
                </div>
            </div>
        </div>
    );
};