
import React, { useState } from 'react';
import { useStoreItems } from '../hooks/useStoreItems';
import type { StoreItem } from '../types';
import { Modal } from './Modal';

export const AdminStoreManager: React.FC = () => {
    const { items, loading, addItem, updateItem, deleteItem } = useStoreItems();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

    const openModal = (item: StoreItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        const itemData = {
            title: data.title as string,
            description: data.description as string,
            price: Number(data.price),
            imageUrl: data.imageUrl as string,
            category: data.category as any,
            isActive: (formData.get('isActive') === 'on'),
        };
        
        if (editingItem) {
            await updateItem(editingItem.id, itemData);
        } else {
            await addItem(itemData);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Store Manager</h2>
                <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">+ Add Item</button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                 {loading ? <p>Loading store items...</p> : (
                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-4">
                                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-md object-cover"/>
                                    <div>
                                        <p className="font-semibold">{item.title} - <span className="font-normal text-gray-500">₹{item.price}</span></p>
                                        <p className={`text-xs font-bold ${item.isActive ? 'text-green-500' : 'text-red-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(item)} className="text-sm text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => window.confirm('Are you sure you want to delete this item?') && deleteItem(item.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Store Item' : 'Add New Store Item'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input name="title" placeholder="Title" defaultValue={editingItem?.title} required className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    <textarea name="description" placeholder="Description" defaultValue={editingItem?.description} required className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    <select name="category" defaultValue={editingItem?.category || 'notes'} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="notes">Notes & PDFs</option>
                        <option value="test-series">Test Series</option>
                        <option value="bundle">Bundles</option>
                        <option value="stationery">Stationery</option>
                    </select>
                    <input name="price" type="number" step="0.01" placeholder="Price" defaultValue={editingItem?.price} required className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    <input name="imageUrl" placeholder="Image URL" defaultValue={editingItem?.imageUrl} required className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isActive" defaultChecked={editingItem?.isActive ?? true} /> 
                        Is this item active and visible to students?
                    </label>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">{editingItem ? 'Update Item' : 'Add Item'}</button>
                </form>
            </Modal>
        </div>
    );
};
