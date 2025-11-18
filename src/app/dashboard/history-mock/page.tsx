'use client';
import '@/utils/polyfill';
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import DoughnutChart from "./DoughnutChart";
// import PDFPreviewButton from "./historyPDF";
import { mockMedicineTableData } from "./mock-data";

import dynamic from 'next/dynamic';
import { fetchAllStatusByTicketType } from "@/pages/api/statusService";
import { useAuth } from "@/components/providers";
import { useMedicineRequests, useMedicineRequestsStatus, useMedicineSharing, useMedicineSharingStatus } from "@/hooks/useMedicineAPI";
import { Printer } from "lucide-react";
import { SelectHospitalDialog } from "./select-hospital-dialog";
import { generateAndOpenPDF } from "./historyPDF";
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
  const { medicineRequests } = useMedicineRequests(loggedInHospital ?? '', statusFilter);
  const { medicineSharing } = useMedicineSharingStatus(loggedInHospital ?? '', statusFilter);

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
    if (!loggedInHospital) return;
    const result = allData.flatMap((item: any) => {
      if (item.ticketType === 'sharing' && Array.isArray(item.responseDetails) && item.responseDetails.length > 0) {
        if (item.ticketType !== 'sharing') return [];

        if (!Array.isArray(item.responseDetails)) return [];

        const { responseDetails, ...header } = item;

        return responseDetails
          .filter((resp: any) => resp.acceptedOffer && (resp.status === 'to-transfer' || resp.status === 'to-confirm' || resp.status === 'in-return')) // เอาเฉพาะที่มี offer
          .map((resp: any) => ({
            ...header,
            responseDetails: [resp],
        }));
      }

      // ถ้าไม่ได้ sharing หรือไม่มี responseDetails ให้ข้ามไปเลย
      if ((item.status === 'to-transfer' || item.status === 'to-confirm' || item.status === 'in-return') && item.ticketType === 'request') {
        return item;
      }
      return [];
    });

    // console.log(result);
    
    
    // กรองเฉพาะ status = 'to-return' เท่านั้น
    // const toReturnData = allData.filter((item: any) => 
    //   ((item.status === 'to-transfer' || item.status === 'to-confirm' || item.status === 'in-return') && item.ticketType === 'request')
    // );

    // console.log('return', result);
    
    setFilteredData(result);
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
    const mapped = result
    //   .filter((item: any) => 
    //     // item.ticketType === 'sharing' && 
    //     (item.responseDetails?.[0]?.status === 'to-transfer' || item.responseDetails?.[0]?.status === 'to-confirm' || item.responseDetails?.[0]?.status === 'in-return') 
    // || ((item.status === 'to-transfer' || item.status === 'to-confirm' || item.status === 'in-return') && item.ticketType === 'request')
    //   )
      // copy in comment to condition if wanna close button that not have data
      // && item.responseDetails?.acceptedOffer
      .map((item: any) => {
        const resp = item.responseDetails?.[0] ?? item.requestDetails;
        const medsArr = user?.address;
        const hospitalName = item.ticketType === 'sharing' ? item.responseDetails[0].respondingHospitalNameTH : item.requestDetails.postingHospitalNameTH;
        const director = user?.director;
        const now = Date.now();
        const contact = user?.contact;
        const expectedReturnDate = resp.acceptedOffer ? resp.acceptedOffer.expectedReturnDate : resp.requestTerm?.expectedReturnDate;
        const diff = Number(expectedReturnDate) - now;
        const hostHospital = item.ticketType === 'sharing' ? item.postingHospitalNameTH : item.respondingHospitalNameTH;
        const directorPosition = user?.position;
        let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = Math.abs(diffDays);

        return {
          ticketType: item.ticketType,
          status: item.ticketType === 'sharing' ? item.responseDetails?.[0]?.status : item.status,
          responseDetails: item.responseDetails ? item.responseDetails : item.requestDetails,
          sharingMedicine: item.sharingMedicine ? item.sharingMedicine : item.offeredMedicine,
          sharingReturnTerm: item.sharingReturnTerm ? item.sharingReturnTerm : item.requestTerm,
          dayAmount: diffDays,
          overDue: diffDays > 90,
          address: medsArr,
          hospitalName,
          director,
          contact,
          hostHospital: hostHospital,
          directorPosition: directorPosition
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

  // Handler สำหรับเมื่อผู้ใช้เลือกโรงพยาบาลและรายการจาก modal
  const handleConfirmSelection = async (selectedHospital: string, selectedItems: any[]) => {
    
    // เตรียมข้อมูลสำหรับ PDF
    const pdfData = selectedItems.map((item: any) => ({
      ticketType: item.ticketType,
      responseDetails: item.responseDetails ? item.responseDetails : item.requestDetails,
      sharingMedicine: item.sharingMedicine ? item.sharingMedicine : item.offeredMedicine,
      sharingReturnTerm: item.sharingReturnTerm ? item.sharingReturnTerm : item.requestTerm,
      dayAmount: item.dayAmount,
      overDue: item.overDue,
      address: item.address,
      hospitalName: item.hospitalName,
      director: item.director,
      contact: item.contact,
      hostHospital: item.hostHospital,
      directorPosition: item.directorPosition
    }));

    // เปิด PDF โดยตรง
    await generateAndOpenPDF(pdfData);
  };


  if (isLoading) {
    return (
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
        </div>
      ) :
      <div className="max-w-full overflow-auto">
        <div className="flex flex-col gap-4 mt-[30px] mx-auto max-w-[90%]">
          <div className="flex justify-start gap-2">
            <div className="flex">
              <SelectHospitalDialog 
                data={reportData} 
                onConfirm={handleConfirmSelection}
                disabled={reportData.length === 0}
              />
            </div>
              </div>
              <div className="text-center">
                  <DataTable columns={columns} data={filteredData} />
              </div>
          </div>
      </div>
    );
  }
}