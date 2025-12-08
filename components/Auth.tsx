import React, { useState } from 'react';
import type { Student } from '../types';
import { getStudentByPhone } from '../services/studentService';

interface AuthProps {
    onLogin: (role: 'admin' | 'student', user: Student) => void;
}

const ADMIN_PASSWORD = 'BD1145';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [view, setView] = useState<'select' | 'student' | 'admin'>('select');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Student form state
    const [phone, setPhone] = useState('');

    // Admin form state
    const [adminPassword, setAdminPassword] = useState('');
    
    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!phone) {
            setError('Please enter your phone number.');
            return;
        }
        setIsLoading(true);

        try {
            const existingStudent = await getStudentByPhone(phone);
            if (existingStudent) {
                onLogin('student', existingStudent);
            } else {
                setError('This phone number is not registered. Please contact the admin.');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                 setError("An error occurred during login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (adminPassword === ADMIN_PASSWORD) {
            const adminUser: Student = { 
                id: 'admin01', 
                name: 'Admin', 
                role: 'admin', 
                canLogin: true,
                status: 'active',
                phone: '',
                joinDate: new Date().toISOString(),
                photoUrl: '',
                payments: [],
                monthlyFee: 0,
                softDeleted: false,
                reactiveAllowed: false,
                dueDay: 1,
            };
            onLogin('admin', adminUser);
        } else {
            setError('Incorrect admin password.');
        }
    };
    
    const renderContent = () => {
        if (view === 'student') {
            return (
                <form onSubmit={handleStudentSubmit} className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-center text-white">Student Login</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-200">Registered Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your phone number" required className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md shadow-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white" />
                    </div>
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-violet-600 text-white py-2 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition">
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                    <button type="button" onClick={() => { setView('select'); setError(''); }} className="w-full text-center text-sm text-gray-300 hover:underline mt-2">Back</button>
                </form>
            );
        }

        if (view === 'admin') {
            return (
                <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-center text-white">Admin Login</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-200">Admin Password</label>
                        <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-white" />
                    </div>
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">Login</button>
                    <button type="button" onClick={() => { setView('select'); setError(''); }} className="w-full text-center text-sm text-gray-300 hover:underline mt-2">Back</button>
                </form>
            );
        }

        // Default to 'select' view
        return (
             <div className="text-center animate-fade-in">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">B.D Library</h1>
                <p className="mt-2 text-gray-200">Smart Fee & Library Management for Students</p>
                <div className="space-y-4 mt-8">
                    <button onClick={() => setView('student')} className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-transform hover:scale-105 text-lg">
                        Student Login
                    </button>
                    <button onClick={() => setView('admin')} className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-transform hover:scale-105 text-lg">
                        Admin Login
                    </button>
                </div>
                <p className="mt-6 text-xs text-gray-300/80">
                    Tip: Add this app to your home screen for faster access.
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-800 p-4 overflow-hidden relative">
            <style>{`
                @keyframes scroll-books {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll-books {
                    animation: scroll-books 40s linear infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            
            <div className="absolute top-0 left-0 w-full h-10 bg-black/20 overflow-hidden">
                <div className="w-[200%] h-full flex items-center animate-scroll-books">
                    <p className="text-2xl whitespace-nowrap text-white/50">
                        {'📚 📖 🖋️ '.repeat(50)}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                {renderContent()}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-10 bg-black/20 overflow-hidden">
                <div className="w-[200%] h-full flex items-center animate-scroll-books" style={{ animationDirection: 'reverse' }}>
                     <p className="text-2xl whitespace-nowrap text-white/50">
                        {'🎓 ✨ 💡 '.repeat(50)}
                    </p>
                </div>
            </div>
        </div>
    );
};
