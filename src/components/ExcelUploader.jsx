import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FiUploadCloud, FiCheckSquare, FiSquare } from 'react-icons/fi';

const ExcelUploader = () => {
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.includes('sheet') || file.name.match(/\.(xlsx|xls)$/)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    if (workbook.SheetNames.length > 1) {
                        alert('Error: Excel file contains multiple sheets. Please upload a file with only one sheet.');
                        resetState();
                        return;
                    }

                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    if (jsonData.length === 0) {
                        alert('Error: The selected sheet is empty');
                        resetState();
                        return;
                    }

                    const columns = Object.keys(jsonData[0]);
                    setFileName(file.name);
                    setHeaders(columns);
                    setParsedData(jsonData);
                    setSelectedFields([]);

                } catch (error) {
                    alert('Error processing file: ' + error.message);
                    resetState();
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Please upload a valid Excel file (XLSX or XLS)');
            resetState();
        }
    };

    const resetState = () => {
        setHeaders([]);
        setParsedData([]);
        setFileName('');
        setSelectedFields([]);
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


    const processSelectedFields = () => {
        if (selectedFields.length === 0) {
            alert('Please select at least one field to process');
            return;
        }

        // const processedData = parsedData.map(row => {
        //     return selectedFields.reduce((acc, field) => {
        //         acc[field] = row[field];
        //         return acc;
        //     }, {});
        // });

        console.log('Processed Data:', selectedFields);
        alert("processed data")
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Classifier</h1>
            <div className='bg-white flex justify-end mb-8 -mt-14'>
                <button onClick={resetState} className='text-xl bg-gray-600 p-2 rounded-lg text-white -mt-2 hover:bg-gray-400 hover:cursor-pointer'>
                    Reset
                </button>
            </div>

            <div className="mb-8">
                <label className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
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
                    onClick={processSelectedFields}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Process Selected Fields ({selectedFields.length})
                </button>
            )}
        </div>
    );
};

export default ExcelUploader;