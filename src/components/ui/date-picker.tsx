"use client"

import * as React from "react"
import { format, isSameDay, parseISO } from "date-fns"
import { CalendarIcon, ClockArrowUp } from "lucide-react"
import { useQueryState } from "nuqs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker() {
  const [date, setDate] = useQueryState("date", {
    parse: (value) => (value ? parseISO(value) : new Date()),
    serialize: (date) => format(date, "yyyy-MM-dd"),
  })
  const isToday = date ? isSameDay(date, new Date()) : false
  return (
    <div className="flex items-center gap-2">
      {!isToday && (
        <Button variant={"outline"} onClick={() => void setDate(new Date())}>
          Bugün&apos;e Git <ClockArrowUp size={16} className="ml-2" />
        </Button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon size={16} className="mr-2" />
            {date ? format(date, "PPP EEEE") : <span>Tarih seçiniz</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(day: Date | undefined) => {
              if (day) {
                void setDate(day)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
