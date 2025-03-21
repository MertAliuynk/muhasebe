import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { approvePaymentPlanSchema } from "@/server/api/routers/payment-plan/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { TRPCClientError } from "@trpc/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type PageProps = {
  children: React.ReactNode
  data: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]
}
export default function ApprovedPaymentPlan({ children, data }: PageProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const hasMultipleDoctors = data.patient.doctors.length > 1

  const { mutateAsync: approvePaymentPlan, isPending } =
    api.paymentPlan.approvePlan.useMutation()

  const form = useForm<z.infer<typeof approvePaymentPlanSchema>>({
    resolver: zodResolver(approvePaymentPlanSchema),
    defaultValues: {
      id: data.id,
      doctors: data.patient.doctors.map((doctor) => ({
        id: doctor.id,
        amount: hasMultipleDoctors ? 0 : data.totalAmount,
      })),
    },
  })

  const leftAmount =
    data.totalAmount -
    form.watch("doctors").reduce((acc, doctor) => {
      return acc + doctor.amount
    }, 0)

  const onSubmit = async (values: z.infer<typeof approvePaymentPlanSchema>) => {
    if (leftAmount !== 0 && hasMultipleDoctors) {
      toast.error("Paylaşımdan kalan tutar ₺0 olmalıdır.")
      return
    }

    try {
      await approvePaymentPlan(values)
      router.refresh()
      setIsOpen(false)
    } catch (error: unknown) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödeme Planı Onayla</DialogTitle>
          <DialogDescription>
            Bu işlem sonrası ödeme planı onaylanacaktır.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {hasMultipleDoctors && (
              <div className="flex justify-between">
                <p className="text-sm">
                  Toplam Tutar:{" "}
                  <span className="font-bold">
                    {formatCurrencyWithSymbol(data.totalAmount)}
                  </span>
                </p>
                <p className="text-sm">
                  Paylaşımdan Kalan Tutar:{" "}
                  <span className="font-bold">
                    {formatCurrencyWithSymbol(leftAmount)}
                  </span>
                </p>
              </div>
            )}
            {hasMultipleDoctors &&
              data.patient.doctors.map((doctor, index) => (
                <FormField
                  key={doctor.id}
                  control={form.control}
                  name={`doctors.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{doctor.user.name}</FormLabel>
                      <FormControl>
                        <Input
                          prefix="₺"
                          placeholder={`${doctor.user.name} hekimin bu işlemden alacağı tutarı giriniz.`}
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
              ))}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">İptal</Button>
              </DialogClose>
              <Button loading={isPending}>Onayla</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
