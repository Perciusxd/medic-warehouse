'use client';
import React, { createContext, useContext, useState } from 'react';

type ApiEndpointContextType = {
    apiEndpoint: string;
    setApiEndpoint: (value: string) => void;
    isEndpointSet: boolean;
};

const ApiEndpointContext = createContext<ApiEndpointContextType | undefined>(undefined);

export const ApiEndpointProvider = ({ children }: { children: React.ReactNode }) => {
    const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000');

    return (
        <ApiEndpointContext.Provider 
            value={{ 
                apiEndpoint, 
                setApiEndpoint, 
                isEndpointSet: !!apiEndpoint 
            }}
        >
            {children}
        </ApiEndpointContext.Provider>
    );
};

export const useApiEndpoint = () => {
    const context = useContext(ApiEndpointContext);
    if (!context) {
        throw new Error('useApiEndpoint must be used within an ApiEndpointProvider');
    }
    return context;
}; 