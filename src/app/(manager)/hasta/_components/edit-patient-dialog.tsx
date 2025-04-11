"use client"

import { updatePatientSchema } from "@/server/api/routers/patient/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { NotebookText, Pencil, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
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
import { PhoneInput } from "@/components/phone-input"

type Patient = RouterOutputs["patient"]["getPatientsByBranch"][number]

type Props = {
  patient: Patient
  onSuccess?: () => void
}

export default function EditPatientDialog({ patient, onSuccess }: Props) {
  const utils = api.useUtils()

  const { mutateAsync: updatePatient, isPending } =
    api.patient.updatePatient.useMutation()

  const form = useForm<z.infer<typeof updatePatientSchema>>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone || "",
      tcNo: patient.tcNo || "",
      birthDate: patient.birthDate || new Date(),
      address: patient.address || "",
      notes: patient.notes || [""],
    },
  })

  const addNoteField = () => {
    const currentNotes = form.getValues("notes")!
    form.setValue("notes", [...currentNotes, ""])
  }

  function onSubmit(values: z.infer<typeof updatePatientSchema>) {
    toast.promise(
      updatePatient(values).then(async () => {
        await utils.invalidate()
        if (onSuccess) onSuccess()
      }),
      {
        loading: "Hasta bilgileri güncelleniyor...",
        success: "Hasta bilgileri başarıyla güncellendi.",
        error: "Hasta bilgileri güncellenirken bir hata oluştu.",
      }
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem modal>
          Düzenle
          <DropdownMenuShortcut>
            <Pencil size={14} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hasta Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Hasta bilgilerini güncellemek için aşağıdaki formu doldurun.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Güncelle
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
