"use client"

import React, { useEffect, useState } from "react"
import { savePaymentSchema } from "@/server/api/routers/payment/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentType } from "@prisma/client"
import type { TRPCError } from "@trpc/server"
import { HandCoins } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { cn, paymentTypeLabels } from "@/lib/utils"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Combobox } from "./combobox"
import { DatePicker } from "./form/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type PageProps = {
  patients: RouterOutputs["patient"]["getPatientsByBranch"]
  isLoading: boolean
}

export default function NewPaymentDialog({ patients, isLoading }: PageProps) {
  const utils = api.useUtils()

  const { mutateAsync: createPayment, isPending } =
    api.payment.savePayment.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof savePaymentSchema>>({
    resolver: zodResolver(savePaymentSchema),
    defaultValues: {
      whereToPay: "patient",
      amount: 0,
      paymentType: "CASH",
      paymentDate: new Date(),
      note: "",
      patientId: undefined,
      doctorId: undefined,
      createdAt: new Date(),
    },
  })

  const whereToPay = form.watch("whereToPay")

  useEffect(() => {
    if (whereToPay === "branch") {
      form.setValue("patientId", undefined)
      form.setValue("doctorId", undefined)
    }
  }, [whereToPay, form])

  const onSubmit = (values: z.infer<typeof savePaymentSchema>) => {
    toast.promise(
      createPayment(values).then(async () => {
        setIsOpen(false)
        form.reset()
        await utils.invalidate()
      }),
      {
        loading: "Gelir kaydediliyor...",
        success: "Gelir başarıyla kaydedildi.",
        error: (error: TRPCError) => error.message,
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
        >
          <HandCoins size={16} className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Yeni Gelir Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="size-3 sm:size-4 rounded-full bg-green-500" />
            Yeni Gelir Ekle
          </DialogTitle>
          <DialogDescription className="sr-only">
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-4">
              <div className="w-full space-y-2 border rounded-lg p-2 md:p-0 md:border-0">
                <button
                  type="button"
                  className={cn(
                    "select-none py-2 px-2 sm:px-4 rounded-lg cursor-pointer hover:bg-muted w-full text-left",
                    whereToPay === "patient" && "bg-muted ring-1 ring-border"
                  )}
                  onClick={() => form.setValue("whereToPay", "patient")}
                  aria-label="Hasta Geliri Seç"
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <p className="font-medium text-xs sm:text-sm">
                        Hasta Geliri
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hasta ile İlgili Gelirler
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className={cn(
                    "select-none py-2 px-2 sm:px-4 rounded-lg cursor-pointer hover:bg-muted w-full text-left",
                    whereToPay === "branch" && "bg-muted ring-1 ring-border"
                  )}
                  onClick={() => form.setValue("whereToPay", "branch")}
                  aria-label="Klinik Geliri Seç"
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <p className="font-medium text-xs sm:text-sm">
                        Klinik Geliri
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Kliniğe Ait Gelirler
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {whereToPay === "patient" && (
                  <>
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs sm:text-sm">
                            Hasta
                          </FormLabel>
                          <Combobox
                            items={patients ?? []}
                            value={field.value ?? ""}
                            onChange={(value) => {
                              field.onChange(value)
                              form.setValue("doctorId", undefined)
                            }}
                            placeholder="Hasta seçiniz"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {form.watch("patientId") && (
                      <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => {
                          const doctors = patients?.find(
                            (patient) => patient.id === form.watch("patientId")
                          )?.doctors

                          return (
                            <FormItem>
                              <FormLabel className="text-xs sm:text-sm">
                                Doktor
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                                    <SelectValue placeholder="Doktor seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {doctors?.map((doctor) => (
                                    <SelectItem
                                      key={doctor.id}
                                      value={doctor.id}
                                      className="text-xs sm:text-sm"
                                    >
                                      {doctor.user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )
                        }}
                      />
                    )}
                  </>
                )}

                <DatePicker name="createdAt" label="Ödeme Tarihi" />

                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Ödeme Tipi
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                            <SelectValue placeholder="Ödeme tipini seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PaymentType).map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-xs sm:text-sm"
                            >
                              {paymentTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Miktar
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                          prefix="₺"
                          value={
                            field.value === 0
                              ? ""
                              : field.value.toLocaleString("tr-TR")
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            field.onChange(Number(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Not</FormLabel>
                      <FormDescription className="text-xs">
                        Gerekliyse kısa bir açıklama girebilirsiniz. Değilse boş
                        bırakın.
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  className="w-full md:w-auto text-xs sm:text-sm h-8 sm:h-10"
                  disabled={isPending}
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
