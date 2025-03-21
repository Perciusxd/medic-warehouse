"use client";

import BorrowDashboard from "./borrow/page";
import ReturnDashboard from "./return/page";
import { useState } from 'react';

const mockData = [
    {
        date: '2023-10-01',
        hospitalName: 'City Hospital',
        medicineName: 'Aspirin',
        medicineSize: '500mg',
        medicineType: 'Tablet',
        quantity: 100
    },
    {
        date: '2023-10-02',
        hospitalName: 'County Hospital',
        medicineName: 'Ibuprofen',
        medicineSize: '200mg',
        medicineType: 'Capsule',
        quantity: 200
    },
    {
        date: '2023-10-03',
        hospitalName: 'General Hospital',
        medicineName: 'Paracetamol',
        medicineSize: '650mg',
        medicineType: 'Tablet',
        quantity: 150
    },
    {
        date: '2023-10-04',
        hospitalName: 'Community Hospital',
        medicineName: 'Amoxicillin',
        medicineSize: '250mg',
        medicineType: 'Capsule',
        quantity: 300
    },
    {
        date: '2023-10-05',
        hospitalName: 'Regional Hospital',
        medicineName: 'Ciprofloxacin',
        medicineSize: '500mg',
        medicineType: 'Tablet',
        quantity: 120
    }
];



export default function Dashboard() {

    const [selectedTab, setSelectedTab] = useState('borrow');

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Offer</div>
                    <div className="text-2xl text-blue-500 font-bold">10</div>
                </div>
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Borrow</div>
                    <div className="text-2xl text-blue-500 font-bold">5</div>
                </div>
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Sending</div>
                    <div className="text-2xl text-blue-500 font-bold">3</div>
                </div>
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Return</div>
                    <div className="text-2xl text-blue-500 font-bold">7</div>
                </div>
            </div>
            <div className="mb-4">
                <div className="flex">
                    <button 
                        className={`px-4 py-2 ${selectedTab === 'borrow' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'} focus:outline-none`}
                        onClick={() => setSelectedTab('borrow')}
                    >
                        Borrow
                    </button>
                    <button 
                        className={`px-4 py-2 ${selectedTab === 'return' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'} focus:outline-none`}
                        onClick={() => setSelectedTab('return')}
                    >
                        Return
                    </button>
                </div>
            </div>
            {selectedTab === 'borrow' ? <BorrowDashboard /> : <ReturnDashboard />}
        </div>
    )
};