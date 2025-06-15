import React, { useEffect, useState } from 'react';
import { FiDownload, FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:5000/history');
                if (!response.ok) throw new Error('Failed to fetch history');
                const data = await response.json();
                setHistoryData(data.reverse());
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

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
            ) : historyData.length === 0 ? (
                <p className="text-gray-500">No processed files found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">File Name</th>
                                <th className="px-4 py-3">Fields</th>
                                <th className="px-4 py-3">Time Taken (s)</th>
                                <th className="px-4 py-3">Processed At</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {historyData.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{entry.fileName}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {entry.fieldsSelected?.join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{entry.timeTaken}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <span className="flex items-center">
                                            <FiClock className="mr-1 text-gray-400" />
                                            {new Date(entry.processedAt).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <a
                                            href={entry.downloadUrl}
                                            download
                                            className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
                                        >
                                            <FiDownload className="mr-1" />
                                            Download
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;

