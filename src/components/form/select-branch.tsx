import React from "react"
import { api } from "@/trpc/react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectBranchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Select>, "onValueChange"> {
  onChange?: (value: string) => void
}

export function SelectBranch({ onChange, value, ...props }: SelectBranchProps) {
  const { data: branches } = api.branch.getAll.useQuery()

  return (
    <Select onValueChange={onChange} defaultValue={value} {...props}>
      <SelectTrigger className="bg-background">
        <SelectValue
          className="placeholder:text-muted-foreground"
          placeholder="Şube seçiniz"
        />
      </SelectTrigger>
      <SelectContent>
        {branches?.length ? (
          branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))
        ) : (
          <p className="p-3 text-sm text-center">
            Şube için uygun yönetici bulunamadı.
          </p>
        )}
      </SelectContent>
    </Select>
  )
}
