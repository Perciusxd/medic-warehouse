"use client"

import * as React from "react"

export const RequiredMark: React.FC = () => (
  <span className="text-red-500 text-xs" aria-label="จำเป็น">*</span>
)

export const OptionalMark: React.FC = () => (
  <span className="text-muted-foreground text-xs" aria-label="ไม่บังคับ">◦</span>
)


