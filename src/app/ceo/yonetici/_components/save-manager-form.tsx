"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveUserSchema } from "@/server/api/routers/user/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserRole } from "@prisma/client"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type User = RouterOutputs["user"]["getUsers"][number]

interface SaveManagerFormProps {
  user?: User
}

export default function SaveManagerForm({ user }: SaveManagerFormProps) {
  const router = useRouter()
  const { mutateAsync: saveUser, isPending } = api.user.saveUser.useMutation()
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof saveUserSchema>>({
    resolver: zodResolver(saveUserSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      passwordConfirm: "",
      role: UserRole.MANAGER,
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name,
        username: user.username,
        password: "",
        passwordConfirm: "",
        role: user.role,
      })
    }
  }, [user, form])

  const onSubmit = async (values: z.infer<typeof saveUserSchema>) => {
    await saveUser(values)
    await utils.invalidate()
    router.refresh()
    form.reset()
    toast.success(
      user
        ? "Yönetici başarıyla güncellendi."
        : "Yönetici başarıyla kaydedildi."
    )
  }

  return (
    <Form {...form}>
      <DialogHeader>
        <DialogTitle>
          {user ? "Yönetici Düzenle" : "Yeni Yönetici Ekle"}
        </DialogTitle>
        <DialogDescription>
          {user
            ? "Yönetici bilgilerini düzenleyin."
            : "Yeni bir yönetici ekleyin ve yönetin."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim Soyisim</FormLabel>
              <FormControl>
                <Input placeholder="Örneğin: Ahmet Yılmaz" {...field} />
              </FormControl>
              <FormDescription className="hidden md:block">
                Lütfen yönetici için bir isim ve soyisim giriniz.
              </FormDescription>
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
                <Input placeholder="Örneğin: ahmetyilmaz" {...field} />
              </FormControl>
              <FormDescription>
                Kullanıcı adı eşsiz olmalıdır ve türkçe karakterler içeremez.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription className="hidden md:block">
                  {user
                    ? "Değiştirmek istemiyorsanız boş bırakabilirsiniz."
                    : "Lütfen yönetici için bir şifre giriniz."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre Tekrar</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription className="hidden md:block">
                  {user
                    ? "Değiştirmek istemiyorsanız boş bırakabilirsiniz."
                    : "Lütfen şifrenizi tekrar giriniz."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className="w-28 md:w-40" type="button">
              İptal
            </Button>
          </DialogClose>
          <Button className="flex-1" loading={isPending}>
            {user ? "Güncelle" : "Kaydet"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
