import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
    FiUploadCloud,
    FiCheckSquare,
    FiSquare,
    FiAlertCircle,
    FiCheckCircle,
    FiLoader,
    FiX,
    FiRefreshCw,
    FiFile
} from 'react-icons/fi';
import { classifyExcelFile } from '../service/apiService';

const ExcelUploader = () => {
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [processingTime, setProcessingTime] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [originalFileName, setOriginalFileName] = useState('');
    const [processedFileUrl, setProcessedFileUrl] = useState('');
    const [timer, setTimer] = useState(0);
    const fileInputRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const navigate = useNavigate();

    const DownloadModal = ({ isOpen, onClose, processingTime, onDownload }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-16 rounded-xl shadow-xl flex flex-col items-center">
                    <h2 className="text-lg font-semibold">File Processed Successfully!</h2>
                    <p className="mt-2">Time Taken: {processingTime} seconds</p>
                    <div className="mt-4 flex space-x-4">
                        <button
                            onClick={onDownload}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDecimalTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = (totalSeconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = processedFileUrl;
        const baseName = originalFileName.split('.').slice(0, -1).join('.');
        const processedFileName = `${baseName}_processed_file.xlsx`;
        link.setAttribute('download', processedFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(processedFileUrl);
        resetState();
        setIsModalOpen(false);
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.includes('sheet') || file.name.match(/.(xlsx|xls)$/)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    if (workbook.SheetNames.length > 1) {
                        showMessage('Error: Excel file contains multiple sheets. Please upload a file with only one sheet.', 'error');
                        resetState();
                        return;
                    }

                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    if (jsonData.length === 0) {
                        showMessage('Error: The selected sheet is empty', 'error');
                        resetState();
                        return;
                    }

                    const columns = Object.keys(jsonData[0]);
                    setFileName(file.name);
                    setHeaders(columns);
                    setParsedData(jsonData);
                    setSelectedFields([]);
                    setMessage('');

                } catch (error) {
                    showMessage(`Error processing file: ${error.message}`, 'error');
                    resetState();
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            showMessage('Please upload a valid Excel file (XLSX or XLS)', 'error');
            resetState();
        }
    };

    const resetState = () => {
        setHeaders([]);
        setParsedData([]);
        setFileName('');
        setSelectedFields([]);
        setMessage('');
        setProcessingTime(0);
        setTimer(0);
        clearInterval(timerIntervalRef.current);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleField = (field) => {
        setSelectedFields(prev => prev.includes(field)
            ? prev.filter(f => f !== field)
            : [...prev, field]
        );
    };

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
    };

    const closeMessageBanner = () => {
        setMessage('');
        setMessageType('');
    };

    const startTimer = () => {
        setTimer(0);
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerIntervalRef.current);
    };

    const processFile = async () => {
        if (selectedFields.length === 0) {
            showMessage('Please select at least one field to process', 'error');
            return;
        }

        setLoading(true);
        startTimer();
        const startTime = performance.now();
        try {
            const file = fileInputRef.current.files[0];
            setOriginalFileName(file.name)
            const processedBlob = await classifyExcelFile(file, selectedFields);
            const url = window.URL.createObjectURL(processedBlob);
            setProcessedFileUrl(url); // Store the processed file URL

            const endTime = performance.now();
            setProcessingTime(((endTime - startTime) / 1000).toFixed(2));
            showMessage('File processed successfully!', 'success');
            setIsModalOpen(true); // Open the modal
        } catch (error) {
            showMessage(error.message || 'Processing failed', 'error');
        } finally {
            stopTimer();
            setLoading(false);
        }
    };

    const Loader = () => (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-3 border border-gray-200">
                <FiLoader className="animate-spin text-blue-600 w-6 h-6" />
                <div>
                    <p className="text-gray-700 font-medium">Processing File</p>
                    <p className="text-sm text-gray-500 mt-1">Elapsed Time: {formatTime(timer)}</p>
                </div>
            </div>
        </div>
    );

    const MessageBanner = () => {
        if (!message) return null;

        const icon = messageType === 'success'
            ? <FiCheckCircle className="w-5 h-5 mr-2" />
            : <FiAlertCircle className="w-5 h-5 mr-2" />;

        return (
            <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center px-6 py-3 rounded-lg shadow-lg border ${messageType === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
                } animate-fade-in-down`}>
                {icon}
                <span>{message}</span>
                {processingTime > 0 && messageType === 'success' && (
                    <span className="ml-4 text-sm text-gray-600">Time Taken: {formatDecimalTime(processingTime)}</span>
                )}
                <button
                    onClick={closeMessageBanner}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg relative border border-gray-100">
            <MessageBanner />
            {loading && <Loader />}
            <DownloadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                processingTime={processingTime}
                onDownload={handleDownload}
            />
            <div className="flex justify-end items-center space-x-4 mb-6">
                <button
                    title='Go to History'
                    onClick={() => navigate('/history')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 cursor-pointer rounded-lg hover:bg-yellow-200 text-sm"
                >
                    History
                </button>
                <button
                    title='Reset Page'
                    onClick={resetState}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 cursor-pointer hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                >
                    <FiRefreshCw className="mx-2" />
                    Reset
                </button>
                <button
                    title='Logout'
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-red-100 cursor-pointer text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                    Logout
                </button>
            </div>


            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ticket Classifier</h1>
                    <p className="text-gray-500 mt-1">Upload your Excel file to categorize support tickets</p>
                </div>
            </div>

            <div className="mb-8 group">
                <label className="flex flex-col items-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-all duration-300 cursor-pointer bg-gradient-to-b from-gray-50/50 to-white/50 hover:from-blue-50/30 hover:to-white/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                        type="file"
                        name='file'
                        title='Upload Excel File'
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <div className="relative mb-4">
                        <FiUploadCloud className="w-14 h-14 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                        {fileName && (
                            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-blue-200">
                                <FiFile className="w-5 h-5 text-blue-500" />
                            </div>
                        )}
                    </div>
                    <span className="text-gray-700 font-medium text-center">
                        {fileName || (
                            <>
                                <span className="text-blue-500">Click to upload Excel file</span>
                            </>
                        )}
                    </span>
                    <span className="text-sm text-gray-400 mt-2">Supports .xlsx, .xls</span>
                </label>
            </div>

            {headers.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Select Fields to Process</h3>
                        <div className="space-x-2">
                            <button
                                onClick={() => setSelectedFields(headers)}
                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setSelectedFields([])}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {headers.map((header) => (
                            <button
                                key={header}
                                onClick={() => toggleField(header)}
                                className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${selectedFields.includes(header)
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-inner'
                                    : 'bg-white border-gray-200 hover:border-blue-200 text-gray-600 hover:bg-gray-50'
                                    } group`}
                            >
                                <span className={`transition-transform duration-200 ${selectedFields.includes(header) ? 'scale-110' : ''}`}>
                                    {selectedFields.includes(header) ? (
                                        <FiCheckSquare className="w-5 h-5 mr-2 text-blue-500" />
                                    ) : (
                                        <FiSquare className="w-5 h-5 mr-2 text-gray-400 group-hover:text-blue-400" />
                                    )}
                                </span>
                                <span className="text-sm font-medium">{header}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {parsedData.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Preview</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {headers.map(header => (
                                        <th
                                            key={header}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parsedData.slice(0, 5).map((row, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        {headers.map(header => (
                                            <td
                                                key={header}
                                                className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate"
                                                title={row[header]}
                                            >
                                                {row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        Showing first 5 rows of {parsedData.length} • Hover cells to view full content
                    </p>
                </div>
            )}

            {headers.length > 0 && (
                <button
                    onClick={processFile}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <FiLoader className="animate-spin mr-2" />
                            Processing...
                        </span>
                    ) : (
                        `Process ${selectedFields.length} Field${selectedFields.length !== 1 ? 's' : ''}`
                    )}
                </button>
            )}
        </div>
    );
};

export default ExcelUploader;
