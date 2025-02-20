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
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
}

export default function SaveExpenseTypeForm({
  expenseType,
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
      <DrawerHeader>
        <DrawerTitle>
          {expenseType ? "Gider Kalemini Düzenle" : "Yeni Gider Kalemi Ekle"}
        </DrawerTitle>
        <DrawerDescription>
          {expenseType
            ? "Gider kalemini düzenleyin."
            : "Yeni bir gider kalemi ekleyin ve yönetin."}
        </DrawerDescription>
      </DrawerHeader>
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

        <DrawerFooter className="flex-row">
          <DrawerClose asChild>
            <Button variant="outline" className="w-28 md:w-40" type="submit">
              İptal
            </Button>
          </DrawerClose>
          <Button className="flex-1" loading={isPending}>
            Kaydet
          </Button>
        </DrawerFooter>
      </form>
    </Form>
  )
}
