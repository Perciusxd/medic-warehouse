"use client";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NotificationNumber from "@/components/ui/notification-number";
import { useRouter } from "next/navigation";
import { useHospital } from "@/context/HospitalContext";
import BorrowDashboard from "./borrow/page";
import SharingDashboard from "./sharing/page";
import StatusDashboard from "./status/page";
import TransferDashboard from "./transfer/page";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";

interface Medicine {
    ID: string;
    Name: string;
    BatchNumber: string;
    CurrentLocation: string;
    ExpiryDate: string;
    Price: number;
    Temperature: string;
    Owner?: string;
    Manufacturer?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { user, loading } = useAuth(); // ใช้ context
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [selectedTab, setSelectedTab] = useState('borrow');
    const [totalBorrow, setTotalBorrow] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     // redirect ถ้าไม่ login
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);
    
    // set default hospital below
    // const [loggedInHospital, setLoggedInHospital] = useState('Na Mom Hospital');
    // set hospital from user
    const { loggedInHospital, setLoggedInHospital } = useHospital();
    const [borrowNumber, setBorrowNumber] = useState(0);
    
    // fetch medicines
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/queryAll');
                if (!response.ok) {
                    throw new Error('Failed to fetch medicines');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMedicines(data);
                } else if (data && typeof data === 'object') {
                    setMedicines(Object.values(data));
                } else {
                    setMedicines([]);
                    setError('Invalid data format received');
                }
            } catch (error) {
                setError('Failed to load medicines');
                setMedicines([]);
            } finally {
                setIsLoading(false);
            }
        };
        if (user?.hospitalName) {
            setLoggedInHospital(user.hospitalName);
            console.log("User hospital name:", user.hospitalName);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
        fetchMedicines();
    }, [user?.hospitalName]);

    // useEffect(() => {
    //     console.log("Logged in hospital:", loggedInHospital);
        
    //     fetch("/api/queryAll")
    //         .then((response) => response.json())
    //         .then((data) => {                
    //             const filteredMedicines = data.filter((medicine: any) => medicine.PostingHospital !== loggedInHospital);
    //             setMedicines(filteredMedicines);

    //             const borrowCount = data.reduce((total: any, medicine: any) => {
    //                 if (!medicine.BorrowRecords) return total;
    //                 const hospitalBorrows = medicine.BorrowRecords.filter(
    //                     (record: any) => record.BorrowingHospital === loggedInHospital
    //                 ).length;
    //                 return total + hospitalBorrows;
    //             }, 0);

    //             setTotalBorrow(borrowCount);
    //         })
    //         .catch((error) => console.error("Error fetching data:", error));
    // }, [loggedInHospital]);
    
    

    return (
        
        <div className="container mx-auto p-4">
            {/* <h1 className="text-4xl font-black mb-4 mt-8">
                Welcome back,&nbsp;
                <span className="font-extralight font-mono">{loggedInHospital}</span>
            </h1> */}

            {isLoading && (
                <div className="flex justify-center items-center my-8 h-[300px]">
                    <div className="flex flex-col items-center">
                        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></span>
                        <span className="text-blue-700 font-medium">Loading...</span>
                    </div>
                </div>
            )}
                        

            { !isLoading && (
                <div className="mb-6 w-full md:w-1/3">
                    <Select value={user?.hospitalName || loggedInHospital} onValueChange={(value) => setLoggedInHospital(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Hospital" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Songkla Hospital">Songkla Hospital</SelectItem>
                            <SelectItem value="Hatyai Hospital">Hat Yai Hospital</SelectItem>
                            <SelectItem value="Na Mom Hospital">Na Mom Hospital</SelectItem>
                            <SelectItem value="Jana Hospital">Jana Hospital</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            { !isLoading && (
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
                    <BorrowDashboard/>
                </TabsContent>
                <TabsContent value="return">
                    <SharingDashboard />
                </TabsContent>
                <TabsContent value="status">
                    <StatusDashboard />
                </TabsContent>
                <TabsContent value="transfer">
                    <TransferDashboard />
                </TabsContent>
            </Tabs>
            )}

            {/* <div className="mb-6 w-full md:w-1/3">
                <Select value={user?.hospitalName || loggedInHospital} onValueChange={(value) => setLoggedInHospital(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Songkla Hospital">Songkla Hospital</SelectItem>
                        <SelectItem value="Hatyai Hospital">Hat Yai Hospital</SelectItem>
                        <SelectItem value="Na Mom Hospital">Na Mom Hospital</SelectItem>
                        <SelectItem value="Jana Hospital">Jana Hospital</SelectItem>
                    </SelectContent>
                </Select>
            </div> */}

            {/* <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2">
                    <TabsTrigger value="borrow">เวชภัณฑ์ยาที่ขาดแคลน {
                        borrowNumber > 0 ? <NotificationNumber number={borrowNumber} /> : null
                        }</TabsTrigger>
                    <TabsTrigger value="return">เวชภัณฑ์ยาที่ต้องการแบ่งปัน</TabsTrigger>
                    <TabsTrigger value="status">รายการยาที่ขอยืม <NotificationNumber number={2} /></TabsTrigger>
                    <TabsTrigger value="transfer">รายการยาที่ให้ยืม</TabsTrigger>
                </TabsList>

                <TabsContent value="borrow">
                    <BorrowDashboard/>
                </TabsContent>
                <TabsContent value="return">
                    <SharingDashboard />
                </TabsContent>
                <TabsContent value="status">
                    <StatusDashboard />
                </TabsContent>
                <TabsContent value="transfer">
                    <TransferDashboard />
                </TabsContent>
            </Tabs> */}
        </div>
    );
}
