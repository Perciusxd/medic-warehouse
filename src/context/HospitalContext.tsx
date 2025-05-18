'use client';
import React, { createContext, useContext, useState } from 'react';

type HospitalContextType = {
    loggedInHospital: string;
    setLoggedInHospital: (value: string) => void;
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedInHospital, setLoggedInHospital] = useState('Na Mom Hospital');

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