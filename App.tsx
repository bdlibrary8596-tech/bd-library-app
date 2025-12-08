
import React, { useState, useCallback } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AddStudentForm } from './components/AddStudentForm';
import { Auth } from './components/Auth';
import { Modal } from './components/Modal';
import { useStudentData } from './hooks/useStudentData';
import type { Student, NewStudent } from './types';
import { AnimatedHeader } from './components/AnimatedHeader';
import { StudentStoreAndChat } from './components/StudentStoreAndChat';

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

type MainView = 'fees' | 'store_chat';

const App: React.FC = () => {
    const { 
        students, 
        approvals, 
        addStudent, 
        markCurrentMonthAsPaid, 
        permanentDeleteStudent, 
        updateStudentProfile, 
        deactivateStudent, 
        reactivateStudent, 
        loading, 
        error 
    } = useStudentData();
    
    const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
    const [currentUser, setCurrentUser] = useState<Student | null>(null);
    const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<MainView>('fees');

    const handleLogin = useCallback((role: 'admin' | 'student', user: Student) => {
        setUserRole(role);
        setCurrentUser(user);
    }, []);

    const handleLogout = () => {
        setUserRole(null);
        setCurrentUser(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-white bg-gray-900">Loading B.D Library...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500 bg-gray-900">{error}</div>;
    }
    
    if (!userRole || !currentUser) {
        return <Auth onLogin={handleLogin} />;
    }
    
    const navItems = [
        { id: 'fees', label: 'Fee Desk' },
        ...(userRole === 'student' ? [{ id: 'store_chat', label: 'Store & Chat' }] : [])
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-gray-800/80 shadow-md backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">B.D Library</h1>
                        <nav className="hidden md:flex items-center space-x-2">
                             {navItems.map(item => (
                                <button key={item.id} onClick={() => setActiveView(item.id as MainView)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeView === item.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center space-x-4">
                             <span className="hidden sm:inline">Welcome, <span className="font-semibold">{currentUser.name}</span></span>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600">
                                <LogoutIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <AnimatedHeader />
                
                <div className="mt-8">
                    {activeView === 'fees' && (
                        userRole === 'admin' ? (
                            <AdminDashboard
                                students={students}
                                approvals={approvals}
                                onMarkCurrentMonthAsPaid={markCurrentMonthAsPaid}
                                onPermanentDeleteStudent={permanentDeleteStudent}
                                onAddStudentClick={() => setAddStudentModalOpen(true)}
                                onDeactivateStudent={deactivateStudent}
                                onReactivateStudent={reactivateStudent}
                            />
                        ) : (
                            <StudentDashboard 
                                currentUser={currentUser} 
                                allStudents={students}
                                onUpdateProfile={updateStudentProfile} 
                            />
                        )
                    )}
                    
                    {activeView === 'store_chat' && userRole === 'student' && (
                        <StudentStoreAndChat currentUser={currentUser} allStudents={students} />
                    )}
                </div>
            </main>

            <Modal isOpen={isAddStudentModalOpen} onClose={() => setAddStudentModalOpen(false)} title="Add New Student">
                <AddStudentForm onSubmit={(data) => { addStudent(data); setAddStudentModalOpen(false); }} onCancel={() => setAddStudentModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default App;
