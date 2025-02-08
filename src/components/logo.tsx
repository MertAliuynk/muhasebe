import React from "react"
import { Hospital } from "lucide-react"

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-medium">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Hospital className="size-5" />
      </div>
      Karadeniz Ağız ve Diş Polikliniği
    </div>
  )
}
