import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import History from './pages/History';
import ExcelUploader from '../src/components/ExcelUploader'
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';

function App() {
    return (
        <div className='bg-gray-800 min-h-screen'>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div className='py-8'>
                                <ExcelUploader />
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <div className='py-8'>
                                <History />
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <ToastContainer />
        </div>
    );
}

export default App;
