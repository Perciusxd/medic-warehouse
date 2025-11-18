"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateDeliveryPdf } from "@/components/ui/pdf_creator/delivery_pdf"
import { useAuth } from "@/components/providers";
import { Printer } from "lucide-react";

interface SelectDeliveryDataDialogProps {
  dataList: any[]
  onSelect: (items: any[]) => void
}

import { HospitalList } from "@/context/HospitalList"

export function SelectDeliveryDataDialog({ dataList, onSelect }: SelectDeliveryDataDialogProps) {
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([])
  const [selectedObjects, setSelectedObjects] = React.useState<any[]>([])
  const [selectedHospital, setSelectedHospital] = React.useState<string>('')
  const [isOpen, setIsOpen] = React.useState(false)
  const HospitalListNamesTH = HospitalList.map(h => h.nameTH)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // เคลียร์ค่าเมื่อปิด dialog
      setSelectedIndices([])
      setSelectedObjects([])
      setSelectedHospital('')
      onSelect([])
    }
  }

  const handleSelect = (index: number) => {
    const obj = dataList[index]

    // ดึงชื่อโรงพยาบาลผู้รับ
    let hospitalName: string | null = null
    if (obj.ticketType === "request") {
      // สำหรับ request ticket ดูจาก postingHospitalNameTH
      hospitalName = obj.requestDetails?.postingHospitalNameTH ?? null
    } else if (obj.ticketType === "sharing") {
      // สำหรับ sharing ticket ดูจาก acceptedOffer
      hospitalName = obj.responseDetails?.[0]?.respondingHospitalNameTH ?? null
    }

    if (selectedIndices.includes(index)) {
      // เอาออก
      const newIndices = selectedIndices.filter(i => i !== index)
      const newObjects = selectedObjects.filter(o => o.id !== obj.id);

      setSelectedIndices(newIndices)
      setSelectedObjects(newObjects)

      // ถ้าไม่มีอะไรถูกเลือกแล้ว → reset hospital filter
      if (newObjects.length === 0) {
        setSelectedHospital('')
      }

      onSelect(newObjects)
    } else {
      // เพิ่มเข้าไป
      const newIndices = [...selectedIndices, index]
      const newObjects = [...selectedObjects, obj]
      setSelectedIndices(newIndices)
      setSelectedObjects(newObjects)

      // ถ้ายังไม่มี hospital filter → ตั้งค่าเป็นของอันแรก
      if (!selectedHospital && hospitalName) {
        setSelectedHospital(hospitalName)
      }

      onSelect(newObjects)
    }
  }

  const userdata = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          พิมพ์เอกสารส่งมอบยา
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-fit max-w-full overflow-x-auto">
        <DialogHeader>
          <DialogTitle>พิมพ์เอกสารส่งมอบยา</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4 space-y-4">
          <div className="space-y-4">
            <select
              className="border p-2 w-full rounded text-sm"
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              <option value="">-- รายการทั้งหมด --</option>
              {HospitalListNamesTH.map((hospital, idx) => (
                <option key={idx} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>

            <div>
              <h4 className="font-bold mb-2">ให้ยืมยา (ขาดแคลน)</h4>
              {dataList
                .filter((item) => item.ticketType === "request")
                .filter((item) => !selectedHospital || item.requestDetails?.postingHospitalNameTH === selectedHospital)
                .map((item, index) => {
                  const globalIndex = dataList.indexOf(item)
                  return (
                    <div key={`request-${globalIndex}`} className="mb-2 overflow-hidden">
                      <Button
                        variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                        className="w-full justify-start truncate"
                        onClick={() => handleSelect(globalIndex)}
                      >
                        {item.offeredMedicine?.name ?? "ไม่มีชื่อ"} ไปยัง{" "}
                        {item.requestDetails?.postingHospitalNameTH ?? "ไม่มีชื่อ"} จำนวน{" "}
                        {item.offeredMedicine?.offerAmount ?? "ไม่มีจำนวน"}
                        {item.offeredMedicine?.unit ?? "ไม่มีหน่วย"}
                        {selectedIndices.includes(globalIndex) && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (ลำดับ {selectedIndices.indexOf(globalIndex) + 1})
                          </span>
                        )}
                      </Button>
                    </div>
                  )
                })}
            </div>

            <div>
              <h4 className="font-bold mt-4 mb-2">ให้ยืม (แบ่งปัน)</h4>
              {dataList
                .filter((item) => item.ticketType === "sharing")
                .filter((item) => !selectedHospital || item.responseDetails?.[0]?.respondingHospitalNameTH === selectedHospital)
                .map((item, index) => {
                  const globalIndex = dataList.indexOf(item)
                  // ใช้ globalIndex เป็น key เพื่อป้องกัน duplicate keys
                  // เพราะ sharing ticket ที่ถูก expand อาจมี id เดียวกัน
                  return (
                    <div key={`sharing-${globalIndex}`} className="mb-2">
                      <Button
                        variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                        className="w-full justify-start truncate"
                        onClick={() => handleSelect(globalIndex)}
                      >
                        {item.sharingMedicine?.name ?? "ไม่มีชื่อ"} ไปยัง{" "}
                        {item.responseDetails?.[0]?.respondingHospitalNameTH ?? "ไม่มีชื่อ"} จำนวน{" "}
                        {item.responseDetails?.[0]?.acceptedOffer?.responseAmount ?? "ไม่มีจำนวน"}
                        {item.sharingMedicine?.unit ?? "ไม่มีหน่วย"}
                        {selectedIndices.includes(globalIndex) && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (ลำดับ {selectedIndices.indexOf(globalIndex) + 1})
                          </span>
                        )}
                      </Button>
                    </div>
                  )
                })}
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => {
              if (selectedObjects.length === 0) {
                alert("กรุณาเลือกอย่างน้อย 1 รายการ")
                return
              }
              // สร้าง object ใหม่จาก selectedItems
              const documentData = selectedObjects.map((obj) => {
                if (obj.ticketType === "request") {
                  return {
                    SharingHospital: obj.requestDetails?.postingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
                    Medname: obj.offeredMedicine?.name ?? "ไม่ทราบชื่อยา",
                    Amount: obj.offeredMedicine?.offerAmount ?? 0,
                    ExpectedReturnDate: obj.requestDetails?.requestTerm?.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
                    Unit: obj.offeredMedicine?.unit ?? "ไม่ทราบรูปแบบ/หน่วย",
                    Quantity: obj.requestDetails.requestMedicine?.quantity ?? "ไม่ทราบขนาด",
                    Description: obj.requestMedicine?.description ?? "ไม่ทราบเหตุผล",
                    SupportType: obj.requestTerm?.supportType ?? "ไม่ทราบประเภท",
                    PricePerUnit: obj.offeredMedicine?.pricePerUnit ?? 0,
                    type: "request",
                    raw: obj,
                  }
                } else if (obj.ticketType === "sharing") {
                  return {
                    SharingHospital: obj.responseDetails?.[0]?.respondingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
                    Medname: obj.sharingMedicine?.name ?? "ไม่ทราบชื่อ",
                    Amount: obj.responseDetails?.[0]?.acceptedOffer?.responseAmount ?? 0,
                    ExpectedReturnDate: obj.responseDetails?.[0]?.acceptedOffer?.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
                    Unit: obj.sharingMedicine?.unit ?? "ไม่ทราบหน่วย",
                    Quantity: obj.sharingMedicine?.quantity ?? "ไม่ทราบขนาด",
                    Description: obj.responseDetails?.[0]?.acceptedOffer?.description ?? "ไม่ทราบเหตุผล",
                    SupportType: obj.returnTerm?.supportType ?? "ไม่ทราบประเภท",
                    PricePerUnit: obj.sharingMedicine?.pricePerUnit ?? 0,
                    type: "sharing",
                    raw: obj,
                  }
                }
                return null
              }).filter(item => item !== null)

              generateDeliveryPdf(documentData, userdata.user, selectedHospital);
              console.log("สร้างเอกสาร:", documentData)
              
              // เคลียร์ค่าและปิด dialog
              setSelectedIndices([])
              setSelectedObjects([])
              setSelectedHospital('')
              onSelect([])
              setIsOpen(false)
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            สร้างเอกสาร PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
