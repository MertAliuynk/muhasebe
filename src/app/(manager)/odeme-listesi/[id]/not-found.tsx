import React from "react"
import { Activity } from "lucide-react"

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Activity strokeWidth={0.4} size={150} />
      <h1 className="text-4xl font-bold">Hasta bulunamadı</h1>
      <p className="text-muted-foreground">
        Lütfen tekrar deneyiniz veya yöneticinize başvurunuz.
      </p>
    </div>
  )
}
