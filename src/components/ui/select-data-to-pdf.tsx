"use client"

import * as React from "react"
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

export function SelectDataMedDialog({ dataList, onSelect }: SelectDataMedDialogProps) {
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([])
  const [selectedObjects, setSelectedObjects] = React.useState<any[]>([])
  const [selectedHospital, setSelectedHospital] = React.useState<string | null>(null)

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
      const newObjects = selectedObjects.filter(o => o !== obj)
      setSelectedIndices(newIndices)
      setSelectedObjects(newObjects)

      // ถ้าไม่มีอะไรถูกเลือกแล้ว → reset hospital filter
      if (newObjects.length === 0) {
        setSelectedHospital(null)
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {selectedObjects.length > 0
            ? `เลือกแล้ว ${selectedIndices.map(i => i + 1).join(", ")}`
            : "พิมพ์เอกสารขอยืมยา/สนับสนุน"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle> พิมพ์เอกสารขอยืมยา/สนับสนุน</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-60 w-full rounded-md border p-2">
          <h4 className="font-bold mb-2">ขอยืม (ขาดแคลน)</h4>
          {dataList
            .filter((item) => item.type === "request")
            .filter((item) => {
              if (!selectedHospital) return true // ยังไม่เลือก → แสดงทั้งหมด
              return item.responseDetails?.[0]?.respondingHospitalNameTH === selectedHospital
            })
            .map((item, index) => {
              const globalIndex = dataList.indexOf(item)
              // console.log("item", item, globalIndex)
              //console.log("responseDetails?.offeredMedicine?.name", item)
              return (
                <div key={item.id ?? globalIndex}>
                  <Button
                    variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleSelect(globalIndex)}
                  >
                    {item.responseDetails[0]?.offeredMedicine?.name ?? "ผิด"} จาก {item.responseDetails[0].respondingHospitalNameTH} จำนวน {item.responseDetails[0]?.offeredMedicine?.offerAmount ?? "ผิด"}{item.responseDetails[0]?.offeredMedicine?.unit ?? "ผิด"}

                    {selectedIndices.includes(globalIndex) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (ลำดับ {selectedIndices.indexOf(globalIndex) + 1})
                      </span>
                    )}
                  </Button>
                  <Separator className="my-1" />
                </div>
              )
            })}

          <h4 className="font-bold mt-4 mb-2">ขอยืม (แบ่งปัน)</h4>
          {dataList
            .filter((item) => item.type === "return")
            .filter((item) => {
              if (!selectedHospital) return true
              return item.item.sharingDetails?.postingHospitalNameTH === selectedHospital
            })
            .map((item, index) => {
              const globalIndex = dataList.indexOf(item)
              // console.log("item sh", item, globalIndex)
              return (
                <div key={item.id ?? globalIndex}>
                  <Button
                    variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleSelect(globalIndex)}
                  >
                    {item.item.sharingDetails?.sharingMedicine?.name ?? "ไม่มีชื่อ"} จาก {item.item.sharingDetails?.postingHospitalNameTH ?? "ไม่มีชื่อ"} จำนวน {item.item.acceptedOffer?.responseAmount ?? "ไม่มีจำนวน"}{item.item.sharingDetails?.sharingMedicine?.unit ?? "ไม่มีหน่วย"}

                    {selectedIndices.includes(globalIndex) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (ลำดับ {selectedIndices.indexOf(globalIndex) + 1})
                      </span>
                    )}
                  </Button>
                  <Separator className="my-1" />
                </div>
              )
            })}
        </ScrollArea>
        <Button
          onClick={() => {
            // สร้าง object ใหม่จาก selectedItems
            const documentData = selectedObjects.map((obj) => {

              if (obj.type === "request") {
                return {
                  SharingHospital:
                    obj.responseDetails?.[0]?.respondingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
                  Medname:
                    obj.responseDetails?.[0]?.offeredMedicine?.name ?? "ไม่ทราบชื่อยา",
                  Amount:
                    obj.responseDetails?.[0]?.offeredMedicine?.offerAmount ?? "ไม่ทราบจำนวน",
                  ExpectedReturnDate
                    : obj.medicineRequests?.requestTerm.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
                  Unit:
                    obj.responseDetails?.[0]?.offeredMedicine?.unit ?? "ไม่ทราบรูปแบบ/หน่วย",
                  Quantity:
                    obj.responseDetails?.[0]?.offeredMedicine?.quantity ?? "ไม่ทราบขนาด",
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
            generatePdf(documentData, userdata.user);

            console.log("สร้างเอกสาร:", documentData)
            Pdfcontent({ documentData, userdata: userdata.user })
            // เอา documentData ไปใช้สร้าง PDF ต่อ

          }}
        >

          สร้างเอกสาร PDF
        </Button>
      </DialogContent>
    </Dialog>
  )
}
