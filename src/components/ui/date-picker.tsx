"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
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

  React.useLayoutEffect(() => {
    if (!date) void setDate(new Date())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
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
  )
}
