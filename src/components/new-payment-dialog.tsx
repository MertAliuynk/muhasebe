"use client"

import React, { useEffect, useState } from "react"
import { savePaymentSchema } from "@/server/api/routers/payment/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentType } from "@prisma/client"
import { type TRPCError } from "@trpc/server"
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
        await utils.payment.getAllPaymentsByDate.invalidate()
        form.reset()
        setIsOpen(false)
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
        <Button variant="outline" disabled={isLoading}>
          <HandCoins size={18} className="mr-2" />
          Yeni Gelir Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-green-500"></div>
            Yeni Gelir Ekle
          </DialogTitle>
          <DialogDescription className="sr-only">
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-[200px_1fr] gap-4">
              <div className="w-full space-y-2">
                <div
                  className={cn(
                    "select-none py-2 px-4 rounded-lg cursor-pointer hover:bg-muted",
                    whereToPay === "patient" && "bg-muted ring-1 ring-border"
                  )}
                  onClick={() => form.setValue("whereToPay", "patient")}
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <p className="font-medium">Hasta Geliri</p>
                      <p className="text-sm text-muted-foreground">
                        Hasta ile İlgili Gelirler
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "select-none py-2 px-4 rounded-lg cursor-pointer hover:bg-muted",
                    whereToPay === "branch" && "bg-muted ring-1 ring-border"
                  )}
                  onClick={() => form.setValue("whereToPay", "branch")}
                >
                  <div className="flex gap-2 items-center">
                    <div>
                      <p className="font-medium">Klinik Geliri</p>
                      <p className="text-sm text-muted-foreground">
                        Kliniğe Ait Gelirler
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {whereToPay === "patient" && (
                  <>
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Hasta</FormLabel>
                          <Combobox
                            items={patients ?? []}
                            value={field.value ?? ""}
                            onChange={(value) => {
                              field.onChange(value)
                              form.setValue("doctorId", undefined)
                            }}
                            placeholder="Hasta seçiniz"
                          />
                          <FormMessage />
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
                              <FormLabel>Doktor</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Doktor seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {doctors?.map((doctor) => (
                                    <SelectItem
                                      key={doctor.id}
                                      value={doctor.id}
                                    >
                                      {doctor.user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    )}
                  </>
                )}

                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödeme Tipi</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ödeme tipini seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PaymentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {paymentTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miktar</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Not</FormLabel>
                      <FormDescription>
                        Gerekliyse kısa bir açıklama girebilirsiniz. Değilse boş
                        bırakın.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div></div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
