import axios from 'axios';

export const classifyExcelFile = async (file, selectedFields) => {
    const formData = new FormData();
    formData.append('file', file);
    selectedFields.forEach(field => {
        formData.append('fields', field);
    });

    try {
        const response = await axios.post('http://localhost:9092/api/filee', formData, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        let errorMessage = 'Error processing the file. Please try again.';
        if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data}`;
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
        }
        throw new Error(errorMessage);
    }
};