"use client";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NotificationNumber from "@/components/ui/notification-number";
import BorrowDashboard from "./borrow/page";
import ReturnDashboard from "./return/page";
import StatusDashboard from "./status/page";
import TransferDashboard from "./transfer/page";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [medicines, setMedicines] = useState([]);
    const [selectedTab, setSelectedTab] = useState('borrow');
    const [totalBorrow, setTotalBorrow] = useState(0);
    const [loggedInHospital, setLoggedInHospital] = useState('Na Mom Hospital');
    const [borrowNumber, setBorrowNumber] = useState(0);

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
    }, [loggedInHospital]);

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
                    </SelectContent>
                </Select>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            </div> */}

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2">
                    <TabsTrigger value="borrow">เวชภัณฑ์ยาที่ขาดแคลน {
                        borrowNumber > 0 ? <NotificationNumber number={borrowNumber} /> : null
                        }</TabsTrigger>
                    <TabsTrigger value="return">เวชภัณฑ์ยาที่ต้องการแบ่งปัน</TabsTrigger>
                    <TabsTrigger value="status">รายการยาที่ขอยืม <NotificationNumber number={2} /></TabsTrigger>
                    <TabsTrigger value="transfer">รายการยาที่ให้ยืม</TabsTrigger>
                </TabsList>

                <TabsContent value="borrow">
                    <BorrowDashboard loggedInHospital={loggedInHospital} setBorrowNumber={setBorrowNumber} />
                </TabsContent>
                <TabsContent value="return">
                    <ReturnDashboard />
                </TabsContent>
                <TabsContent value="status">
                    <StatusDashboard loggedInHospital={loggedInHospital} />
                </TabsContent>
                <TabsContent value="transfer">
                    <TransferDashboard loggedInHospital={loggedInHospital} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
