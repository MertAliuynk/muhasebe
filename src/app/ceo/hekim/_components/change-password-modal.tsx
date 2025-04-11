"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type Doctor = RouterOutputs["doctor"]["getDoctorsAdmin"][number]

interface ChangeDoctorPasswordDialogProps {
  doctor: Doctor
}

const passwordSchema = z.string().min(6, "Şifre en az 6 karakter olmalıdır")

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

export function ChangeDoctorPasswordDialog({
  doctor,
}: ChangeDoctorPasswordDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { mutate } = api.doctor.changeDoctorPassword.useMutation({
    onSuccess: () => {
      toast.success("Şifre başarıyla değiştirildi")
      router.refresh()
      setIsUpdating(false)
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsUpdating(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: FormValues) {
    setIsUpdating(true)
    void mutate({
      id: doctor.id,
      password: data.password,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem modal>
          Şifre Değiştir
          <KeyRound size={16} className="ml-auto" />
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Şifre Değiştir</DialogTitle>
          <DialogDescription>
            {doctor.user.name} için yeni şifre belirleyin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Yeni şifre"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre (Tekrar)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Yeni şifre tekrar"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
