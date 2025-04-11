"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { format } from "date-fns"
import { CircleDollarSign } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CaseDetailDialog() {
  const searchParams = useSearchParams()
  const date = searchParams.get("date")

  const { data: cashReport, isFetching } =
    api.cashReport.getTodayCashReport.useQuery({
      endDate: date ?? "",
    })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs sm:text-sm"
          disabled={isFetching}
        >
          <CircleDollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
          Kasa Detayı
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Kasa Detayı</DialogTitle>
          <DialogDescription>
            {format(new Date(date ?? ""), "PPP EEEE")}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-[1fr_auto] gap-2 sm:gap-3 justify-between mt-4">
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Nakit:
          </p>
          <Badge variant="outline" className="text-xs sm:text-sm">
            {formatCurrencyWithSymbol(cashReport?.cash ?? 0)}
          </Badge>

          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Havale/EFT:
          </p>
          <Badge variant="outline" className="text-xs sm:text-sm">
            {formatCurrencyWithSymbol(cashReport?.transfer ?? 0)}
          </Badge>

          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Kredi Kartı:
          </p>
          <Badge variant="outline" className="text-xs sm:text-sm">
            {formatCurrencyWithSymbol(cashReport?.card ?? 0)}
          </Badge>

          <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
            Toplam:
          </p>
          <Badge variant="default" className="mt-2 text-xs sm:text-sm">
            {formatCurrencyWithSymbol(cashReport?.total ?? 0)}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}
