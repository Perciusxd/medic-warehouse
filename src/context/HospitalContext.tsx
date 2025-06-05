'use client';
import { useAuth } from '@/components/providers';
import React, { createContext, useContext, useState } from 'react';

type HospitalContextType = {
    loggedInHospital: string;
    setLoggedInHospital: (value: string) => void;
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth(); // Assuming useAuth is defined in your providers.tsx
    const [loggedInHospital, setLoggedInHospital] = useState('');

    return (
        <HospitalContext.Provider value={{ loggedInHospital, setLoggedInHospital }}>
            {children}
        </HospitalContext.Provider>
    );
};

export const useHospital = () => {
    const context = useContext(HospitalContext);
    if (!context) {
        throw new Error('useHospital must be used within a HospitalProvider');
    }
    return context;
};