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
import { Printer } from "lucide-react"

interface SelectHospitalDialogProps {
  data: any[]
  onConfirm: (selectedHospital: string, selectedItems: any[]) => void
  disabled?: boolean
}

export function SelectHospitalDialog({ data, onConfirm, disabled }: SelectHospitalDialogProps) {
  const [selectedHospital, setSelectedHospital] = React.useState<string>('')
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([])
  const [isOpen, setIsOpen] = React.useState(false)

  // จัดกลุ่มข้อมูลตามโรงพยาบาล
  const groupedByHospital = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {}
    
    data.forEach((item, index) => {
      const hospitalName = item.hospitalName || 'ไม่ระบุโรงพยาบาล'
      if (!groups[hospitalName]) {
        groups[hospitalName] = []
      }
      groups[hospitalName].push({ ...item, originalIndex: index })
    })
    
    return groups
  }, [data])

  const hospitalNames = Object.keys(groupedByHospital)

  // กรองรายการตามโรงพยาบาลที่เลือก
  const filteredItems = React.useMemo(() => {
    
    if (!selectedHospital) return []
    return groupedByHospital[selectedHospital] || []
  }, [selectedHospital, groupedByHospital])

  const handleSelectItem = (originalIndex: number) => {
    if (selectedIndices.includes(originalIndex)) {
      setSelectedIndices(selectedIndices.filter(i => i !== originalIndex))
    } else {
      setSelectedIndices([...selectedIndices, originalIndex])
    }
  }

  const handleConfirm = () => {
    if (!selectedHospital) {
      alert('กรุณาเลือกโรงพยาบาล')
      return
    }
    
    if (selectedIndices.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 รายการ')
      return
    }

    const selectedItems = selectedIndices.map(index => data[index])
    onConfirm(selectedHospital, selectedItems)
    setIsOpen(false)
    
    // Reset selection
    setSelectedHospital('')
    setSelectedIndices([])
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset เมื่อปิด dialog
      setSelectedHospital('')
      setSelectedIndices([])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className={`transition-opacity ${disabled ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        >
          <Printer className="mr-2 h-4 w-4" />
          พิมพ์เอกสารแจ้งเตือนการส่งคืนยา
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>เลือกโรงพยาบาลและรายการที่ต้องการออกเอกสาร</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropdown เลือกโรงพยาบาล */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              โรงพยาบาล
            </label>
            <select
              className="border p-2 w-full rounded-md"
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value)
                setSelectedIndices([]) // Reset selection เมื่อเปลี่ยนโรงพยาบาล
              }}
            >
              <option value="">-- เลือกโรงพยาบาล --</option>
              {hospitalNames.map((hospital, idx) => (
                <option key={idx} value={hospital}>
                  {hospital} ({groupedByHospital[hospital].length} รายการ)
                </option>
              ))}
            </select>
          </div>

          {/* รายการยาตามโรงพยาบาลที่เลือก */}
          {selectedHospital && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium mb-2 block">
                  รายการที่ต้องการออกเอกสาร
                  {selectedIndices.length > 0 && (
                    <span className="ml-2 text-blue-600">
                      (เลือกแล้ว {selectedIndices.length} รายการ)
                    </span>
                  )}
                </label>
                <ScrollArea className="h-60 w-full rounded-md border p-2">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIndices.includes(item.originalIndex)
                    const medicineName = item.sharingMedicine?.name || 'ไม่ระบุชื่อยา'
                    const status = item.responseDetails?.[0]?.status || 'unknown'
                    const statusText = 
                      status === 'to-transfer' ? 'รอส่งมอบ' :
                      status === 'to-confirm' ? 'รอยืนยันการส่งคืน' :
                      status === 'in-return' ? 'ต้องส่งคืน' : status

                    return (
                      <div key={item.originalIndex}>
                        <Button
                          variant={isSelected ? "default" : "ghost"}
                          className="w-full justify-start text-left"
                          onClick={() => handleSelectItem(item.originalIndex)}
                        >
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium">{medicineName}</span>
                            <span className="text-xs text-muted-foreground">
                              สถานะ: {statusText} | 
                              {item.dayAmount !== undefined && 
                                ` ${item.dayAmount > 0 ? `เกินกำหนด ${item.dayAmount} วัน` : 'ครบกำหนดวันนี้'}`
                              }
                            </span>
                          </div>
                          {isSelected && (
                            <span className="ml-auto text-xs">
                              ✓
                            </span>
                          )}
                        </Button>
                        <Separator className="my-1" />
                      </div>
                    )
                  })}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ไม่มีรายการ
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedHospital || selectedIndices.length === 0}
          >
            ยืนยันและแสดงเอกสาร
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
