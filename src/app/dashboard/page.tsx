"use client";
import BorrowDashboard from "./borrow/page";
import ReturnDashboard from "./return/page";
import StatusDashboard from "./status/page";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
    const router = useRouter();
    const [medicines, setMedicines] = useState([]);
    const [selectedTab, setSelectedTab] = useState('borrow');
    const [totalBorrow, setTotalBorrow] = useState(0);
    const [loggedInHospital, setLoggedInHospital] = useState('Na Mom Hospital');

    useEffect(() => {
        fetch("api/queryAll")
            .then((response) => response.json())
            .then((data) => {
                const filteredMedicines = data.filter(medicine => medicine.PostingHospital !== loggedInHospital);
                setMedicines(filteredMedicines);

                const borrowCount = data.reduce((total, medicine) => {
                    if (!medicine.BorrowRecords) return total;

                    const hospitalBorrows = medicine.BorrowRecords.filter(
                        record => record.BorrowingHospital === loggedInHospital
                    ).length;

                    return total + hospitalBorrows;
                }, 0);

                setTotalBorrow(borrowCount);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [loggedInHospital]); // refetch when hospital changes

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-black mb-4 mt-8">
                Welcome back,&nbsp;
                <span className="font-extralight font-mono">{loggedInHospital}</span>
            </h1>

            <div className="mb-6 w-full md:w-1/3">
                <Select value={loggedInHospital} onValueChange={(value) => setLoggedInHospital(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Na Mom Hospital">Na Mom Hospital</SelectItem>
                        <SelectItem value="Hat Yai Hospital">Hat Yai Hospital</SelectItem>
                        <SelectItem value="Songkhla Hospital">Songkhla Hospital</SelectItem>
                        <SelectItem value="Hospital A">Hospital A</SelectItem>
                        {/* Add more hospitals as needed */}
                    </SelectContent>
                </Select>
            </div>

            {/* Dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Offer</div>
                    <div className="text-2xl text-blue-500 font-bold">10</div>
                </div>
                <div className="bg-white p-4 shadow rounded h-24 flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">Borrow</div>
                    <div className="text-2xl text-blue-500 font-bold">{totalBorrow}</div>
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

            {/* Tab buttons */}
            <div className="mb-4 flex">
                <button
                    className={`px-4 py-2 ${selectedTab === 'borrow' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'} focus:outline-none`}
                    onClick={() => setSelectedTab('borrow')}
                >
                    เวชภัณฑ์ยาที่ขาดแคลน | Borrow
                </button>
                <button
                    className={`px-4 py-2 ${selectedTab === 'return' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'} focus:outline-none`}
                    onClick={() => setSelectedTab('return')}
                >
                    เวชภัณฑ์ยาที่ต้องการแบ่งปัน | Share
                </button>
                <button
                    className={`px-4 py-2 ${selectedTab === 'status' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'} focus:outline-none`}
                    onClick={() => setSelectedTab('status')}
                >
                    Status
                </button>
            </div>

            {/* Conditional rendering */}
            {selectedTab === 'borrow' && <BorrowDashboard loggedInHospital={loggedInHospital} />}
            {selectedTab === 'return' && <ReturnDashboard />}
            {selectedTab === 'status' && <StatusDashboard />}
        </div>
    )
}
