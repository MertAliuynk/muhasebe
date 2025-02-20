"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { savePaymentPlanSchema } from "@/server/api/routers/patient/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eraser, SquareChartGantt } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/form/date-picker"

import { PrintPaymentPlan } from "./print-payment-plan"

export default function CreatePaymentPlan({
  patientId,
}: {
  patientId: string
}) {
  const router = useRouter()
  const { mutateAsync: savePaymentPlan, isPending } =
    api.patient.savePaymentPlan.useMutation()

  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof savePaymentPlanSchema>>({
    resolver: zodResolver(savePaymentPlanSchema),
    defaultValues: {
      patientId,
      totalAmount: 0,
      installmentCount: 0,
      interestRate: 0,
      firstInstallmentDate: new Date(),
      installments: [],
    },
  })

  const totalAmount = form.watch("totalAmount")
  const installmentCount = form.watch("installmentCount")
  const firstInstallmentDate = form.watch("firstInstallmentDate")
  const interestRate = form.watch("interestRate")
  const installments = form.watch("installments")

  const initializeInstallments = () => {
    if (!totalAmount || !installmentCount || interestRate === undefined) return

    const interestAmount = totalAmount * (interestRate / 100)
    const totalWithInterest = totalAmount + interestAmount
    const baseInstallmentAmount = totalWithInterest / installmentCount

    const newInstallments = Array.from(
      { length: installmentCount },
      (_, index) => {
        const date = new Date(firstInstallmentDate)
        date.setMonth(date.getMonth() + index)
        return {
          date,
          amount: baseInstallmentAmount,
        }
      }
    )

    form.setValue("installments", newInstallments)
  }

  useEffect(() => {
    if (firstInstallmentDate && installmentCount > 0) {
      initializeInstallments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installmentCount, firstInstallmentDate, interestRate, totalAmount])

  const calculateTotalAmount = () => {
    return installments.reduce(
      (sum, installment) => sum + installment.amount,
      0
    )
  }

  const handleInstallmentAmountChange = (index: number, newAmount: number) => {
    const currentInstallments = [...installments]
    const interestAmount = totalAmount * (interestRate / 100)
    const totalWithInterest = totalAmount + interestAmount

    currentInstallments[index]!.amount = newAmount

    const previousTotal = currentInstallments
      .slice(0, index)
      .reduce((sum, installment) => sum + installment.amount, 0)

    const remainingAmount = totalWithInterest - previousTotal - newAmount
    const remainingInstallments = installmentCount - (index + 1)

    if (remainingInstallments > 0) {
      const remainingInstallmentAmount = remainingAmount / remainingInstallments

      for (let i = index + 1; i < installmentCount; i++) {
        currentInstallments[i]!.amount = remainingInstallmentAmount
      }
    }

    form.setValue("installments", currentInstallments)
  }

  const onSubmit = (values: z.infer<typeof savePaymentPlanSchema>) => {
    toast.promise(
      savePaymentPlan({
        ...values,
      }).then(() => {
        form.reset()
        router.refresh()
        setOpen(false)
      }),
      {
        loading: "Ödeme planı oluşturuluyor...",
        success: "Ödeme planı oluşturuldu",
        error: "Ödeme planı oluşturulurken bir hata oluştu",
      }
    )
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <SquareChartGantt size={16} />
            Ödeme Planı Oluştur
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-5xl">
          <AlertDialogHeader>
            <div className="flex justify-between">
              <div>
                <AlertDialogTitle>Ödeme Planı Oluştur</AlertDialogTitle>
                <AlertDialogDescription>
                  Lütfen ödeme planı detaylarını giriniz.
                </AlertDialogDescription>
              </div>
              {form.formState.dirtyFields && (
                <div className="flex items-center gap-2">
                  <PrintPaymentPlan
                    data={{
                      totalAmount,
                      installmentCount,
                      firstInstallmentDate,
                      installments,
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.reset()
                    }}
                  >
                    <Eraser className="mr-2" size={16} />
                    Formu Temizle
                  </Button>
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-3 gap-10">
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toplam Tutar</FormLabel>
                      <FormControl>
                        <Input
                          prefix="₺"
                          {...field}
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
                  name="installmentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taksit Sayısı</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
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
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faiz Oranı (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
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
              </div>

              {installmentCount > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-10">
                    <div className="col-span-2">
                      <DatePicker
                        name="firstInstallmentDate"
                        label="Taksit Başlangıç Tarihi"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-medium">Taksit Tarihleri</h3>
                    <ScrollArea className="pr-4 max-h-[50vh] overflow-y-auto">
                      <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: installmentCount }).map(
                          (_, index) => (
                            <Card key={index} className="rounded-md p-5">
                              <div className="space-y-4">
                                <DatePicker
                                  name={`installments.${index}.date`}
                                  label={`${index + 1}. Taksit`}
                                />
                                <FormField
                                  control={form.control}
                                  name={`installments.${index}.amount`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          prefix="₺"
                                          {...field}
                                          onChange={(e) => {
                                            const value =
                                              e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                              )
                                            const numValue = Number(value)
                                            handleInstallmentAmountChange(
                                              index,
                                              numValue
                                            )
                                          }}
                                          value={
                                            field.value === undefined ||
                                            field.value === 0
                                              ? ""
                                              : field.value.toLocaleString(
                                                  "tr-TR"
                                                )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </Card>
                          )
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <div>
                  <p>
                    <span className="text-muted-foreground text-sm">
                      Toplam Ödenecek Tutar:{" "}
                    </span>
                    <span className="font-bold">
                      {formatCurrencyWithSymbol(calculateTotalAmount())}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    Plan Oluştur
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
