import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    FiUploadCloud,
    FiCheckSquare,
    FiSquare,
    FiAlertCircle,
    FiCheckCircle,
    FiLoader,
    FiX
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
    const [timer, setTimer] = useState(0);
    const fileInputRef = useRef(null);
    const timerIntervalRef = useRef(null);

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

            // Generate processed filename
            const originalName = file.name;
            const processedName = originalName.replace(/(\.[^/.]+)?$/, (match) => `_processed${match || ''}`
        );

            const processedBlob = await classifyExcelFile(file, selectedFields);

            const url = window.URL.createObjectURL(processedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', processedName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            resetState();
            const endTime = performance.now();
            setProcessingTime(((endTime - startTime) / 1000).toFixed(2));
            showMessage('File processed successfully!', 'success');
        } catch (error) {
            showMessage(error.message || 'Processing failed', 'error');
        } finally {
            stopTimer();
            setLoading(false);
        }
    };

    const Loader = () => (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                <FiLoader className="animate-spin text-blue-600 w-6 h-6" />
                <span className="text-gray-700">Processing your file...</span>
                <span className="text-gray-500 ml-4">Elapsed Time: {formatTime(timer)}</span>
            </div>
        </div>
    );

    const MessageBanner = () => {
        if (!message) return null;

        const icon = messageType === 'success' ?
            <FiCheckCircle className="w-5 h-5 mr-2" /> :
            <FiAlertCircle className="w-5 h-5 mr-2" />;

        return (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center px-6 py-3 rounded-lg shadow-lg ${messageType === 'success' ?
                'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
                }`}>
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md relative">
            <MessageBanner />
            {loading && <Loader />}

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Classifier</h1>
            <div className='bg-white flex justify-end mb-8 -mt-14'>
                <button
                    onClick={resetState}
                    className='text-xl bg-gray-600 p-2 rounded-lg text-white -mt-2 hover:bg-gray-400 hover:cursor-pointer'
                >
                    Reset
                </button>
            </div>

            <div className="mb-8">
                <label className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                        type="file"
                        name='file'
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <FiUploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium">
                        {fileName || 'Click to upload Excel file'}
                    </span>
                    <span className="text-sm text-gray-500">(Only .xlsx and .xls files)</span>
                </label>
            </div>

            {headers.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Select Fields to Process
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {headers.map((header) => (
                            <button
                                key={header}
                                onClick={() => toggleField(header)}
                                className={`flex items-center p-3 rounded-lg border transition-all ${selectedFields.includes(header)
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 hover:border-blue-300 text-gray-600'
                                    }`}
                            >
                                {selectedFields.includes(header) ? (
                                    <FiCheckSquare className="w-5 h-5 mr-2" />
                                ) : (
                                    <FiSquare className="w-5 h-5 mr-2" />
                                )}
                                {header}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {parsedData.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Data Preview</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {headers.map(header => (
                                        <th
                                            key={header}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parsedData.slice(0, 5).map((row, index) => (
                                    <tr key={index}>
                                        {headers.map(header => (
                                            <td
                                                key={header}
                                                className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate"
                                            >
                                                {row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Showing first 5 rows of {parsedData.length}
                    </p>
                </div>
            )}

            {headers.length > 0 && (
                <button
                    onClick={processFile}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Process Selected Fields ({selectedFields.length})
                </button>
            )}
        </div>
    );
};

export default ExcelUploader;
