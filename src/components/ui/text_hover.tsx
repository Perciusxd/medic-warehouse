"use client"

import { useState } from "react"
import {  SquareCheck } from "lucide-react"

interface textHover {
  previewUrl: string 
}

export function ImageHoverPreview({
  previewUrl,
}: textHover) {
  const [open, setOpen] = useState(false)


  // ถ้ามีข้อมูล ให้แสดงเป็น span ที่มีไอคอน Eye และ Popover
  return (
    <div
      className="relative w-fit inline-flex items-center gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="cursor-pointer inline-flex items-center gap-1" aria-label="ดูรายละเอียด">
        <SquareCheck className="h-4 w-4" />
      </span>
      {open && (
        <div className="absolute bottom-6 right-0.5  z-10 p-2 text-xs text-white bg-gray-500 rounded-full">
          {previewUrl}
        </div>
      )}
    </div>
  )
}

export default ImageHoverPreview