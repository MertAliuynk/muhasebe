"use client"

import * as React from "react"
import { format } from "date-fns"
import { ClockArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

interface GoToCurrentMonthButtonProps {
  period: "daily" | "monthly"
  currentMonthStart: Date
  currentMonthEnd: Date
}

export function GoToCurrentMonthButton({
  period,
  currentMonthStart,
  currentMonthEnd,
}: GoToCurrentMonthButtonProps) {
  const handleClick = () => {
    const params = new URLSearchParams()
    params.set("period", period)
    params.set("startDate", format(currentMonthStart, "yyyy-MM-dd"))
    params.set("endDate", format(currentMonthEnd, "yyyy-MM-dd"))
    window.location.href = `?${params.toString()}`
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto gap-2"
      onClick={handleClick}
      aria-label="Bu Aya Git"
    >
      <ClockArrowUp className="h-4 w-4" />
      Bu Aya Git
    </Button>
  )
}
