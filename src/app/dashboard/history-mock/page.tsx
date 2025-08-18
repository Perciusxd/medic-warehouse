'use client';
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../request/data-table";
import { columns } from "./columns";
import DoughnutChart from "./DoughnutChart";
// import PDFPreviewButton from "./historyPDF";
import { mockMedicineTableData } from "./mock-data";

import dynamic from 'next/dynamic';
import { fetchAllStatusByTicketType } from "@/pages/api/statusService";
import { useAuth } from "@/components/providers";
import { useMedicineRequests, useMedicineRequestsStatus, useMedicineSharing, useMedicineSharingStatus } from "@/hooks/useMedicineAPI";
import { Printer } from "lucide-react";
const PDFPreviewButton = dynamic(() => import('./historyPDF'), { ssr: false });

export default function HistoryDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const loggedInHospital = useMemo(() => user?.hospitalName, [user]);

  const statusFilter = useMemo(() => ['to-transfer',
                    'to-confirm',
                    'offered',
                    're-confirm',
                    'in-return',
                    'returned',
                    'confirm-return',
                  'pending','completed', 'to-return'], []);
  const { medicineRequests } = useMedicineRequestsStatus(loggedInHospital ?? '', statusFilter);
  const { medicineSharing } = useMedicineSharingStatus(loggedInHospital ?? '', statusFilter);
  // console.log(loggedInHospital, 'loggedInHospital');

  // รวมข้อมูลทั้งสองแบบ (รอให้ทั้งคู่ไม่เป็น undefined ก่อนถึงจะรวมและแสดงผล)
  const allData = useMemo(() => {
    // ถ้าข้อมูลยังไม่มา ให้คืนค่าเป็น array ว่างก่อน (จะทำให้ loading state ทำงานต่อ)
    if (medicineRequests === undefined || medicineSharing === undefined) return [];
    return [
      ...(medicineRequests || []),
      ...(medicineSharing || [])
    ];
  }, [medicineRequests, medicineSharing]);


  const [filteredData, setFilteredData] = useState<any[]>(allData);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    // console.log(loggedInHospital, 'loggedInHospital');    
    if (!loggedInHospital) return;
    setFilteredData(allData);
    // const mapped = allData.map((item: any) => {
    //   if (item.ticketType === 'sharing') {
    //     const resp = item.responseDetails?.[0] ?? {};
    //     const medsArr = item.postingHospitalAddress;
    //     const hospitalName = item.postingHospitalNameTH;
    //     const director = user?.director
    //     const now = Date.now();
    //     const expectedReturnDate = resp.acceptedOffer?.expectedReturnDate;
    //     const diff = Number(expectedReturnDate) - now;
    //     let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    //     if (diffDays < 0) {
    //       diffDays = Math.abs(diffDays)
    //     }
    //     // console.log('diffDays', diffDays);
        
    //     return {
    //       ticketType: item.ticketType,
    //       responseDetails: item.responseDetails,
    //       sharingMedicine: item.sharingMedicine,
    //       sharingReturnTerm: item.sharingReturnTerm,
    //       dayAmount: diffDays,
    //       overDue: diffDays > 90 ? true : false,
    //       address: medsArr,
    //       hospitalName: hospitalName,
    //       director: director
    //     }
    //   } else {
    //     return null
    //   }

    const mapped = allData
      .filter((item: any) => item.ticketType === 'sharing')
      // copy in comment to condition if wanna close button that not have data
      // && item.responseDetails?.acceptedOffer
      .map((item: any) => {
        const resp = item.responseDetails?.[0] ?? {};
        const medsArr = user?.address;
        const hospitalName = item.postingHospitalNameTH;
        const director = user?.director;
        const now = Date.now();
        const contact = user?.contact;
        const expectedReturnDate = resp.acceptedOffer?.expectedReturnDate;
        const diff = Number(expectedReturnDate) - now;
        let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = Math.abs(diffDays);

        return {
          ticketType: item.ticketType,
          responseDetails: item.responseDetails,
          sharingMedicine: item.sharingMedicine,
          sharingReturnTerm: item.sharingReturnTerm,
          dayAmount: diffDays,
          overDue: diffDays > 90,
          address: medsArr,
          hospitalName,
          director,
          contact
        };
      // });


      // else if (item.ticketType === 'request') {
      //   const resp = item.responseDetails?.[0] ?? {};
      //   const medsArr = item.postingHospitalAddress;
      //   const hospitalName = item.postingHospitalNameTH;
      //   const director = user?.director
      //   const now = Date.now();
      //   const expectedReturnDate = item.requestTerm.expectedReturnDate;
      //   const diff = Number(expectedReturnDate) - now;
      //   let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      //   if (diffDays < 0) {
      //     diffDays = Math.abs(diffDays)
      //   }
      //   // console.log('diffDays', diffDays);
        
      //   return {
      //     ticketType: item.ticketType,
      //     responseDetails: item.responseDetails,
      //     requestMedicine: item.requestMedicine,
      //     offeredMedicine: resp.offeredMedicine,
      //     requestTerm: item.requestTerm,
      //     dayAmount: diffDays,
      //     overDue: diffDays > 90 ? true : false,
      //     address: medsArr,
      //     hospitalName: hospitalName,
      //     director: director
      //   }
      // }
      
    });

    setReportData(mapped);
    // console.log('mapped', mapped);
    
  }, [loggedInHospital, allData, user]);

  useEffect(() => {
    // เงื่อนไขเริ่มต้น
    if (!loggedInHospital || !medicineRequests || medicineRequests.length === 0 || !medicineSharing || medicineSharing.length === 0) {
      setIsLoading(true);

      // ตั้งเวลา fallback 5 วินาที
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // มีข้อมูลแล้ว => ไม่ต้องโหลด
      setIsLoading(false);
    }
  }, [loggedInHospital, medicineRequests, medicineSharing]);

  
  // const [mockDataV1, setMockDataV1] = useState(mockMedicineTableData);

  const [queryFromChart, setQueryFromChart] = useState<string | any>(null);

  const handleChartClick = (label: string) => {
    // console.log('label', label);
    // console.log(queryFromChart, 'queryFromChart');


    if (label === queryFromChart) {
      // setMockDataV1(mockMedicineTableData); // reset
      setFilteredData(allData);
      setQueryFromChart(null);
      // console.log(allData, 'allData');
      
    } else {
      let filterData: any;
      console.log(label, 'label');
      console.log('all', filteredData);
      
      
      switch (label) {
        case 'แจ้งแบ่งปัน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'offered');
          break;
        case 'รอยืนยันให้ยืม':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'pending');
          break;
        case 'รอส่งมอบ':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'to-transfer');
          break;
        case 'รอรับคืน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'to-return');
          break;
        case 'เสร็จสิ้น':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'completed' || item.responseDetails[0].status === 'returned');
          break;
        case 'รอยืนยันการส่งคืน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'to-confirm');
          break;
        case 'รอยืนยันการรับคืน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 're-confirm');
          break;
        case 'ต้องส่งคืน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'in-return');
          break;
        case 'ยืนยันการส่งคืน':
          filterData = filteredData.filter((item:any) => item.responseDetails[0].status === 'confirm-return');
          break;
        default:
          filterData = allData;
      }
      // console.log(filterData, 'filterData');
      
      // setMockDataV1(filterData);
      setFilteredData(filterData);
      setQueryFromChart(label);
    }
  };

  // console.log('allData', allData);
  // console.log('filteredData', filteredData);
  // let config: any;
  // เสร็จสิ้น
  const statusCompleted = filteredData.filter(item => item.responseDetails[0].status === 'completed' || item.responseDetails[0].status === 'returned').length;
  // รอยืนยันให้ยืม
  const statusPending = filteredData.filter(item => item.responseDetails[0].status === 'pending').length;
  // แจ้งแบ่งปัน
  const statusOffered = filteredData.filter(item => item.responseDetails[0].status === 'offered').length;
  // รอส่งมอบ
  const statusToTransfer = filteredData.filter(item => item.responseDetails[0].status === 'to-transfer').length;
  // รอรับคืน
  const statusToReturn = filteredData.filter(item => item.responseDetails[0].status === 'to-return').length;
  // ต้องส่งคืน
  const statusInReturn = filteredData.filter(item => item.responseDetails[0].status === 'in-return').length;
  // รอยืนยันการส่งคืน
  const statusToConfirm = filteredData.filter(item => item.responseDetails[0].status === 'to-confirm').length;
  // รอยืนยันการรับคืน
  const statusReConfirm = filteredData.filter(item => item.responseDetails[0].status === 're-confirm').length;
  // ยืนยันการส่งคืน
  const statusConfirmReturn = filteredData.filter(item => item.responseDetails[0].status === 'confirm-return').length;
  // ส่งคืนเสร็จสิ้น
  
  const config = {
    type: 'doughnut',
    data: {
      labels: ["แจ้งแบ่งปัน", "รอยืนยันให้ยืม", "รอส่งมอบ", "รอรับคืน", "เสร็จสิ้น", "รอยืนยันการส่งคืน", "รอยืนยันการรับคืน", "ต้องส่งคืน", "ยืนยันการส่งคืน"],
      datasets: [{
        data: [statusOffered,statusPending,statusToTransfer,statusToReturn, statusCompleted, statusToConfirm, statusReConfirm, statusInReturn, statusConfirmReturn],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#FFEB3B', '#00BCD4', '#E91E63', '#8BC34A'],
        hoverOffset: 4,
      }],
    },
    options: {
      events: ['click'],
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: 'Medicine Request Status Overview',
        },
      },
    },
  }

  if (isLoading) {
    return (
      // <div className="flex flex-col items-center justify-center h-screen">
      //   <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      //     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      //     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      //   </svg>
      //   <p className="mt-4 text-lg font-medium">กำลังโหลดข้อมูล...</p>
      // </div>
      <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex flex-col items-center">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></span>
              <span className="text-blue-700 font-medium">Loading...</span>
          </div>
      </div>
    );
  } else {

    return (
      filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">ไม่มีข้อมูล</h2>
          {/* <p className="text-gray-600">กรุณาเลือกตัวกรองที่แตกต่างกัน</p> */}
        </div>
      ) :
      <div className="max-w-full overflow-auto">
        <div className="flex justify-center">
          <DoughnutChart data={config.data} options={config.options} query={handleChartClick} />
        </div>
        <div className="flex flex-col gap-4 mt-[30px] mx-auto max-w-[90%]">
          <div className="flex justify-start gap-2">
            <div className="flex">
              {/* <Button disabled={reportData.length === 0} className={` transition-opacity ${reportData.length === 0 ? "opacity-50" : "opacity-100"}`}> */}
                <PDFPreviewButton data={reportData} disabled={reportData.length === 0} />
              {/* </Button> */}
            </div>
                {/* <div className="flex gap-2">
                  <Button
                    variant={queryFromChart === 'request' ? 'default' : 'outline'}
                    onClick={() => {
                      setFilteredData(allData.filter((item: any) => item.ticketType === 'request'));
                      setQueryFromChart('request');
                    }}
                  >
                    ขอยืม
                  </Button>
                  <Button
                    variant={queryFromChart === 'sharing' ? 'default' : 'outline'}
                    onClick={() => {
                      setFilteredData(allData.filter((item: any) => item.ticketType === 'sharing'));
                      setQueryFromChart('sharing');
                    }}
                  >
                    ให้ยืม
                  </Button>
                  <Button
                    variant={queryFromChart === null ? 'default' : 'outline'}
                    onClick={() => {
                      setFilteredData(allData);
                      setQueryFromChart(null);
                    }}
                  >
                    ทั้งหมด
                  </Button>
                </div> */}
              </div>
              <div className="text-center">
                  <DataTable columns={columns} data={filteredData} />
              </div>
          </div>
      </div>
    );
  }
}