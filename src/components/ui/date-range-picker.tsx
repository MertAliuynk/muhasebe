"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  startDate: Date
  endDate: Date
}

export function DateRangePicker({
  className,
  startDate,
  endDate,
}: DateRangePickerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  })

  // URL parametreleri değiştiğinde date state'ini güncelle
  React.useEffect(() => {
    const currentStartDate = format(date?.from ?? startDate, "yyyy-MM-dd")
    const currentEndDate = format(date?.to ?? endDate, "yyyy-MM-dd")
    const newStartDate = format(startDate, "yyyy-MM-dd")
    const newEndDate = format(endDate, "yyyy-MM-dd")

    // Sadece tarihler değiştiyse state'i güncelle
    if (currentStartDate !== newStartDate || currentEndDate !== newEndDate) {
      setDate({
        from: startDate,
        to: endDate,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  // Date state'i değiştiğinde URL'i güncelle
  React.useEffect(() => {
    if (date?.from && date?.to) {
      const params = new URLSearchParams(searchParams.toString())
      const newStartDate = format(date.from, "yyyy-MM-dd")
      const newEndDate = format(date.to, "yyyy-MM-dd")
      const currentStartDate = searchParams.get("startDate")
      const currentEndDate = searchParams.get("endDate")

      // Sadece URL parametreleri farklıysa güncelle
      if (currentStartDate !== newStartDate || currentEndDate !== newEndDate) {
        params.set("startDate", newStartDate)
        params.set("endDate", newEndDate)
        router.push(`?${params.toString()}`)
      }
    }
  }, [date, router, searchParams])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PPP", { locale: tr })} -{" "}
                  {format(date.to, "PPP", { locale: tr })}
                </>
              ) : (
                format(date.from, "PPP", { locale: tr })
              )
            ) : (
              <span>Tarih Aralığı Seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={tr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
