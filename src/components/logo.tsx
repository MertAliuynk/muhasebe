import React from "react"
import { Hospital } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
  textClassName?: string
  className?: string
}

export default function Logo({ textClassName, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2 font-medium", className)}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Hospital className="size-5" />
      </div>
      <p className={cn(textClassName)}>Karadeniz Ağız ve Diş Polikliniği</p>
    </div>
  )
}
