"use client"

import { useRouter } from "next/navigation"
import { savePatientSchema } from "@/server/api/routers/patient/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { NotebookText, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/form/date-picker"
import SelectDoctor from "@/components/form/select-doctor"
import { PhoneInput } from "@/components/phone-input"

type Props = {
  doctors: RouterOutputs["doctor"]["getDoctorsByBranch"]
}

export default function SavePatientForm({ doctors }: Props) {
  const router = useRouter()
  const utils = api.useUtils()

  const { mutateAsync: savePatient, isPending } =
    api.patient.savePatient.useMutation()

  const form = useForm<z.infer<typeof savePatientSchema>>({
    resolver: zodResolver(savePatientSchema),
    defaultValues: {
      name: "",
      phone: "",
      tcNo: "",
      birthDate: new Date(),
      address: "",
      notes: [""],
      doctors: [],
    },
  })

  const addNoteField = () => {
    const currentNotes = form.getValues("notes")!
    form.setValue("notes", [...currentNotes, ""])
  }

  function onSubmit(values: z.infer<typeof savePatientSchema>) {
    toast.promise(
      savePatient(values).then(async (patient) => {
        await utils.patient.searchPatient.invalidate()
        router.push(`/hasta/${patient.id}`)
      }),
      {
        loading: "Hasta kaydediliyor...",
        success: "Hasta başarıyla kaydedildi.",
        error: "Hasta kaydedilirken bir hata oluştu.",
      }
    )
  }

  return (
    <div className="border bg-sidebar p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <h2 className="text-lg font-medium text-muted-foreground">
            Hasta Bilgileri
          </h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasta Adı Soyadı</FormLabel>
                <FormControl>
                  <Input placeholder="Hasta Adı Soyadı giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="phone"
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
          </div>

          <DatePicker name="birthDate" label="Doğum Tarihi" />

          <SelectDoctor
            name="doctors"
            label="Doktor Seçiniz"
            doctors={doctors}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Hasta'nın adresini giriniz"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Notlar</FormLabel>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={addNoteField}
              >
                <NotebookText size={16} className="mr-2" />
                Not Ekle
              </Button>
            </div>
            {form.watch("notes")?.map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`notes.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="Not giriniz" {...field} />
                        {index > 0 && (
                          <div
                            className="flex h-auto items-center justify-center cursor-pointer"
                            onClick={() => {
                              const currentNotes = [
                                ...(form.getValues("notes") ?? []),
                              ]
                              currentNotes.splice(index, 1)
                              form.setValue("notes", currentNotes)
                            }}
                          >
                            <X size={16} />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            Kaydet
          </Button>
        </form>
      </Form>
    </div>
  )
}
