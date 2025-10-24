import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkToken } from '../store/features/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { token, loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(checkToken());
        }
    }, [dispatch, token]);

    if (loading) return <div>Loading...</div>;

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
