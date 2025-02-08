"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

const formSchema = z.object({
  userName: z.string().min(1, {
    message: "Kullanıcı adı giriniz.",
  }),
  password: z.string().min(5, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
})

export default function LoginForm() {
  const router = useRouter()

  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsError(false)
    setIsLoading(true)
    const result = await signIn("credentials", {
      userName: values.userName,
      password: values.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setIsError(true)
      return
    } else if (result?.ok) {
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      {isError && (
        <Alert>
          <AlertTitle>Başarısız!</AlertTitle>
          <AlertDescription>Kullanıcı adı veya şifre hatalı.</AlertDescription>
        </Alert>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input placeholder="ornek@email.com" {...field} />
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
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={isLoading}>
          Giriş Yap
        </Button>
      </form>
    </Form>
  )
}
