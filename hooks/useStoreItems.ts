
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import type { StoreItem } from '../types';

export const useStoreItems = () => {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'storeItems'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as any)?.toDate?.().toISOString() || doc.data().createdAt,
                updatedAt: (doc.data().updatedAt as any)?.toDate?.().toISOString() || doc.data().updatedAt,
            } as StoreItem));
            setItems(itemsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const addItem = async (item: Omit<StoreItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        await addDoc(collection(db, 'storeItems'), { ...item, createdAt: now, updatedAt: now });
    };

    const updateItem = async (id: string, updates: Partial<StoreItem>) => {
        await updateDoc(doc(db, 'storeItems', id), { ...updates, updatedAt: new Date().toISOString() });
    };

    const deleteItem = async (id: string) => {
        await deleteDoc(doc(db, 'storeItems', id));
    };

    return { items, loading, addItem, updateItem, deleteItem };
};
