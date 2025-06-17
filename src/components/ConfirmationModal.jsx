import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded shadow-md">
                <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                <p>Are you sure you want to delete this file?</p>
                <div className="mt-4">
                    <button
                        onClick={onConfirm}
                        className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        No, Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
