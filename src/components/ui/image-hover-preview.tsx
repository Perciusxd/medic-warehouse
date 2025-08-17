"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ImageHoverPreviewProps {
  previewUrl: string | null | undefined
  buttonText?: string
  disabled?: boolean
}

export function ImageHoverPreview({
  previewUrl,
  buttonText = "ดูภาพตัวอย่าง",
  disabled = false,
}: ImageHoverPreviewProps) {
  const [open, setOpen] = useState(false)

  const isDisabled = disabled || !previewUrl

  return (
    <div
      className="w-fit"
      onMouseEnter={() => {
        if (!isDisabled) setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <Popover open={open}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label={buttonText} disabled={isDisabled}>
            <Eye className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        {!isDisabled && (
          <PopoverContent className="w-auto p-2">
            <img src={previewUrl ?? ""} alt="preview" className="max-h-64 max-w-64 object-contain" />
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}

export default ImageHoverPreview

