"use client"

import { useRouter } from "next/navigation"
import { saveUserSchema } from "@/server/api/routers/user/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserRole } from "@prisma/client"
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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export default function SaveManagerForm() {
  const router = useRouter()
  const { mutateAsync: saveUser, isPending } = api.user.saveUser.useMutation()

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

  const onSubmit = async (values: z.infer<typeof saveUserSchema>) => {
    await saveUser(values)
    router.refresh()
    form.reset()
    toast.success("Yönetici başarıyla kaydedildi.")
  }

  return (
    <Form {...form}>
      <DrawerHeader>
        <DrawerTitle>Yeni Yönetici Ekle</DrawerTitle>
        <DrawerDescription>
          Yeni bir yönetici ekleyin ve yönetin.
        </DrawerDescription>
      </DrawerHeader>
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
                  Lütfen yönetici için bir şifre giriniz.
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
                  Lütfen şifrenizi tekrar giriniz.
                </FormDescription>
                <FormMessage />
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
