'use client';
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../request/data-table";
import { columns } from "./columns";
import DoughnutChart from "./DoughnutChart";
// import PDFPreviewButton from "./historyPDF";
import { mockMedicineTableData } from "./mock-data";

import dynamic from 'next/dynamic';
const PDFPreviewButton = dynamic(() => import('./historyPDF'), { ssr: false });

export default function HistoryDashboard() {
  const [mockDataV1, setMockDataV1] = useState(mockMedicineTableData);

  const [queryFromChart, setQueryFromChart] = useState<string | null>(null);


  const handleChartClick = (label: string) => {
  if (label === queryFromChart) {
    setMockDataV1(mockMedicineTableData); // reset
    setQueryFromChart(null);
  } else {
    let filterData: any;
    switch (label) {
      case 'แจ้งแบ่งปัน':
        filterData = mockMedicineTableData.filter(item => item.responseDetails[0].status === 'offered');
        break;
      case 'รอยืนยันให้ยืม':
        filterData = mockMedicineTableData.filter(item => item.responseDetails[0].status === 'pending');
        break;
      case 'รอส่งมอบ':
        filterData = mockMedicineTableData.filter(item => item.responseDetails[0].status === 'to-transfer');
        break;
      case 'รอรับคืน':
        filterData = mockMedicineTableData.filter(item => item.responseDetails[0].status === 'to-return');
        break;
      case 'เสร็จสิ้น':
        filterData = mockMedicineTableData.filter(item => item.responseDetails[0].status === 'completed');
        break;
    }

    setMockDataV1(filterData);
    setQueryFromChart(label);
  }
};

    const statusCompleted = mockDataV1.filter(item => item.responseDetails[0].status === 'completed').length;
    const statusPending = mockDataV1.filter(item => item.responseDetails[0].status === 'pending').length;
    const statusOffered = mockDataV1.filter(item => item.responseDetails[0].status === 'offered').length;
    const statusToTransfer = mockDataV1.filter(item => item.responseDetails[0].status === 'to-transfer').length;
    const statusToReturn = mockDataV1.filter(item => item.responseDetails[0].status === 'to-return').length;

    const config = {
      type: 'doughnut',
      data: {
      labels: ["แจ้งแบ่งปัน", "รอยืนยันให้ยืม", "รอส่งมอบ", "รอรับคืน", "เสร็จสิ้น"],
      datasets: [{
        data: [statusOffered,statusPending,statusToTransfer,statusToReturn, statusCompleted],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336'],
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

    // const mockLoanData = [
    //   {
    //     borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    //     hospital: "รพ.1",
    //     item: "Paracetamol",
    //     size: "500mg",
    //     unit: "Tablet",
    //     trademark: "ParaQuick",
    //     manufacturer: "MedCo",
    //     amount: 100,
    //     price: 2,
    //     totalValue: 200,
    //     expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    //     deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
    //     actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    //     returnedItem: "Paracetamol",
    //     daysBorrowed: 9
    //   },
    //  {
    //     borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    //     hospital: "รพ.2",
    //     item: "Paracetamol",
    //     size: "500mg",
    //     unit: "Tablet",
    //     trademark: "ParaQuick",
    //     manufacturer: "MedCo",
    //     amount: 100,
    //     price: 2,
    //     totalValue: 200,
    //     expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    //     deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
    //     actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    //     returnedItem: "Paracetamol",
    //     daysBorrowed: 9
    //   },{
    //     borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    //     hospital: "รพ.3",
    //     item: "Paracetamol",
    //     size: "500mg",
    //     unit: "Tablet",
    //     trademark: "ParaQuick",
    //     manufacturer: "MedCo",
    //     amount: 100,
    //     price: 2,
    //     totalValue: 200,
    //     expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    //     deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
    //     actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    //     returnedItem: "Paracetamol",
    //     daysBorrowed: 9
    //   },{
    //     borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    //     hospital: "รพ.4",
    //     item: "Paracetamol",
    //     size: "500mg",
    //     unit: "Tablet",
    //     trademark: "ParaQuick",
    //     manufacturer: "MedCo",
    //     amount: 100,
    //     price: 2,
    //     totalValue: 200,
    //     expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    //     deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
    //     actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    //     returnedItem: "Paracetamol",
    //     daysBorrowed: 9
    //   },
    // ]

    return (
        mockDataV1.length === 0 ? (
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
                <div>
                     <PDFPreviewButton data={mockDataV1}/>
                </div>

                <div>
                    <DataTable columns={columns} data={mockDataV1} />
                </div>
            </div>
        </div>
    )
}