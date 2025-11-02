"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/providers"
import { HospitalList } from "@/context/HospitalList"
import dynamic from 'next/dynamic'
import { toast } from "sonner"

const ReturnPdfMultiPreview = dynamic(() => import('@/components/ui/pdf_creator/return_pdf_multi'), { ssr: false })

interface SelectReturnDataDialogProps {
  dataList: any[]
  onSelect?: (items: any[]) => void
}

export function SelectReturnDataDialog({ dataList, onSelect }: SelectReturnDataDialogProps) {
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([])
  const [selectedObjects, setSelectedObjects] = React.useState<any[]>([])
  const [selectedHospital, setSelectedHospital] = React.useState<string>('')
  const HospitalListNamesTH = HospitalList.map(h => h.nameTH)
  const { user } = useAuth()
  const pdfRef = useRef<any>(null)

  const handleSelect = (index: number) => {
    const obj = dataList[index]

    // Get hospital name based on type
    let hospitalName: string | null = null
    if (obj.type === "request") {
      hospitalName = obj.responseDetails?.[0]?.respondingHospitalNameTH ?? null
    } else if (obj.type === "return") {
      hospitalName = obj.item?.sharingDetails?.postingHospitalNameTH ?? null
    }

    if (selectedIndices.includes(index)) {
      // Remove
      const newIndices = selectedIndices.filter(i => i !== index)
      const newObjects = selectedObjects.filter((_, i) => selectedIndices[i] !== index)

      setSelectedIndices(newIndices)
      setSelectedObjects(newObjects)

      // Reset hospital filter if nothing selected
      if (newObjects.length === 0) {
        setSelectedHospital('')
      }

      onSelect?.(newObjects)
    } else {
      // Add
      const newIndices = [...selectedIndices, index]
      const newObjects = [...selectedObjects, obj]
      setSelectedIndices(newIndices)
      setSelectedObjects(newObjects)

      // Set hospital filter to first selected item's hospital
      if (!selectedHospital && hospitalName) {
        setSelectedHospital(hospitalName)
      }

      onSelect?.(newObjects)
    }
  }

  // Prepare data for PDF generation
  const prepareReturnListForPdf = () => {
    const returnList: any[] = []
    
    selectedObjects.forEach(obj => {
      if (obj.type === "request") {
        // For request type, get return medicine data from responseDetails
        obj.responseDetails?.forEach((detail: any) => {
          if (detail.status === "returned" && detail.returnMedicine) {
            const returnMeds = Array.isArray(detail.returnMedicine) 
              ? detail.returnMedicine 
              : [detail.returnMedicine]
            
            returnMeds.forEach((rm: any) => {
              const nested = rm.returnMedicine ?? rm
              returnList.push(nested)
            })
          }
        })
      } else if (obj.type === "return") {
        // For return type (sharing), get return medicine data
        const returnMeds = obj.item?.returnMedicine
        if (returnMeds) {
          const list = Array.isArray(returnMeds) ? returnMeds : [returnMeds]
          list.forEach((rm: any) => {
            const nested = rm.returnMedicine ?? rm
            returnList.push(nested)
          })
        }
      }
    })
    
    return returnList
  }

  // Get representative data for PDF (use first selected item)
  const getRepresentativeData = () => {
    if (selectedObjects.length === 0) return null
    
    const firstObj = selectedObjects[0]
    
    if (firstObj.type === "request") {
      return {
        ...firstObj.medicineRequests,
        offeredMedicine: firstObj.responseDetails?.[0]?.offeredMedicine,
        respondingHospitalNameTH: firstObj.responseDetails?.[0]?.respondingHospitalNameTH,
        responseDetails: firstObj.responseDetails,
      }
    } else if (firstObj.type === "return") {
      return {
        ...firstObj.item,
        offeredMedicine: firstObj.item?.sharingDetails?.sharingMedicine,
        respondingHospitalNameTH: firstObj.item?.sharingDetails?.postingHospitalNameTH,
      }
    }
    
    return null
  }

  const handleGeneratePdf = () => {
    if (selectedObjects.length === 0) {
      toast.error("กรุณาเลือกอย่างน้อย 1 รายการ")
      return
    }

    if (pdfRef.current?.savePdf) {
      pdfRef.current.savePdf()
      toast.success("กำลังสร้างเอกสาร PDF")
    } else {
      toast.error("ไม่สามารถสร้างเอกสารได้")
    }
  }

  const representativeData = getRepresentativeData()
  const returnList = prepareReturnListForPdf()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          พิมพ์เอกสารส่งคืนยา
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-fit max-w-full overflow-x-auto">
        <DialogHeader>
          <DialogTitle>พิมพ์เอกสารส่งคืนยา</DialogTitle>
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
              <h4 className="font-bold mb-2">ขอยืม (ขาดแคลน) - รายการที่คืนแล้ว</h4>
              {dataList
                .filter((item) => item.type === "request")
                .filter((item) => !selectedHospital || item.responseDetails?.[0]?.respondingHospitalNameTH === selectedHospital)
                .filter((item) => {
                  // Only show items with returned status
                  return item.responseDetails?.some((detail: any) => detail.status === "returned")
                })
                .map((item, index) => {
                  const globalIndex = dataList.indexOf(item)
                  const returnedDetail = item.responseDetails?.find((d: any) => d.status === "returned")
                  return (
                    <div key={item.id ?? globalIndex} className="mb-2 overflow-hidden">
                      <Button
                        variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                        className="w-full justify-start truncate"
                        onClick={() => handleSelect(globalIndex)}
                      >
                        {returnedDetail?.offeredMedicine?.name ?? "ไม่ระบุ"} จาก{" "}
                        {returnedDetail?.respondingHospitalNameTH ?? "ไม่ระบุ"} จำนวน{" "}
                        {returnedDetail?.offeredMedicine?.offerAmount ?? "ไม่ระบุ"}{" "}
                        {returnedDetail?.offeredMedicine?.unit ?? ""}
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
              <h4 className="font-bold mt-4 mb-2">ขอยืม (แบ่งปัน) - รายการที่คืนแล้ว</h4>
              {dataList
                .filter((item) => item.type === "return")
                .filter((item) => !selectedHospital || item.item?.sharingDetails?.postingHospitalNameTH === selectedHospital)
                .filter((item) => item.item?.status === "returned")
                .map((item, index) => {
                  const globalIndex = dataList.indexOf(item)
                  return (
                    <div key={item.id ?? globalIndex} className="mb-2">
                      <Button
                        variant={selectedIndices.includes(globalIndex) ? "default" : "ghost"}
                        className="w-full justify-start truncate"
                        onClick={() => handleSelect(globalIndex)}
                      >
                        {item.item?.sharingDetails?.sharingMedicine?.name ?? "ไม่มีชื่อ"} จาก{" "}
                        {item.item?.sharingDetails?.postingHospitalNameTH ?? "ไม่มีชื่อ"} จำนวน{" "}
                        {item.item?.acceptedOffer?.responseAmount ?? "ไม่มีจำนวน"}{" "}
                        {item.item?.sharingDetails?.sharingMedicine?.unit ?? ""}
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
          onClick={handleGeneratePdf}
          disabled={selectedObjects.length === 0}
        >
          สร้างเอกสาร PDF
        </Button>

        {/* Hidden PDF Preview for generation */}
        {representativeData && returnList.length > 0 && (
          <div style={{ display: 'none' }}>
            <ReturnPdfMultiPreview
              ref={pdfRef}
              data={representativeData}
              returnList={returnList}
              userData={user ?? {}}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

