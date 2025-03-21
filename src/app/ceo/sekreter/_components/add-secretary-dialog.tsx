"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
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

interface AddSecretaryDialogProps {
  trigger: React.ReactNode
}

const passwordSchema = z
  .string()
  .min(6, "Şifre en az 6 karakter olmalıdır")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Şifre en az bir büyük harf içermelidir",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Şifre en az bir küçük harf içermelidir",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Şifre en az bir rakam içermelidir",
  })

const formSchema = z.object({
  phoneNumber: z
    .string()
    .optional()
    .refine((value) => {
      // Boş veya undefined olabilir
      if (!value) return true
      // E.164 formatında telefon numarası doğrulaması
      return /^\+[1-9]\d{1,14}$/.test(value)
    }, "Geçerli bir telefon numarası giriniz"),
  branchId: z.string().min(1, "Şube seçiniz"),
  name: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: passwordSchema,
})

type FormValues = z.infer<typeof formSchema>

export function AddSecretaryDialog({ trigger }: AddSecretaryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate } = api.secretary.saveSecretary.useMutation({
    onSuccess: () => {
      toast.success("Sekreter başarıyla eklendi")
      router.refresh()
      setIsSubmitting(false)
      setOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSubmitting(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      branchId: "",
      name: "",
      username: "",
      password: "",
    },
  })

  function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    void mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Sekreter Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir sekreter eklemek için aşağıdaki bilgileri doldurun.
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
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={value}
                        onChange={onChange}
                        defaultCountry="TR"
                        international
                        {...rest}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
