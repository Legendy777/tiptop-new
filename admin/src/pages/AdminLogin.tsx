import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../store/features/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const resultAction = await dispatch(loginAdmin({ username, password }));
        if (loginAdmin.fulfilled.match(resultAction)) {
            navigate('/admin');
        }
    };

    return (
        <form className="flex flex-col items-center justify-center pb-35 gap-1 w-screen h-screen" onSubmit={handleSubmit}>
            <input
                className="bg-gray-200 rounded-md p-2 w-[200px] outline-none"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                className="bg-gray-200 rounded-md p-2 w-[200px] outline-none"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button className="bg-gray-200 rounded-md p-2 w-[200px] cursor-pointer" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default AdminLogin;
