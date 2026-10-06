"use client"

import { type RouterOutputs } from "@/trpc/react"
import { Check, PlusCircle, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { DateRangePicker } from "@/components/date-range-picker"

import { type FilterType } from "../_hooks/usePatientFilters"
import PrintPatients from "./print-patients"

interface PatientTableFiltersProps {
  selectedFilters: FilterType[]
  toggleFilter: (filter: FilterType) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  filteredPatients: RouterOutputs["patient"]["getFilteredPatients"]
  patientsForPrint: RouterOutputs["patient"]["getFilteredPatients"]
}

const filterOptions = [
  {
    value: "PENDING_PAYMENT" as const,
    label: "Bekleyen Ödemeler",
  },
  {
    value: "OVERDUE_PAYMENT" as const,
    label: "Gecikmiş Ödemeler",
  },
]

export default function PatientTableFilters({
  selectedFilters,
  filteredPatients,
  toggleFilter,
  searchTerm,
  setSearchTerm,
  patientsForPrint,
}: PatientTableFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="relative w-80">
          <Input
            prefix={<Search className="size-4 text-muted-foreground" />}
            placeholder="Hasta adı, telefon veya TC ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className={cn(searchTerm && "pr-8")}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Aramayı temizle"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Popover>
          {/*filtreleme kısmı buradan kaldırıldı sonradan ekleme ihtimali olabilir onun için kalan hiçbirşeye dokunmadım*/}
          <PopoverContent className="w-[12.5rem] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {filterOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleFilter(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedFilters.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <DateRangePicker variant="outline" />
        <PrintPatients patients={patientsForPrint} />
      </div>
    </div>
  )
}
