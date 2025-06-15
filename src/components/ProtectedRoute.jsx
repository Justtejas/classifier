import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

