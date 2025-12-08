
import React, { useState, useEffect } from 'react';
import type { GameSession, Student } from '../types';
import { Modal } from './Modal';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

interface GameModalProps {
    gameSession: GameSession;
    currentUser: Student;
    onClose: () => void;
}

const checkWinner = (board: ("X"|"O"|"")[]) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for(let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // 'X' or 'O'
        }
    }
    return null;
}

export const GameModal: React.FC<GameModalProps> = ({ gameSession, currentUser, onClose }) => {
    const [session, setSession] = useState(gameSession);
    // FIX: Changed `gameSession.playerIds` to `Object.keys(gameSession.players)` to correctly get player IDs from the `players` object.
    const opponentId = Object.keys(gameSession.players).find(id => id !== currentUser.id)!;
    
    useEffect(() => {
        const gameRef = doc(db, 'gameSessions', session.id);
        const unsubscribe = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                setSession(doc.data() as GameSession);
            }
        });
        return unsubscribe;
    }, [session.id]);

    const handleCellClick = async (index: number) => {
        if (session.board[index] || session.currentTurn !== currentUser.id || session.status === 'finished') {
            return;
        }

        const newBoard = [...session.board];
        newBoard[index] = session.players[currentUser.id];
        
        let newStatus: GameSession['status'] = 'in-progress';
        let winnerId: string | null = null;
        
        const winnerSymbol = checkWinner(newBoard);
        if(winnerSymbol) {
            winnerId = Object.keys(session.players).find(id => session.players[id] === winnerSymbol)!;
            newStatus = 'finished';
        } else if (!newBoard.includes("")) {
            winnerId = 'draw';
            newStatus = 'finished';
        }

        await updateDoc(doc(db, 'gameSessions', session.id), {
            board: newBoard,
            currentTurn: opponentId,
            status: newStatus,
            winnerId: winnerId,
            updatedAt: new Date().toISOString()
        });
    };
    
    const handlePlayAgain = async () => {
         await updateDoc(doc(db, 'gameSessions', session.id), {
            board: Array(9).fill(""),
            currentTurn: currentUser.id, // Winner starts or alternate
            status: 'in-progress',
            winnerId: null,
            updatedAt: new Date().toISOString()
        });
    }
    
    const getStatusMessage = () => {
        if (session.status === 'finished') {
            if (session.winnerId === 'draw') return "It's a draw!";
            if (session.winnerId === currentUser.id) return "You win! 🎉";
            return "You lose. Better luck next time!";
        }
        return session.currentTurn === currentUser.id ? "Your turn" : "Opponent's turn...";
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Tic-Tac-Toe">
            <div className="p-6 text-center">
                <p className="mb-4 font-semibold">{getStatusMessage()}</p>
                <div className="grid grid-cols-3 gap-2 w-48 h-48 md:w-60 md:h-60 mx-auto bg-indigo-200 dark:bg-indigo-900 rounded-lg p-2">
                    {session.board.map((cell, i) => (
                        <button key={i} onClick={() => handleCellClick(i)} 
                                disabled={session.currentTurn !== currentUser.id || session.status === 'finished'}
                                className="flex items-center justify-center text-4xl font-bold bg-white dark:bg-gray-800 rounded-md disabled:opacity-50 transition">
                            <span className={cell === 'X' ? 'text-blue-500' : 'text-red-500'}>{cell}</span>
                        </button>
                    ))}
                </div>
                {session.status === 'finished' && (
                    <button onClick={handlePlayAgain} className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Play Again</button>
                )}
            </div>
        </Modal>
    );
};
