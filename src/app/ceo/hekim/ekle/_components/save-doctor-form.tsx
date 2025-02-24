"use client"

import { saveDoctorSchema } from "@/server/api/routers/user/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserRole } from "@prisma/client"
import { type TRPCError } from "@trpc/server"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

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
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/form/date-picker"
import { SelectBranch } from "@/components/form/select-branch"
import UploadImage from "@/components/form/upload-image"
import { PhoneInput } from "@/components/phone-input"

export default function SaveDoctorForm() {
  const { mutateAsync: saveDoctor, isPending } =
    api.user.saveDoctor.useMutation()

  const form = useForm<z.infer<typeof saveDoctorSchema>>({
    resolver: zodResolver(saveDoctorSchema),
    defaultValues: {
      branchId: "",
      name: "",
      username: "",
      phoneNumber: "",
      tcNo: "",
      birthDate: undefined,
      imagePath: undefined,
      password: "",
      passwordConfirm: "",
      role: UserRole.DOCTOR,
      specialty: "",
      commission: 0,
    },
  })

  function onSubmit(values: z.infer<typeof saveDoctorSchema>) {
    if (!values.imagePath) {
      toast.promise(saveDoctor(values), {
        loading: "Hekim kaydediliyor...",
        success: () => {
          form.reset()
          return "Hekim başarıyla kaydedildi."
        },
        error: (error: TRPCError) => error.message,
      })
    } else {
      const formData = new FormData()
      formData.append("file", values.imagePath as unknown as File)

      toast.promise(
        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            return toast.promise(
              saveDoctor({ ...values, imagePath: data.url }),
              {
                loading: "Hekim kaydediliyor...",
                success: () => {
                  form.reset()
                  return "Hekim başarıyla kaydedildi."
                },
                error: (error: TRPCError) => error.message,
              }
            )
          }),
        {
          loading: "Dosya yükleniyor...",
          success: "Dosya yüklendi.",
          error: (error: TRPCError) => error.message,
        }
      )
    }
  }

  return (
    <div className="bg-sidebar p-10 border">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-[240px_1fr] gap-10"
        >
          <FormField
            control={form.control}
            name="imagePath"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadImage {...field} />
                </FormControl>
                <FormDescription>
                  Hekime profil resmi yüklemek isterseniz üstteki geniş alana
                  tıklayınız.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-5">
            <h2 className="text-lg font-medium text-muted-foreground">
              Hekim Genel Bilgiler
            </h2>
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şube</FormLabel>
                  <FormControl>
                    <SelectBranch {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hekimin Adı Soyadı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hekimin Adı Soyadı giriniz"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uzmanlık Alanı</FormLabel>
                  <FormControl>
                    <Input placeholder="Uzmanlık alanı giriniz" {...field} />
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
                  <FormLabel>Telefon Numarası</FormLabel>
                  <FormControl>
                    <PhoneInput defaultCountry="TR" international {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tcNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TC Kimlik No</FormLabel>
                  <FormControl>
                    <Input placeholder="TC Kimlik No giriniz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komisyon</FormLabel>
                  <FormControl>
                    <Input
                      prefix="%"
                      placeholder="Komisyon giriniz"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || !isNaN(Number(value))) {
                          field.onChange(Number(value))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Komisyon oranınını giriniz.</FormDescription>
                </FormItem>
              )}
            />

            <DatePicker name="birthDate" label="Doğum Tarihi" />

            <Separator />
            <div className="space-y-5">
              <h2 className="text-lg font-medium text-muted-foreground">
                Hekim Giriş Bilgileri
              </h2>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Kullanıcı Adı giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Şifre giriniz"
                          type="password"
                          {...field}
                        />
                      </FormControl>
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
                        <Input
                          placeholder="Şifre tekrar giriniz"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              Kaydet
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
