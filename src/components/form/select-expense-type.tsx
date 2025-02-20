import React from "react"
import { api } from "@/trpc/react"
import { type ControllerRenderProps } from "react-hook-form"

import { Combobox } from "../combobox"

export function SelectExpenseType({ ...field }: ControllerRenderProps) {
  const { value, onChange } = field
  const { data: expenseTypes } = api.expense.getAllExpenseTypes.useQuery()

  return (
    <Combobox
      items={
        expenseTypes?.map((expenseType) => ({
          id: expenseType.id,
          name: expenseType.name,
        })) ?? []
      }
      value={value}
      onChange={onChange}
      placeholder="Gider kalem seçiniz"
    />
  )
}
