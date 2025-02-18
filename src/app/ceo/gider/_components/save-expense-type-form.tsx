"use client"

import { useRouter } from "next/navigation"
import { saveExpenseTypeSchema } from "@/server/api/routers/expense/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
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

export default function SaveExpenseTypeForm() {
  const router = useRouter()
  const { mutateAsync: saveExpenseType, isPending } =
    api.expense.saveExpenseType.useMutation()

  const form = useForm<z.infer<typeof saveExpenseTypeSchema>>({
    resolver: zodResolver(saveExpenseTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof saveExpenseTypeSchema>) => {
    toast.promise(
      saveExpenseType(values).then(() => {
        router.refresh()
        form.reset()
      }),
      {
        loading: "Gider kalemi kaydediliyor...",
        success: "Gider kalemi başarıyla kaydedildi.",
        error: "Gider kalemi kaydedilirken bir hata oluştu.",
      }
    )
  }

  return (
    <Form {...form}>
      <DrawerHeader>
        <DrawerTitle>Yeni Gider Kalemi Ekle</DrawerTitle>
        <DrawerDescription>
          Yeni bir gider kalem ekleyin ve yönetin.
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
