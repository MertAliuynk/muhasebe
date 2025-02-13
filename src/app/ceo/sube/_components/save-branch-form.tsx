"use client"

import { useRouter } from "next/navigation"
import { saveBranchSchema } from "@/server/api/routers/branch/schema"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectManager } from "@/components/form/select-manager"
import { PhoneInput } from "@/components/phone-input"

export default function SaveBranchForm() {
  const router = useRouter()
  const { mutateAsync: saveBranch, isPending } =
    api.branch.saveBranch.useMutation()

  const form = useForm<z.infer<typeof saveBranchSchema>>({
    resolver: zodResolver(saveBranchSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      managerId: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof saveBranchSchema>) => {
    await saveBranch(values)
    router.refresh()
    form.reset()
    toast.success("Şube başarıyla kaydedildi.")
  }

  return (
    <Form {...form}>
      <DrawerHeader>
        <DrawerTitle>Yeni Şube Ekle</DrawerTitle>
        <DrawerDescription>Yeni bir şube ekleyin ve yönetin.</DrawerDescription>
      </DrawerHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şubenin Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örneğin: Atakum Şubesi" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şubenin Adresi</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şubenin Telefon Numarası</FormLabel>
                <FormControl>
                  <PhoneInput
                    defaultCountry="TR"
                    placeholder="533 333 33 33"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şubenin Yöneticisi</FormLabel>
                <FormControl>
                  <SelectManager {...field} />
                </FormControl>
                <FormDescription className="hidden md:block">
                  Bir kişi sadece bir şubenin yöneticisi olabilir. Lütfen şube
                  için bir yönetici seçiniz.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
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
