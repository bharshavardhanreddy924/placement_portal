import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(() => localStorage.getItem('role') || 'student');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('role', role);
        fetchCurrentUser();
    }, [role]);

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await api.get('/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        role,
        setRole,
        user,
        loading,
        refetchUser: fetchCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};