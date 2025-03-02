"use client"

import { Check, PlusCircle, Search } from "lucide-react"

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

import { type FilterType } from "../_hooks/usePatientFilters"

interface PatientTableFiltersProps {
  selectedFilters: FilterType[]
  toggleFilter: (filter: FilterType) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
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
  toggleFilter,
  searchTerm,
  setSearchTerm,
}: PatientTableFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-64">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          prefix={<Search className="size-4" />}
          placeholder="Hasta ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="border-dashed">
            <span className="flex items-center">
              <PlusCircle className="size-4 mr-2" />
              Filtrele
            </span>
            {selectedFilters.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedFilters.length}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedFilters.length > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedFilters.length} selected
                    </Badge>
                  ) : (
                    filterOptions
                      .filter((option) =>
                        selectedFilters.includes(option.value)
                      )
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
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
  )
}
