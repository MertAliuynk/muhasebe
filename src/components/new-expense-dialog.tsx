"use client"

import React, { useState } from "react"
import { saveExpenseSchema } from "@/server/api/routers/expense/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentType } from "@prisma/client"
import { FileInput } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { cn, getImageUrl, paymentTypeLabels } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

import { DatePicker } from "./form/date-picker"
import { SelectExpenseType } from "./form/select-expense-type"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type PageProsp = {
  doctors: RouterOutputs["doctor"]["getDoctorsByBranch"]
  isLoading: boolean
}
export default function NewExpenseDialog({ doctors, isLoading }: PageProsp) {
  const utils = api.useUtils()

  const { mutateAsync: createExpense, isPending } =
    api.expense.saveExpense.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof saveExpenseSchema>>({
    resolver: zodResolver(saveExpenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      expenseTypeId: "",
      doctorId: undefined,
      paymentType: PaymentType.CASH,
      createdAt: new Date(),
    },
  })

  const onSubmit = (values: z.infer<typeof saveExpenseSchema>) => {
    toast.promise(
      createExpense(values).then(async () => {
        setIsOpen(false)
        form.reset()
        await utils.expense.getExpensesByBranchId.invalidate()
        await utils.cashReport.getTodayCashReport.invalidate()
      }),
      {
        loading: "Gider kaydediliyor...",
        success: "Gider başarıyla kaydedildi.",
        error: "Gider kaydedilirken bir hata oluştu.",
      }
    )
  }

  const formatData = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.user.name,
    specialty: doctor.specialty,
    imagePath: doctor.user.imagePath,
    type: "doctor",
  }))

  formatData.unshift({
    id: "clinic",
    name: "Klinik Gideri",
    specialty: "Kliniğe Ait Giderler",
    imagePath: "",
    type: "clinic",
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
        >
          <FileInput size={16} className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Yeni Gider Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="size-3 sm:size-4 rounded-full bg-red-500" />
            Yeni Gider Ekle
          </DialogTitle>
          <DialogDescription className="sr-only">
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-4">
              <div className="w-full space-y-2 max-h-[40vh] md:max-h-[60vh] overflow-y-auto border rounded-lg p-2 md:p-0 md:border-0">
                {formatData.map((doctor) => {
                  const isSelected =
                    form.watch("doctorId") === doctor.id ||
                    (doctor.type === "clinic" &&
                      form.watch("doctorId") === undefined)
                  return (
                    <div
                      key={doctor.id}
                      data-id={`card-${doctor.id}`}
                      className={cn(
                        "select-none py-2 px-2 sm:px-4 rounded-lg cursor-pointer hover:bg-muted",
                        isSelected && "bg-muted ring-1 ring-border"
                      )}
                      onClick={() => {
                        if (doctor.type === "doctor") {
                          form.setValue("doctorId", doctor.id)
                        } else {
                          form.setValue("doctorId", undefined)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (doctor.type === "doctor") {
                            form.setValue("doctorId", doctor.id)
                          } else {
                            form.setValue("doctorId", undefined)
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${doctor.name} seç`}
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar className="size-8 sm:size-10 lg:size-12">
                          <AvatarImage src={getImageUrl(doctor.imagePath)} />
                          <AvatarFallback>
                            {doctor.name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-xs sm:text-sm">
                            {doctor.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-4 sm:space-y-5">
                <FormField
                  control={form.control}
                  name="expenseTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Gider Kalemi
                      </FormLabel>
                      <FormControl>
                        <SelectExpenseType {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <DatePicker name="createdAt" label="Gider Tarihi" />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">
                        Açıklama
                      </FormLabel>
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
