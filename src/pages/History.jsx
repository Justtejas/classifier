import React, { useEffect, useState } from 'react';
import { FiDownload, FiClock, FiFileText, FiArrowLeft, FiDelete } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import { getHistory, downloadFile, deleteFileById } from '../service/apiService';

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileIdToDelete, setFileIdToDelete] = useState(null);

    const navigate = useNavigate();


    const formatDecimalTime = (totalSeconds) => {
        const time = totalSeconds.slice(0, totalSeconds.length - 1)
        const mins = Math.floor(time / 60);
        const secs = (time % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    };

    const handleDeleteClick = (fileId) => {
        setFileIdToDelete(fileId);
        setIsModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        try {
            await deleteFileById(fileIdToDelete);
            toast.success("File deleted successfully")
            const response = await getHistory();
            if (response.status === 200) {
                const data = await response.data;
                setHistoryData(data.reverse());
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsModalOpen(false);
            setFileIdToDelete(null);
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getHistory();
                if (response.status !== 200) throw new Error('Failed to fetch history');
                const data = await response.data;
                setHistoryData(data.reverse());
            } catch (error) {
                toast.error(error)
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const download = async (fileId, fileName) => {
        try {
            const response = await downloadFile(fileId)
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error)
        }

    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-md border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FiFileText className="mr-2 text-blue-500" />
                    Processing History
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm text-blue-600 cursor-pointer hover:underline"
                >
                    <FiArrowLeft className="mr-1" />
                    Back to Upload
                </button>
            </div>

            {loading ? (
                <div className="text-gray-600">Loading history...</div>
            ) : historyData.length <= 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-32 w-32 text-gray-300 mb-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 11v3m0 0v3m0-3h3m-3 0H9"
                            opacity="0.5"
                        />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-500 mb-2">No Files Processed Yet</h3>
                    <p className="text-gray-400 max-w-md text-center">
                        Your processed files will appear here. Start by uploading an excel sheet to get started.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Upload First File
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">File Name</th>
                                <th className="px-4 py-3">Fields</th>
                                <th className="px-4 py-3">Time Taken</th>
                                <th className="px-4 py-3">Processed At</th>
                                <th className="px-4 py-3">Download</th>
                                <th className="px-4 py-3">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {historyData.map((entry) => (
                                <tr key={entry._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{entry["File name"]}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {entry.Fields?.join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{formatDecimalTime(entry["Time taken"])} mins</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <span className="flex items-center">
                                            <FiClock className="mr-1 text-gray-400" />
                                            {entry["Processed at"]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => download(entry._id, entry["File name"])}
                                            className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
                                        >
                                            <FiDownload className="mr-1" />
                                            Download
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button

                                            onClick={() => handleDeleteClick(entry._id)}
                                            className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-800 transition text-xs"
                                        >
                                            <FiDelete className="mr-1" />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default History;