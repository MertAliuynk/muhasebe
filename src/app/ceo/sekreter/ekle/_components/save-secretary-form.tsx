"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveSecretarySchema } from "@/server/api/routers/secretary/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormValues = z.infer<typeof saveSecretarySchema>

export default function SaveSecretaryForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const { data: branches = [] } = api.branch.getAllBranches.useQuery()

  const { mutate } = api.secretary.saveSecretary.useMutation({
    onSuccess: () => {
      toast.success("Sekreter başarıyla kaydedildi")
      router.push("/ceo/sekreter")
      router.refresh()
      setIsSaving(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSaving(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(saveSecretarySchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      phoneNumber: "",
      branchId: "",
    },
  })

  function onSubmit(data: FormValues) {
    setIsSaving(true)
    void mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Sekreter Adı Soyadı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kullanıcı Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Kullanıcı Adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Şifre"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="Telefon Numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şube</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Şube Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </Form>
  )
}
