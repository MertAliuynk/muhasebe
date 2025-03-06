"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PeriodSelectProps {
  defaultValue?: "daily" | "monthly"
}

export function PeriodSelect({ defaultValue = "daily" }: PeriodSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Periyot seçin" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Günlük</SelectItem>
        <SelectItem value="monthly">Aylık</SelectItem>
      </SelectContent>
    </Select>
  )
}
