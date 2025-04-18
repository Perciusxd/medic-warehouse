"use client";
import BorrowDashboard from "./borrow/page";
import ReturnDashboard from "./return/page";
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [medicines, setMedicines] = useState<Array<{ ID: string; Name: string; BatchNumber: string; CurrentLocation: string; ExpiryDate: string; Price: number; Temperature: string; Owner?: string; Manufacturer?: string; }>>([]);
    const [selectedTab, setSelectedTab] = useState('borrow');

    useEffect(() => {
        fetch("api/queryAll")
            .then((response) => response.json())
            .then((data) => {setMedicines(data)})
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-black mb-4 mt-8">Welcome back, <span className="font-extralight font-mono">Songkhla Hospital</span></h1>
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
            {/* <div>{medicines ? (
                <div className="space-y-4">
                    {medicines.map((medicine) => (
                        <div key={medicine.ID} className="bg-white p-4 shadow rounded">
                            <h2 className="text-lg font-semibold">{medicine.Name}</h2>
                            <p className="text-sm text-gray-500">Batch: {medicine.BatchNumber}</p>
                            <p className="text-sm text-gray-500">Location: {medicine.CurrentLocation}</p>
                            <p className="text-sm text-gray-500">Expiry Date: {medicine.ExpiryDate}</p>
                            <p className="text-sm text-gray-500">Price: ${medicine.Price}</p>
                            <p className="text-sm text-gray-500">Temperature: {medicine.Temperature}</p>
                            {medicine.Owner && <p className="text-sm text-gray-500">Owner: {medicine.Owner}</p>}
                            {medicine.Manufacturer && <p className="text-sm text-gray-500">Manufacturer: {medicine.Manufacturer}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <div>Loading...</div>
            )}</div> */}
        </div>
    )
};