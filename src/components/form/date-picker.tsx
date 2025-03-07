import * as React from "react"
import { format, getDaysInMonth, setDate, setMonth, setYear } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"

interface Props {
  name: string
  label?: string | React.ReactNode
}

export function DatePicker({ name, label }: Props) {
  const form = useFormContext()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [isOpen, setIsOpen] = React.useState(false)

  const years = React.useMemo(
    () =>
      Array.from(
        { length: new Date().getFullYear() - 1900 + 1 },
        (_, i) => 1900 + i
      ),
    []
  )

  const months = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(new Date(2024, i, 1), "MMMM", { locale: tr }),
      })),
    []
  )

  const getDays = React.useCallback((date: Date) => {
    const daysInMonth = getDaysInMonth(date)
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }, [])

  React.useEffect(() => {
    const fieldValue = form.getValues(name)
    if (fieldValue) {
      setCurrentMonth(fieldValue)
    }
  }, [form, name])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedDate = field.value || new Date()
        const days = getDays(selectedDate)

        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full bg-background pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP EEEE", { locale: tr })
                    ) : (
                      <span>Tarih seçiniz</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </DialogTrigger>
              <DialogContent className="w-fit p-5">
                <DialogHeader>
                  <DialogTitle className="sr-only">{label}</DialogTitle>
                  <DialogDescription className="sr-only"></DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 p-3">
                  <Select
                    value={selectedDate.getDate().toString()}
                    onValueChange={(value) => {
                      const newDate = setDate(selectedDate, parseInt(value))
                      field.onChange(newDate)
                      setCurrentMonth(newDate)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gün" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDate.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = setMonth(selectedDate, parseInt(value))
                      field.onChange(newDate)
                      setCurrentMonth(newDate)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ay" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem
                          key={month.value}
                          value={month.value.toString()}
                        >
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = setYear(selectedDate, parseInt(value))
                      field.onChange(newDate)
                      setCurrentMonth(newDate)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yıl" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date)
                    if (date) {
                      setCurrentMonth(date)
                      setIsOpen(false)
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  initialFocus
                />
              </DialogContent>
            </Dialog>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
