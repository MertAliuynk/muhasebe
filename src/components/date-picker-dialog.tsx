"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button"

export default function DatePickerDialog() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon size={16} className="mr-2" />
          {date ? format(date, "PPP EEEE") : <span>Pick a date</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader className="sr-only">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day: Date | undefined) => setDate(day)}
          className="rounded-md border"
        />
      </DialogContent>
    </Dialog>
  )
}
