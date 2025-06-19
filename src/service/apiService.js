import api from './api';

export const classifyExcelFile = async (file, selectedFields) => {
    const formData = new FormData();
    formData.append('file', file);
    selectedFields.forEach(field => {
        formData.append('fields', field);
    });

    try {
        const response = await api.post('/classify', formData, {
            responseType: 'blob',
        });
        console.log(response)
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


export const getHistory = async () => {
    try {
        const response = await api.get('/files');
        return response;
    } catch (error) {
        let errorMessage = 'Error getting history, please try again.';
        if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data}`;
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
        }
        throw new Error(errorMessage);
    }
};


export const downloadFile = async (fileId) => {
    try {
        const response = await api.get(`/files/${fileId}/download`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        let errorMessage = 'Error downloading file, please try again later.';
        if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data}`;
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
        }
        throw new Error(errorMessage);
    }
};

export const deleteFileById = async (fileId) => {
    try {
        const response = await api.get(`/files/${fileId}/delete`);
        return response;
    } catch (error) {
        let errorMessage = 'Error downloading file, please try again later.';
        if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data}`;
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
        }
        throw new Error(errorMessage);
    }
};