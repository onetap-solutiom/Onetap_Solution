import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AuthGuard = ({ children }) => {
    const { user } = useAdmin();
    const location = useLocation();

    if (!user) {
        // Redirect to login but save the current location
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
