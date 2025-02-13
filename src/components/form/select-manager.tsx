import React from "react"
import { api } from "@/trpc/react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectManagerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Select>, "onValueChange"> {
  onChange?: (value: string) => void
}

export function SelectManager({
  onChange,
  value,
  ...props
}: SelectManagerProps) {
  const { data: managers } = api.user.getUsers.useQuery({
    where: {
      role: "MANAGER",
    },
  })

  return (
    <Select onValueChange={onChange} defaultValue={value} {...props}>
      <SelectTrigger>
        <SelectValue
          className="placeholder:text-muted-foreground"
          placeholder="Yönetici seçiniz"
        />
      </SelectTrigger>
      <SelectContent>
        {managers?.length ? (
          managers?.map((manager) => (
            <SelectItem key={manager.id} value={manager.id}>
              {manager.name}
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
