"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Spinner from "@/components/spinner"

interface ComboboxProps {
  value: string | number | string[] | number[] | null
  onChange: (value: string | string[] | number | number[]) => void
  items: Array<{ id: number | string; name: string }>
  placeholder: string
  isDisabled?: boolean
  onFilter?: (value: string) => void
  multiSelect?: boolean
}

export function Combobox({
  value,
  onChange,
  onFilter,
  items,
  placeholder,
  isDisabled = false,
  multiSelect = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedId: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value)
        ? (value as string[])
        : ([] as string[])
      const newValues = currentValues.includes(selectedId)
        ? currentValues.filter((id) => id !== selectedId)
        : [...currentValues, selectedId]
      onChange(newValues)
    } else {
      const selectedItem = items.find(
        (item) => item.id.toString() === selectedId
      )
      onChange(selectedItem?.id ?? "")
      setOpen(false)
    }
  }

  const getDisplayValue = () => {
    if (!value) return placeholder

    if (multiSelect && Array.isArray(value)) {
      const selectedItems = items.filter((item) =>
        value.some((v) => v.toString() === item.id.toString())
      )
      return selectedItems.length > 0
        ? selectedItems.map((item) => item.name).join(", ")
        : placeholder
    }

    const selectedItem = items.find(
      (item) => item.id.toString() === value?.toString()
    )
    return selectedItem ? selectedItem.name : placeholder
  }

  const handleSelectAll = () => {
    if (!multiSelect) return

    const allIds = items.map((item) => item.id.toString())
    const isAllSelected = Array.isArray(value) && items.length === value.length
    onChange(isAllSelected ? [] : allIds)
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full h-9"
            disabled={isDisabled}
          >
            <span>{getDisplayValue()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command shouldFilter={!onFilter}>
            <CommandInput
              {...(onFilter && {
                onValueChange: onFilter,
              })}
              placeholder="Ara..."
            />
            <CommandList>
              {onFilter && isDisabled ? (
                <Spinner className="mx-auto text-muted-foreground my-5" />
              ) : (
                <CommandEmpty>Sonuç Bulunamadı.</CommandEmpty>
              )}
              <CommandGroup>
                {multiSelect && (
                  <CommandItem onSelect={handleSelectAll} value="select-all">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        Array.isArray(value) && items.length === value.length
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {Array.isArray(value) && items.length === value.length
                      ? "Tümünü Kaldır"
                      : "Tümünü Seç"}
                  </CommandItem>
                )}
                {items?.map((item) => {
                  const isSelected = multiSelect
                    ? Array.isArray(value) &&
                      value.map(String).includes(item.id.toString())
                    : value === item.id

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.name.toLowerCase()}
                      onSelect={() => handleSelect(item.id.toString())}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
