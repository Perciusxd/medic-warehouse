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

interface SelectDataMedDialogProps {
  dataList: any[]
  onSelect: (item: any) => void
}

export function SelectDataMedDialog({ dataList, onSelect }: SelectDataMedDialogProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [selectedObject, setSelectedObject] = React.useState<any>(null)
    console.log("dataList:", dataList)
  const handleSelect = (index: number) => {
    const obj = dataList[index]
    setSelectedIndex(index)
    setSelectedObject(obj)
    onSelect(obj) // 🔹 ส่งค่าออกไปยัง page
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {selectedObject ? selectedObject.name : "เลือกข้อมูลยา"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เลือกข้อมูลยา</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-60 w-full rounded-md border p-2">
          {dataList.map((item, index) => (
            <div key={item.id ?? index}>
              <Button
                variant={selectedIndex === index ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleSelect(index)}
              >
                <span className="mr-2 text-muted-foreground">
                  {index + 1}.
                </span>
                {item.sharingDetails.sharingMedicine.name ?? "ไม่มีชื่อ"} จากโรงพยาบาล {/* ปรับตามโครงสร้างข้อมูลจริง  เพิ่มการเช็ค ส่ง รวมมา แล้วเชค type เพื่อปรับให้ดึงชื่อโรงพยาบาลให้ที่ยืมถูก fomat คิอ ชื่อยา โรงพยาบาล จำนวน  วันที่แจ้ง   */}
              </Button>
              <Separator className="my-1" />
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
