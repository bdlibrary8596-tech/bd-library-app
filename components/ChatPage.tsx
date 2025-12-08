
import React, { useState, useEffect, useRef } from 'react';
import type { Student, Chat, Message, GameSession } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, Timestamp, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { GameModal } from './GameModal';

interface ChatPageProps {
    currentUser: Student;
    allStudents: Student[];
}

export const ChatPage: React.FC<ChatPageProps> = ({ currentUser, allStudents }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeGame, setActiveGame] = useState<GameSession | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", currentUser.id), orderBy("updatedAt", "desc"));
        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
            const chatsData = snapshot.docs.map(d => d.data() as Chat);
            setChats(chatsData);
        });
        return unsubscribe;
    }, [currentUser.id]);
    
    useEffect(() => {
        if (!activeChat) {
            setMessages([]);
            return;
        };
        const messagesQuery = query(collection(db, `chats/${activeChat.id}/messages`), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
             const messagesData = snapshot.docs.map(d => ({id: d.id, ...d.data()}) as Message);
             setMessages(messagesData);
        });
        return unsubscribe;
    }, [activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectChat = async (otherUser: Student) => {
        const memberIds = [currentUser.id, otherUser.id].sort();
        const chatId = memberIds.join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            const newChat = { 
                id: chatId, 
                participants: memberIds,
                participantDetails: {
                    [currentUser.id]: { name: currentUser.name, photoUrl: currentUser.photoUrl },
                    [otherUser.id]: { name: otherUser.name, photoUrl: otherUser.photoUrl },
                },
                updatedAt: new Date().toISOString()
            };
            await setDoc(chatRef, newChat);
            setActiveChat(newChat as Chat);
        } else {
             setActiveChat(chatSnap.data() as Chat);
        }
    };
    
    const handleSendMessage = async () => {
        if (!activeChat || !newMessage.trim()) return;
        
        const messageData = {
            chatId: activeChat.id,
            senderId: currentUser.id,
            text: newMessage,
            createdAt: new Date().toISOString(),
            seenBy: [currentUser.id],
        };
        
        await addDoc(collection(db, `chats/${activeChat.id}/messages`), messageData);
        await updateDoc(doc(db, 'chats', activeChat.id), {
            lastMessage: { text: newMessage, senderId: currentUser.id, timestamp: messageData.createdAt },
            updatedAt: messageData.createdAt,
        });
        
        setNewMessage('');
    };
    
    const handlePlayGame = async () => {
         if(!activeChat) return;
         const otherUserId = activeChat.participants.find(id => id !== currentUser.id)!;
         const gameId = [currentUser.id, otherUserId].sort().join('_');
         const gameRef = doc(db, 'gameSessions', gameId);
         const gameSnap = await getDoc(gameRef);

         let gameData;
         if (!gameSnap.exists()) {
             const newGame: GameSession = {
                 id: gameId,
                 players: { [currentUser.id]: 'X', [otherUserId]: 'O'},
                 board: Array(9).fill(""),
                 currentTurn: currentUser.id,
                 status: 'in-progress',
                 updatedAt: new Date().toISOString(),
             };
             await setDoc(gameRef, newGame);
             gameData = newGame;
         } else {
             gameData = gameSnap.data() as GameSession;
         }
         setActiveGame(gameData);
    };

    const otherUserInChat = activeChat ? allStudents.find(s => s.id === activeChat.participants.find(id => id !== currentUser.id)) : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-y-auto">
                <h3 className="font-bold mb-4">Contacts</h3>
                {allStudents.filter(s => s.id !== currentUser.id && s.status === 'active').map(s => (
                    <button key={s.id} onClick={() => handleSelectChat(s)} className={`w-full flex items-center gap-3 p-2 rounded-md text-left ${activeChat?.participants.includes(s.id) ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <img src={s.photoUrl} className="w-10 h-10 rounded-full" />
                        <span>{s.name}</span>
                    </button>
                ))}
            </div>
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                {activeChat && otherUserInChat ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold">{otherUserInChat.name}</h3>
                            <button onClick={handlePlayGame} className="bg-purple-500 text-white text-xs px-3 py-1 rounded-md font-semibold hover:bg-purple-600">Play Tic Tac Toe</button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                             {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <p className={`max-w-xs p-3 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{msg.text}</p>
                                </div>
                             ))}
                             <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t dark:border-gray-600 flex gap-2">
                            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700" placeholder="Type a message..." />
                            <button onClick={handleSendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Send</button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">Select a contact to start chatting</div>
                )}
            </div>
            {activeGame && <GameModal gameSession={activeGame} currentUser={currentUser} onClose={() => setActiveGame(null)} />}
        </div>
    );
};
