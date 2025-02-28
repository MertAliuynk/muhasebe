"use client"

import { changePasswordSchema } from "@/server/api/routers/user/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export default function ChangePassword() {
  const { mutateAsync: changePassword, isPending } =
    api.user.changePassword.useMutation({
      onSuccess: () => {
        toast.success("Şifreniz başarıyla değiştirildi.")
        form.reset()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    await changePassword(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifre Değiştir</CardTitle>
        <CardDescription>
          Güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mevcut Şifre</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mevcut şifrenizi giriniz"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Lütfen mevcut şifrenizi giriniz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Yeni şifrenizi giriniz"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Şifreniz en az 5 karakter uzunluğunda olmalıdır.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPasswordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre Tekrar</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Yeni şifrenizi tekrar giriniz"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Lütfen yeni şifrenizi tekrar giriniz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" loading={isPending}>
              Şifreyi Değiştir
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
