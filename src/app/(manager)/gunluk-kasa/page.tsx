import React from "react"

import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"

import Expenses from "./_components/expenses"
import Revenues from "./_components/revenues"

export default function Page() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Günlük Kasa Akış</h1>
        <DatePicker />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Revenues />
        <Expenses />
      </div>
      <div className=" text-sm flex justify-end">
        <div className="w-[270px] grid grid-cols-[1fr_auto] gap-2 justify-between">
          <p className="text-muted-foreground font-medium">
            Dünden Devirolan Kasa:
          </p>
          <Badge variant="outline">{formatCurrency(10000)}</Badge>
          <p className="text-muted-foreground font-medium">Nakit:</p>
          <Badge variant="outline">{formatCurrency(1000)}</Badge>
          <p className="text-muted-foreground font-medium">Havale/EFT:</p>
          <Badge variant="outline">{formatCurrency(1000)}</Badge>
          <p className="text-muted-foreground font-medium">Kredi Kartı:</p>
          <Badge variant="outline">{formatCurrency(1000)}</Badge>
        </div>
      </div>
    </div>
  )
}
