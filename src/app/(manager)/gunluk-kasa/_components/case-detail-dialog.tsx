"use client"

import React from "react"
import { CircleDollarSign } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
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

interface KasaDetayProps {
  kasaVerileri: {
    dundenDevir: number
    nakit: number
    havaleEft: number
    krediKarti: number
  }
}

export function CaseDetailDialog({ kasaVerileri }: KasaDetayProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CircleDollarSign className="h-4 w-4" />
          Kasa Detayı
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Günlük Kasa Detayları</DialogTitle>
          <DialogDescription>
            Günlük kasa akışı için detaylı bilgiler
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-[1fr_auto] gap-3 justify-between mt-4">
          <p className="text-muted-foreground font-medium">
            Dünden Devirolan Kasa:
          </p>
          <Badge variant="outline">
            {formatCurrency(kasaVerileri.dundenDevir)}
          </Badge>

          <p className="text-muted-foreground font-medium">Nakit:</p>
          <Badge variant="outline">{formatCurrency(kasaVerileri.nakit)}</Badge>

          <p className="text-muted-foreground font-medium">Havale/EFT:</p>
          <Badge variant="outline">
            {formatCurrency(kasaVerileri.havaleEft)}
          </Badge>

          <p className="text-muted-foreground font-medium">Kredi Kartı:</p>
          <Badge variant="outline">
            {formatCurrency(kasaVerileri.krediKarti)}
          </Badge>

          <p className="text-muted-foreground font-medium mt-2">Toplam:</p>
          <Badge variant="default" className="mt-2">
            {formatCurrency(
              kasaVerileri.dundenDevir +
                kasaVerileri.nakit +
                kasaVerileri.havaleEft +
                kasaVerileri.krediKarti
            )}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}
