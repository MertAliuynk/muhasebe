"use client"

import { useRouter } from "next/navigation"
import { saveExpenseTypeSchema } from "@/server/api/routers/expense/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ExpenseType } from "@prisma/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface SaveExpenseTypeFormProps {
  expenseType?: ExpenseType
  setIsOpen: (isOpen: boolean) => void
}

export default function SaveExpenseTypeForm({
  expenseType,
  setIsOpen,
}: SaveExpenseTypeFormProps) {
  const router = useRouter()
  const { mutateAsync: saveExpenseType, isPending } =
    api.expense.saveExpenseType.useMutation()

  const form = useForm<z.infer<typeof saveExpenseTypeSchema>>({
    resolver: zodResolver(saveExpenseTypeSchema),
    defaultValues: {
      name: expenseType?.name ?? "",
      description: expenseType?.description ?? "",
    },
  })

  const onSubmit = async (values: z.infer<typeof saveExpenseTypeSchema>) => {
    toast.promise(
      saveExpenseType({ ...values, id: expenseType?.id }).then(() => {
        router.refresh()
        form.reset()
        setIsOpen(false)
      }),
      {
        loading: `Gider kalemi ${expenseType ? "düzenleniyor" : "kaydediliyor"}...`,
        success: `Gider kalemi başarıyla ${expenseType ? "düzenlendi" : "kaydedildi"}.`,
        error: `Gider kalemi ${expenseType ? "düzenlenirken" : "kaydedilirken"} bir hata oluştu.`,
      }
    )
  }

  return (
    <Form {...form}>
      <DialogHeader>
        <DialogTitle>
          {expenseType ? "Gider Kalemini Düzenle" : "Yeni Gider Kalemi Ekle"}
        </DialogTitle>
        <DialogDescription>
          {expenseType
            ? "Gider kalemini düzenleyin."
            : "Yeni bir gider kalemi ekleyin ve yönetin."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gider Kaleminin Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örneğin: Şube Genel Gideri" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gider Kaleminin Açıklaması</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className="w-28 md:w-40" type="submit">
              İptal
            </Button>
          </DialogClose>
          <Button className="flex-1" loading={isPending}>
            Kaydet
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
