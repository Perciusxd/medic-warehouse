'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../borrow/data-table";
import { columns } from "./columns";
import DoughnutChart from "./DoughnutChart";
import PDFPreviewButton from "./historyPDF";

export default function HistoryDashboard() {

    const mockLoanData = [
      {
        borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        hospital: "รพ.1",
        item: "Paracetamol",
        size: "500mg",
        unit: "Tablet",
        trademark: "ParaQuick",
        manufacturer: "MedCo",
        amount: 100,
        price: 2,
        totalValue: 200,
        expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
        actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        returnedItem: "Paracetamol",
        daysBorrowed: 9
      },
     {
        borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        hospital: "รพ.2",
        item: "Paracetamol",
        size: "500mg",
        unit: "Tablet",
        trademark: "ParaQuick",
        manufacturer: "MedCo",
        amount: 100,
        price: 2,
        totalValue: 200,
        expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
        actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        returnedItem: "Paracetamol",
        daysBorrowed: 9
      },{
        borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        hospital: "รพ.3",
        item: "Paracetamol",
        size: "500mg",
        unit: "Tablet",
        trademark: "ParaQuick",
        manufacturer: "MedCo",
        amount: 100,
        price: 2,
        totalValue: 200,
        expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
        actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        returnedItem: "Paracetamol",
        daysBorrowed: 9
      },{
        borrowedDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        hospital: "รพ.4",
        item: "Paracetamol",
        size: "500mg",
        unit: "Tablet",
        trademark: "ParaQuick",
        manufacturer: "MedCo",
        amount: 100,
        price: 2,
        totalValue: 200,
        expectedReturnDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        deliveryDate: Date.now() - 9 * 24 * 60 * 60 * 1000,
        actualReturnDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        returnedItem: "Paracetamol",
        daysBorrowed: 9
      },
    ]

    return (
        <div className="max-w-full">
            <div className="flex justify-center">
                <DoughnutChart/>
            </div>
            <div className="flex flex-col gap-4 mt-[30px] mx-auto max-w-[90%]">
                <div>
                     <PDFPreviewButton data={mockLoanData}/>
                </div>

                <div>
                    <DataTable columns={columns} data={mockLoanData} />
                </div>
            </div>
        </div>
    )
}