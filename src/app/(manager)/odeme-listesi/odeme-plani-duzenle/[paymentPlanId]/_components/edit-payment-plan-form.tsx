"use client"

import React, { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updatePaymentPlanSchema } from "@/server/api/routers/payment-plan/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { type TRPCError } from "@trpc/server"
import { Undo2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { formatCurrencyWithSymbol } from "@/lib/utils"
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

function calculateTotalDoctorShares(doctorShares: { totalAmount: number }[]) {
  return doctorShares.reduce((sum, share) => sum + (share.totalAmount || 0), 0)
}

function calculateRemainingAmount(
  totalAmount: number,
  doctorShares: { totalAmount: number }[]
) {
  const totalShares = calculateTotalDoctorShares(doctorShares)
  return totalAmount - totalShares
}

function isSharesValid(
  totalAmount: number,
  doctorShares: { totalAmount: number }[]
) {
  const difference = calculateRemainingAmount(totalAmount, doctorShares)
  return Math.abs(difference) < 1
}

export default function EditPaymentPlan({
  paymentPlan,
}: {
  paymentPlan: NonNullable<RouterOutputs["paymentPlan"]["getPaymentPlanById"]>
}) {
  const router = useRouter()

  const { mutateAsync: updatePaymentPlan, isPending } =
    api.paymentPlan.updatePatientPlan.useMutation()

  const form = useForm<z.infer<typeof updatePaymentPlanSchema>>({
    resolver: zodResolver(updatePaymentPlanSchema),
    defaultValues: {
      id: paymentPlan.id,
      totalAmount: paymentPlan.totalAmount,
      originalAmount: paymentPlan.originalAmount,
      installmentCount: paymentPlan.installmentCount,
      interestRate: paymentPlan.interestRate,
      startDate: paymentPlan.installments[0]?.dueDate ?? undefined,
      installments: paymentPlan.installments.map((installment) => ({
        date: installment.dueDate ?? undefined,
        amount: installment.amount ?? undefined,
      })),
      note: paymentPlan.note ?? "",
      doctorShares: paymentPlan.doctorShares,
    },
  })

  const originalAmount = form.watch("originalAmount")
  const installmentCount = form.watch("installmentCount")
  const interestRate = form.watch("interestRate")
  const installments = form.watch("installments")

  const hasMultipleDoctors = paymentPlan.doctorShares.length > 1

  const calculateTotalAmount = useCallback(() => {
    return (
      installments?.reduce(
        (sum, installment) => sum + (installment?.amount || 0),
        0
      ) || 0
    )
  }, [installments])

  useEffect(() => {
    const interestAmount = originalAmount * (interestRate / 100)
    const newTotalAmount = originalAmount + interestAmount
    form.setValue("totalAmount", newTotalAmount, { shouldDirty: true })
  }, [originalAmount, interestRate, form])

  useEffect(() => {
    if (installmentCount <= 0) return

    const interestAmount = originalAmount * (interestRate / 100)
    const totalWithInterest = originalAmount + interestAmount
    const installmentAmount = totalWithInterest / installmentCount

    const startDate = form.getValues("startDate") || new Date()

    const newInstallments = Array.from({ length: installmentCount }, (_, i) => {
      const installmentDate = new Date(startDate)
      installmentDate.setMonth(startDate.getMonth() + i)

      const existingDate = form.getValues(`installments.${i}.date`)
      if (existingDate) {
        return {
          date: existingDate,
          amount: installmentAmount,
        }
      }

      return {
        date: installmentDate,
        amount: installmentAmount,
      }
    })

    form.setValue("installments", newInstallments, { shouldDirty: true })
  }, [installmentCount, originalAmount, interestRate, form])

  const handleInstallmentAmountChange = (index: number, newAmount: number) => {
    const currentInstallments = [...installments]
    const interestAmount = originalAmount * (interestRate / 100)
    const totalWithInterest = originalAmount + interestAmount

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

  const onSubmit = (values: z.infer<typeof updatePaymentPlanSchema>) => {
    const calculatedTotal = calculateTotalAmount()

    // Doktor paylaşımlarını kontrol et - önceki ödemelerden az olmamalı
    const hasInvalidDoctorShare = values.doctorShares.some(
      (share, index) =>
        share.totalAmount < (paymentPlan.doctorShares[index]?.paidAmount ?? 0)
    )

    if (hasInvalidDoctorShare) {
      toast.error(
        "Bir veya daha fazla doktor için daha önce yapılan ödemeden daha az miktar girilmiş!"
      )
      return
    }

    if (!hasMultipleDoctors) {
      toast.promise(updatePaymentPlan(values), {
        loading: "Ödeme planı düzenleniyor...",
        success: () => {
          router.push(`/hasta/${paymentPlan.patientId}`)
          return "Ödeme planı düzenlendi"
        },
        error: (error: TRPCError) => error.message,
      })
      return
    }

    const totalDoctorShares = calculateTotalDoctorShares(values.doctorShares)

    if (!isSharesValid(calculatedTotal, values.doctorShares)) {
      if (totalDoctorShares > calculatedTotal) {
        toast.error("Doktor paylaşımlarının toplamı, toplam tutardan fazla!")
      } else {
        toast.error(
          "Doktor paylaşımlarının toplamı, toplam tutara eşit olmalı!"
        )
      }
      return
    }

    toast.promise(updatePaymentPlan(values), {
      loading: "Ödeme planı düzenleniyor...",
      success: () => {
        router.push(`/hasta/${paymentPlan.patientId}`)
        return "Ödeme planı düzenlendi"
      },
      error: (error: TRPCError) => error.message,
    })
  }

  useEffect(() => {
    if (!hasMultipleDoctors && paymentPlan.doctorShares.length === 1) {
      const totalAmount = form.getValues("totalAmount")
      form.setValue(`doctorShares.0.totalAmount`, totalAmount, {
        shouldDirty: true,
      })
    }
  }, [
    form,
    hasMultipleDoctors,
    paymentPlan.doctorShares.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    form.watch("totalAmount"),
  ])

  return (
    <div>
      <div className="flex justify-between items-center space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Ödeme Planı Düzenle</h1>
          <p className="text-sm text-muted-foreground">
            Lütfen ödeme planı detaylarını giriniz.
          </p>
        </div>
        {form.formState.dirtyFields && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              form.reset()
            }}
          >
            <Undo2 className="mr-2" size={16} />
            Tüm Değişiklikleri Geri Al
          </Button>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-10">
              <FormField
                control={form.control}
                name="originalAmount"
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

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Not</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {installmentCount > 0 && (
            <div className="space-y-4">
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-medium">Taksit Tarihleri</h3>
                <ScrollArea className="pr-4 max-h-[40vh] overflow-y-auto">
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
                                        const value = e.target.value.replace(
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
                                          : field.value.toLocaleString("tr-TR")
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Doktor Paylaşımları</h3>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm text-muted-foreground">
                  Paylaşılabilir Tutar:{" "}
                  <span
                    className={`font-medium ${!isSharesValid(calculateTotalAmount(), form.watch("doctorShares")) && "text-red-500"}`}
                  >
                    {formatCurrencyWithSymbol(
                      calculateRemainingAmount(
                        calculateTotalAmount(),
                        form.watch("doctorShares")
                      )
                    )}
                  </span>
                </p>
              </div>
            </div>
            {paymentPlan.doctorShares.map((share, index) => (
              <div key={share.id} className="flex items-center gap-4">
                <p className="w-48 line-clamp-1">{share.doctor.user.name}</p>
                <FormField
                  control={form.control}
                  name={`doctorShares.${index}.totalAmount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          disabled={!hasMultipleDoctors}
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
                <p className="text-muted-foreground text-xs">
                  Daha önce bu doktora{" "}
                  <span className="font-bold">
                    {formatCurrencyWithSymbol(share.paidAmount)}
                  </span>{" "}
                  ödeme yapılmış.
                </p>
                <input
                  type="hidden"
                  {...form.register(`doctorShares.${index}.id`)}
                  value={share.id}
                />
              </div>
            ))}
          </div>

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
              <Button type="submit" disabled={isPending}>
                Plan Düzenle
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
