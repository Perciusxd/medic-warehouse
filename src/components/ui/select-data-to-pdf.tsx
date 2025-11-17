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
import { Separator } from "@/components/ui/separator"
import { generatePdf, Pdfcontent } from "@/components/ui/pdf_creator/new_request_pdf"
import { useAuth } from "@/components/providers";
interface SelectDataMedDialogProps {
  dataList: any[]
  onSelect: (items: any[]) => void
}
import { HospitalList } from "@/context/HospitalList"

export function SelectDataMedDialog({ dataList, onSelect }: SelectDataMedDialogProps) {
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([])
  const [selectedObjects, setSelectedObjects] = React.useState<any[]>([])
  const [selectedHospital, setSelectedHospital] = React.useState<string>('')
  const HospitalListNamesTH = HospitalList.map(h => h.nameTH)

  const handleSelect = (index: number) => {
    const obj = dataList[index]
    
    // ดึงชื่อโรงพยาบาลผู้ให้ยืม
    let hospitalName: string | null = null
    if (obj.type === "request") {
      hospitalName = obj.responseDetails?.[0]?.respondingHospitalNameTH ?? null
    } else if (obj.type === "return") {
      hospitalName = obj.item.sharingDetails?.postingHospitalNameTH ?? null
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
  console.log("dataList", dataList)
  const [docType, setDocType] = useState<string>('normalReturn');
  const handleDocTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocType(event.target.value);
  };
  return (

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {selectedObjects.length > 0
            ? `เลือกแล้ว ${selectedIndices.map(i => i + 1).join(", ")}`
            : "พิมพ์เอกสารขอยืมยา/สนับสนุน"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-fit   max-w-full  overflow-x-auto">
        <DialogHeader>
          <DialogTitle> พิมพ์เอกสารขอยืมยา/สนับสนุน</DialogTitle>
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

    <fieldset className="border rounded-md p-3">
      <legend className="text-sm font-semibold px-2">รูปแบบเอกสาร</legend>
      <div className="flex gap-6 mt-1 mb-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="documentType"
            value="normalReturn"
            checked={docType === 'normalReturn'}
            onChange={handleDocTypeChange}
          />
          <span>เอกสารขอยืม</span>
        </label>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="documentType"
            value="supportReturn"
            checked={docType === 'supportReturn'}
            onChange={handleDocTypeChange}
          />
          <span>เอกสารสนับสนุน</span>
        </label>
      </div>

      {/* <p className="mt-2 text-xs text-gray-500">
        ค่าที่เลือก: <strong>{docType}</strong>
      </p> */}
    </fieldset>

    <div>
      <h4 className="font-bold mb-2">ขอยืม (ขาดแคลน)</h4>
      {dataList
        .filter((item) => item.type === "request")
        .filter((item) => !selectedHospital || item.responseDetails?.[0]?.respondingHospitalNameTH === selectedHospital)
        .filter((item) => item.medicineRequests?.requestTerm?.returnType === docType)
        .map((item, index) => {
          const globalIndex = dataList.indexOf(item)
          return (
            <div key={item.id ?? globalIndex} className="mb-2 overflow-hidden">
              <Button
                variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                className="w-full justify-start truncate"
                onClick={() => handleSelect(globalIndex)}
              >
                {/* {item.responseDetails[0]?.offeredMedicine?.name ?? "ผิด"} จาก{" "} */}
                {item.responseDetails[0]?.offeredMedicine?.name ? item.responseDetails[0]?.offeredMedicine?.name : item.medicineRequests?.requestMedicine?.name ?? "ข้อมูลชื่อยาผิดพลาด"} จาก{" "}
                {item.responseDetails[0]?.respondingHospitalNameTH ? item.responseDetails[0]?.respondingHospitalNameTH : item.medicineRequests?.responseDetails[0].respondingHospitalNameTH ?? "ข้อมูลโรงพยาบาลผิดพลาด"} จำนวน{" "}
                {item.responseDetails[0]?.offeredMedicine?.offerAmount ? item.responseDetails[0]?.offeredMedicine?.offerAmount : item.medicineRequests?.requestMedicine?.requestAmount ?? "ข้อมูลจำนวนที่แจ้งขาดแคลนผิดพลาด"}
                {item.responseDetails[0]?.offeredMedicine?.unit ? item.responseDetails[0]?.offeredMedicine?.unit : item.medicineRequests?.requestMedicine?.unit ?? "ข้อมูลหน่วยยาผิดพลาด"}
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
      <h4 className="font-bold mt-4 mb-2">ขอยืม (แบ่งปัน)</h4>
      {dataList
        .filter((item) => item.type === "return")
        .filter((item) => !selectedHospital || item.item.sharingDetails?.postingHospitalNameTH === selectedHospital)
        .filter((item) => item.item.returnTerm.returnType === docType)
        .map((item, index) => {
          const globalIndex = dataList.indexOf(item)
          return (
            <div key={item.id ?? globalIndex} className="mb-2">
              <Button
                variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                className="w-full justify-start truncate"
                onClick={() => handleSelect(globalIndex)}
              >
                {item.item.sharingDetails?.sharingMedicine?.name ?? "ไม่มีชื่อ"} จาก{" "}
                {item.item.sharingDetails?.postingHospitalNameTH ?? "ไม่มีชื่อ"} จำนวน{" "}
                {item.item.acceptedOffer?.responseAmount ?? "ไม่มีจำนวน"}
                {item.item.sharingDetails?.sharingMedicine?.unit ?? "ไม่มีหน่วย"}
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

        <Button
          onClick={() => {
            if (selectedObjects.length === 0) {
              alert("กรุณาเลือกอย่างน้อย 1 รายการ")
              return
            }
            // สร้าง object ใหม่จาก selectedItems
            const documentData = selectedObjects.map((obj) => {

              if (obj.type === "request") {
                return {
                  SharingHospital:
                    obj.responseDetails?.[0]?.respondingHospitalNameTH ? obj.responseDetails?.[0]?.respondingHospitalNameTH : obj.medicineRequests?.responseDetails[0].respondingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
                  Medname:
                    obj.responseDetails?.[0]?.offeredMedicine?.name ? obj.responseDetails?.[0]?.offeredMedicine?.name : obj.medicineRequests?.requestMedicine?.name ?? "ไม่ทราบชื่อยา",
                  Amount:
                    obj.responseDetails?.[0]?.offeredMedicine?.offerAmount ? obj.responseDetails?.[0]?.offeredMedicine?.offerAmount : obj.medicineRequests?.requestMedicine?.requestAmount ?? "ไม่ทราบจำนวน",
                  ExpectedReturnDate
                    : obj.medicineRequests?.requestTerm.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
                  Unit:
                    obj.responseDetails?.[0]?.offeredMedicine?.unit ? obj.responseDetails?.[0]?.offeredMedicine?.unit : obj.medicineRequests?.requestMedicine?.unit ?? "ไม่ทราบรูปแบบ/หน่วย",
                  Quantity:
                    obj.responseDetails?.[0]?.offeredMedicine?.quantity ? obj.responseDetails?.[0]?.offeredMedicine?.quantity : obj.medicineRequests?.requestMedicine?.quantity ?? "ไม่ทราบขนาด",
                  Description: obj.medicineRequests.requestMedicine.description ?? "ไม่ทราบเหตุผล",
                  SupportType:
                    obj.medicineRequests.requestTerm.supportType ?? "ไม่ทราบประเภท",
                  type: "request",
                  raw: obj, // เก็บต้นฉบับไว้ด้วยถ้าต้องใช้ต่อ
                }
              } else if (obj.type === "return") {
                return {
                  SharingHospital:
                    obj.item.sharingDetails?.postingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
                  Medname:
                    obj.item.sharingDetails?.sharingMedicine?.name ?? "ไม่ทราบชื่อ",
                  Amount:
                    obj.item.acceptedOffer?.responseAmount ?? "ไม่ทราบจำนวน",
                  ExpectedReturnDate
                    : obj.item.acceptedOffer?.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
                  Unit:
                    obj.item.sharingDetails?.sharingMedicine?.unit ?? "ไม่ทราบหน่วย",
                  Quantity:
                    obj.item.sharingDetails?.sharingMedicine?.quantity ?? "ไม่ทราบขนาด",
                  Description:
                    obj.item.acceptedOffer?.description ?? "ไม่ทราบเหตุผล",
                  SupportType:
                    obj.item.returnTerm?.supportType ?? "ไม่ทราบประเภท",
                  type: "return",
                  raw: obj, // เก็บต้นฉบับไว้ด้วยถ้าต้องใช้ต่อ
                }

              }
              return null
            })
            generatePdf(documentData, userdata.user,docType);

            console.log("สร้างเอกสาร:", documentData)
            Pdfcontent({ documentData, userdata: userdata.user ,docType})
            // เอา documentData ไปใช้สร้าง PDF ต่อ

          }}
        >

          สร้างเอกสาร PDF
        </Button>

      </DialogContent>
    </Dialog>
  )
}
