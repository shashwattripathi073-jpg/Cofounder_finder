'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import socket from '@/lib/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const [user, setUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user');
            if (saved) return JSON.parse(saved);
        }
        return null;
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                socket.connect();
                socket.emit('register', user?.id);
                try {
                    // Always try to fetch freshest user data to get missing fields
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // ensure token is bound
                    const { data } = await api.get('/users/profile');
                    if (data) {
                        const updatedUser = { ...user, ...data, id: data._id };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                } catch (err) {
                    console.error('Failed to refresh profile:', err);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        socket.connect();
        socket.emit('register', data.user.id);
        router.push('/dashboard');
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        socket.connect();
        socket.emit('register', data.user.id);
        router.push('/dashboard');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        socket.disconnect();
        router.push('/login');
    };

    return (
        <AuthContext value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);
