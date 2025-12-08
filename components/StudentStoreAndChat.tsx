
import React, { useState } from 'react';
import type { Student } from '../types';
import { useStoreItems } from '../hooks/useStoreItems';
import { ChatPage } from './ChatPage';

const LIBRARY_WHATSAPP_NUMBER = "911234567890"; // Replace with actual number

interface StudentStoreAndChatProps {
    currentUser: Student;
    allStudents: Student[];
}

type SubView = 'store' | 'chat';

export const StudentStoreAndChat: React.FC<StudentStoreAndChatProps> = ({ currentUser, allStudents }) => {
    const [view, setView] = useState<SubView>('store');
    const { items, loading } = useStoreItems();

    const StoreView = () => (
        <div>
            <h3 className="text-2xl font-bold mb-4">Library Store</h3>
            {loading ? <p>Loading items...</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {items.filter(item => item.isActive).map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                           <div className="p-4">
                               <h4 className="font-bold truncate">{item.title}</h4>
                               <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                               <div className="flex justify-between items-center mt-3">
                                   <span className="font-bold text-lg text-indigo-500">₹{item.price}</span>
                                   <a 
                                     href={`https://wa.me/${LIBRARY_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I want to buy "${item.title}" from the B.D Library app.`)}`}
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-600"
                                   >
                                       Order on WhatsApp
                                   </a>
                               </div>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setView('store')} className={`${view === 'store' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Store</button>
                    <button onClick={() => setView('chat')} className={`${view === 'chat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Community Chat</button>
                </nav>
            </div>
            {view === 'store' && <StoreView />}
            {view === 'chat' && <ChatPage currentUser={currentUser} allStudents={allStudents} />}
        </div>
    );
};
