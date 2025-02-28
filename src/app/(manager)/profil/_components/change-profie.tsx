"use client"

import { useRouter } from "next/navigation"
import { updateUserProfileSchema } from "@/server/api/routers/user/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"

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

type PageProps = {
  userProfile: RouterOutputs["user"]["getUserProfile"]
}

export default function ChangeProfile({ userProfile }: PageProps) {
  const router = useRouter()
  const { update: updateSession, data: session } = useSession()

  const { mutateAsync: updateProfile, isPending } =
    api.user.updateUserProfile.useMutation({
      onSuccess: () => {
        toast.success("Profil bilgileriniz başarıyla güncellendi.")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const form = useForm<z.infer<typeof updateUserProfileSchema>>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: userProfile.name,
      username: userProfile.username,
    },
  })

  const onSubmit = async (values: z.infer<typeof updateUserProfileSchema>) => {
    await updateProfile(values)
    await updateSession({
      user: {
        ...session?.user,
        name: values.name,
        username: values.username,
      },
    })
    router.refresh()
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Bilgileri</CardTitle>
        <CardDescription>
          Kişisel bilgilerinizi güncelleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tam adınızı ve soyadınızı giriniz.
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
                      <Input placeholder="Kullanıcı adı" {...field} />
                    </FormControl>
                    <FormDescription>
                      Kullanıcı adınızı değiştirebilirsiniz. Boşluk ve Türkçe
                      karakter içeremez.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={isPending}>
                Bilgileri Güncelle
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
