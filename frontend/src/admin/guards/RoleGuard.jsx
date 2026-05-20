import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const RoleGuard = ({ children, requiredPermission }) => {
    const { user, hasPermission } = useAdmin();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        // Redirect to unauthorized or dashboard if permission is missing
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default RoleGuard;
