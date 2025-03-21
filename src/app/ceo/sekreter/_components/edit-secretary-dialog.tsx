"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectBranch } from "@/components/form/select-branch"
import { PhoneInput } from "@/components/phone-input"

type Secretary = RouterOutputs["secretary"]["getSecretariesAdmin"][number]

interface EditSecretaryDialogProps {
  secretary: Secretary
  trigger: React.ReactNode
}

const formSchema = z.object({
  phoneNumber: z.string().optional(),
  branchId: z.string().min(1, "Şube seçiniz"),
  name: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
})

type FormValues = z.infer<typeof formSchema>

export function EditSecretaryDialog({
  secretary,
  trigger,
}: EditSecretaryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { mutate } = api.secretary.updateSecretary.useMutation({
    onSuccess: () => {
      toast.success("Sekreter başarıyla güncellendi")
      router.refresh()
      setIsUpdating(false)
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsUpdating(false)
    },
  })
  console.log(secretary)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: secretary.phoneNumber || "",
      branchId: secretary.branch.id,
      name: secretary.user.name,
      username: secretary.user.username,
    },
  })

  function onSubmit(data: FormValues) {
    setIsUpdating(true)
    void mutate({
      id: secretary.id,
      ...data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sekreter Düzenle</DialogTitle>
          <DialogDescription>
            Sekreter bilgilerini düzenleyin.
          </DialogDescription>
        </DialogHeader>

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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="TR"
                        international
                        {...field}
                      />
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
                    <SelectBranch {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
