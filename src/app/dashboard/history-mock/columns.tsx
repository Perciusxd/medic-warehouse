"use client"
import { useEffect,useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format } from "date-fns"
import { useHospital } from "@/context/HospitalContext";
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck,BookDown ,BookUp, SquareX ,SquareCheck} from "lucide-react"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "borrowedDate",
    size : 100,
    header: "วันที่ให้ยืม",
    cell: ({ row }) => {
      const date = new Date(Number(row.original.createdAt));
      return <span>{!isNaN(date.getTime()) ? date.toLocaleDateString("th-TH") : '-'}</span>;
      // const date = new Date(row.original.createdAt);
      // return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "hospital",
    size : 100,
    header: "ร.พ. ให้ยืม",
    cell: ({ row }) => {
      const hospitalName = row.original.responseDetails ? row.original.responseDetails[0].respondingHospitalNameTH : row.original.requestDetails.postingHospitalNameTH;
      return (
        <span className="text-sm font-medium text-gray-600">
          {hospitalName ? hospitalName : "-"}
        </span>
      );
    }
  },
  {
    accessorKey: "item",
    size : 100,
    header: "รายการ",
    cell: ({ row }) => {
      if (row.original.ticketType === 'sharing') {
        const item = row.original.sharingMedicine.name;
        return (
          <span className="text-sm font-medium text-gray-600">
            {item ? item : "-"}
          </span>
        );
      } else if (row.original.ticketType === 'request') {
        const item = row.original.offeredMedicine.name;
        return (
          <span className="text-sm font-medium text-gray-600">
            {item ? item : "-"}
          </span>
        );
      }
    }
  },
  {
    accessorKey: "size",
    size : 50,
    header: "ขนาด",
    cell: ({ row }) => {
      if (row.original.ticketType === 'sharing') {
        const size = row.original.sharingMedicine.quantity;
        const unit = row.original.sharingMedicine.unit;
        return (
          <span className="text-sm font-medium text-gray-600">
            {size && unit ? size + '/' + unit : "-"}

            {/* {size ? size : "-"} */}
          </span>
        );
      } else if (row.original.ticketType === 'request') {
        const size = row.original.offeredMedicine.quantity;
        const unit = row.original.offeredMedicine.unit;
        return (
          <span className="text-sm font-medium text-gray-600">
            {size && unit ? size + '/' + unit : "-"}
            {/* {size ? size : "-"} */}
          </span>
        );
      }
    }
  },
  // {
  //   accessorKey: "unit",
  //   size : 50,
  //   header: "หน่วย",
  //   cell: ({ row }) => {
  //     if (row.original.ticketType === 'sharing') {
  //       const unit = row.original.sharingMedicine.unit;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {unit ? unit : "-"}
  //         </span>
  //       );
  //     } else if (row.original.ticketType === 'request') {
  //       const unit = row.original.offeredMedicine.unit;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {unit ? unit : "-"}
  //         </span>
  //       );
  //     }
  //   }
  // },
  {
    accessorKey: "trademark",
    size : 100,
    header: "ชื่อการค้า",
    cell: ({ row }) => {
      if (row.original.ticketType === 'sharing') {
        const trademark = row.original.sharingMedicine.trademark;
        return (
          <span className="text-sm font-medium text-gray-600">
            {trademark ? trademark : "-"}
          </span>
        );
      } else if (row.original.ticketType === 'request') {
        const trademark = row.original.offeredMedicine.trademark;
        return (
          <span className="text-sm font-medium text-gray-600">
            {trademark ? trademark : "-"}
          </span>
        );
      }
    }
  },
  {
    accessorKey: "manufacturer",
    size : 100,
    header: "ผู้ผลิต",
    cell: ({ row }) => {
      if (row.original.ticketType === 'sharing') {
        const manufacturer = row.original.sharingMedicine.manufacturer;
        return (
          <span className="text-sm font-medium text-gray-600">
            {manufacturer ? manufacturer : "-"}
          </span>
        );
      } else if (row.original.ticketType === 'request') {
        const manufacturer = row.original.offeredMedicine.manufacturer;
        return (
          <span className="text-sm font-medium text-gray-600">
            {manufacturer ? manufacturer : "-"}
          </span>
        );
      }
    }
  },
  // {
  //   accessorKey: "amount",
  //   size : 50,
  //   header: "จำนวน",
  //   cell: ({ row }) => {
  //     if (row.original.ticketType === 'sharing') {
  //       const amount = row.original.sharingMedicine.sharingAmount;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {amount ? amount : "-"}
  //         </span>
  //       );
  //     } else if (row.original.ticketType === 'request') {
  //       const amount = row.original.offeredMedicine.requestAmount;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {amount ? amount : "-"}
  //         </span>
  //       );
  //     }
  //   }
  // },
  // {
  //   accessorKey: "price",
  //   size : 50,
  //   header: "ราคา",
  //   cell: ({ row }) => {
  //     if (row.original.ticketType === 'sharing') {
  //       const price = row.original.sharingMedicine.pricePerUnit;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {price ? price + ' บาท' : "-"}
  //         </span>
  //       );
  //     } else if (row.original.ticketType === 'request') {
  //       const price = row.original.offeredMedicine.pricePerUnit;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {price ? price + ' บาท' : "-"}
  //         </span>
  //       );
  //     }
  //   }
  // },
  // {
  //   accessorKey: "totalValue",
  //   size : 80,
  //   header: "มูลค่า",
  //   cell: ({ row }) => {
  //     if (row.original.ticketType === 'sharing') {
  //       const price = row.original.sharingMedicine.pricePerUnit;
  //       const amount = row.original.sharingMedicine.sharingAmount;
  //       const totalValue = price * amount;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {totalValue ? totalValue + ' บาท' : "-"}
  //         </span>
  //       );
  //     } else if (row.original.ticketType === 'request') {
  //       const price = row.original.offeredMedicine.pricePerUnit;
  //       const amount = row.original.offeredMedicine.requestAmount;
  //       const totalValue = price * amount;
  //       return (
  //         <span className="text-sm font-medium text-gray-600">
  //           {totalValue ? totalValue + ' บาท' : "-"}
  //         </span>
  //       );
  //     }
  //   }
  // },
  {
    accessorKey: "expectedReturnDate",
    size : 100,
    header: "วันที่คาดว่าจะได้รับคืน",
    cell: ({ row }) => {
      if (row.original.ticketType === 'sharing') {
        const expectedReturnDate = Number(row.original.responseDetails[0].acceptedOffer?.expectedReturnDate);
        const date = new Date(expectedReturnDate);
        return <span>{!isNaN(date.getTime()) ? date.toLocaleDateString("th-TH") : '-'}</span>;
      }
      else if (row.original.ticketType === 'request') {
        const expectedReturnDate = Number(row.original.requestDetails.requestTerm.expectedReturnDate);
        const date = new Date(expectedReturnDate);
        return <span>{!isNaN(date.getTime()) ? date.toLocaleDateString("th-TH") : '-'}</span>;
      }
      // const date = new Date(row.original.expectedReturnDate);
      // return <span>{date.toLocaleDateString()}</span>;
    },
  },
  // {
  //   accessorKey: "deliveryDate",
  //   size : 100,
  //   header: "วันที่ส่งมอบยา",
  //   cell: ({ row }) => {
  //     if (row.original.ticketType === 'sharing') {
  //       const deliveryDate = row.original.sharingMedicine.deliveryDate;
  //       const date = new Date(deliveryDate);
  //       return <span>{!isNaN(date.getTime()) ? date.toLocaleDateString("th-TH") : '-'}</span>;
  //     }
  //     else if (row.original.ticketType === 'request') {
  //       const deliveryDate = row.original.requestMedicine.deliveryDate;
  //       const date = new Date(deliveryDate);
  //       return <span>{!isNaN(date.getTime()) ? date.toLocaleDateString("th-TH") : '-'}</span>;
  //     }
  //     // const date = new Date(row.original.deliveryDate);
  //     // return <span>{date.toLocaleDateString()}</span>;
  //   },
  // },
  // {
  //   accessorKey: "actualReturnDate",
  //   size : 100,
  //   header: "วันที่ได้รับคืน",
  //   cell: ({ row }) => {
  //     const date = new Date(row.original.responseDetails[0].actualReturnDate);
  //     return <span>{date.toLocaleDateString("th-TH") !== 'Invalid Date' ? date.toLocaleDateString("th-TH") : '-'}</span>;
  //     // const date = new Date(row.original.actualReturnDate);
  //     // return <span>{date.toLocaleDateString()}</span>;
  //   },
  // },
  {
    accessorKey: "daysBorrowed",
    size : 100,
    header: "จำนวนวันที่ยืม",
    cell: ({ row }) => {
      let responseDetail = row.original.responseDetails?.[0];
      if (!responseDetail && row.original.requestDetails) {
        responseDetail = row.original.requestDetails;
      } else if (!responseDetail) {
        return <span>-</span>;
      }
      
      const expectedReturnDate = responseDetail.acceptedOffer ? new Date(Number(responseDetail.acceptedOffer?.expectedReturnDate)) : new Date(Number(responseDetail.requestTerm?.expectedReturnDate));
      const today = new Date();
      
      if (isNaN(expectedReturnDate.getTime())) {
        return <span>-</span>;
      }
      
      // คำนวณจำนวนวันจากวันที่คาดว่าจะคืนถึงวันนี้
      const daysOverdue = Math.ceil((today.getTime() - expectedReturnDate.getTime()) / (1000 * 3600 * 24));
      
      // ถ้าเป็นค่าบวก = เลยกำหนด, ถ้าเป็นค่าลบ = ยังไม่ถึงกำหนด
      if (daysOverdue > 0) {
        return <span className="text-red-600 font-semibold">{daysOverdue} วัน (เลยกำหนด)</span>;
      } else if (daysOverdue === 0) {
        return <span className="text-yellow-600 font-semibold">วันนี้ (ครบกำหนด)</span>;
      } else {
        return <span className="text-green-600">อีก {Math.abs(daysOverdue)} วัน</span>;
      }
    },
  },
];