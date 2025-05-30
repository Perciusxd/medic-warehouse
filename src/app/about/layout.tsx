import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Medic Warehouse",
  description: "Learn more about our healthcare services and facilities",
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 