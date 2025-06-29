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
      const date = new Date(row.original.borrowedDate);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "hospital",
    size : 100,
    header: "ร.พ. ให้ยืม",
  },
  {
    accessorKey: "item",
    size : 100,
    header: "รายการ",
  },
  {
    accessorKey: "size",
    size : 50,
    header: "ขนาด",
  },
  {
    accessorKey: "unit",
    size : 50,
    header: "หน่วย",
  },
  {
    accessorKey: "trademark",
    size : 100,
    header: "ชื่อการค้า",
  },
  {
    accessorKey: "manufacturer",
    size : 100,
    header: "ผู้ผลิต",
  },
  {
    accessorKey: "amount",
    size : 50,
    header: "จำนวน",
  },
  {
    accessorKey: "price",
    size : 50,
    header: "ราคา",
  },
  {
    accessorKey: "totalValue",
    size : 80,
    header: "มูลค่า",
  },
  {
    accessorKey: "expectedReturnDate",
    size : 100,
    header: "วันที่คาดว่าจะได้รับคืน",
    cell: ({ row }) => {
      const date = new Date(row.original.expectedReturnDate);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "deliveryDate",
    size : 100,
    header: "วันที่ส่งมอบยา",
    cell: ({ row }) => {
      const date = new Date(row.original.deliveryDate);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "actualReturnDate",
    size : 100,
    header: "วันที่ได้รับคืน",
    cell: ({ row }) => {
      const date = new Date(row.original.actualReturnDate);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "daysBorrowed",
    size : 100,
    header: "จำนวนวันที่ยืม",
  },
];