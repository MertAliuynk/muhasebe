"use client"

import { saveCompanySchema } from "@/server/api/routers/company/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/phone-input"

export function SaveCompanyForm() {
  const { mutateAsync: saveCompany, isPending } =
    api.company.saveCompany.useMutation()

  const form = useForm<z.infer<typeof saveCompanySchema>>({
    resolver: zodResolver(saveCompanySchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      taxNumber: "",
    },
  })

  function onSubmit(values: z.infer<typeof saveCompanySchema>) {
    toast.promise(
      saveCompany(values).then(async () => await signOut()),
      {
        loading: "Şirket kaydediliyor...",
        success: "Şirket başarıyla kaydedildi",
        error: "Şirket kaydedilirken bir hata oluştu",
        position: "top-center",
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şirket Adı</FormLabel>
              <FormDescription>Şirketinizin adını giriniz.</FormDescription>
              <FormControl>
                <Input placeholder="Şirket adını giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormDescription>Şirketinizin adresini giriniz.</FormDescription>
              <FormControl>
                <Input placeholder="Şirket adresini giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormDescription>
                  Şirketinizin telefon numarasını giriniz.
                </FormDescription>
                <FormControl>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="TR"
                      placeholder="533 333 33 33"
                      international
                      {...field}
                    />
                  </FormControl>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi Numarası</FormLabel>
                <FormDescription>
                  Şirketinizin vergi numarasını giriniz.
                </FormDescription>
                <FormControl>
                  <Input placeholder="Vergi numarasını giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          Kaydet
        </Button>
      </form>
    </Form>
  )
}
