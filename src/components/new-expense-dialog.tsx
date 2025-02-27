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

import { env } from "@/env"
import { cn, paymentTypeLabels } from "@/lib/utils"
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
        <Button variant="outline" disabled={isLoading}>
          <FileInput size={18} className=" mr-2" />
          Yeni Gider Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-red-500"></div>
            Yeni Gider Ekle
          </DialogTitle>
          <DialogDescription className="sr-only">
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-[250px_1fr] gap-4">
              <div className="w-full space-y-2">
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
                        "select-none py-2 px-4 rounded-lg cursor-pointer hover:bg-muted",
                        isSelected && "bg-muted ring-1 ring-border"
                      )}
                      onClick={() => {
                        if (doctor.type === "doctor") {
                          form.setValue("doctorId", doctor.id)
                        } else {
                          form.setValue("doctorId", undefined)
                        }
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={`${env.NEXT_PUBLIC_MINIO_URL}${doctor.imagePath}`}
                          />
                          <AvatarFallback>
                            {doctor.name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="expenseTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gider Kalemi</FormLabel>
                      <FormControl>
                        <SelectExpenseType {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
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
