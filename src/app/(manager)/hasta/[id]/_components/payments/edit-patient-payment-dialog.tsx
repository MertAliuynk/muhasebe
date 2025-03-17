"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePaymentSchema } from "@/server/api/routers/payment/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/form/date-picker"

type Props = {
  payment: RouterOutputs["payment"]["getAllPaymentsByPatientId"][number]
  onSuccess?: () => void
}

export default function EditPatientPaymentDialog({
  payment,
  onSuccess,
}: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const utils = api.useUtils()

  const { mutateAsync: updatePayment, isPending } =
    api.payment.updatePayment.useMutation()

  const form = useForm<z.infer<typeof updatePaymentSchema>>({
    resolver: zodResolver(updatePaymentSchema),
    defaultValues: {
      id: payment.id,
      whereToPay: "patient",
      amount: payment.amount,
      paymentType: payment.paymentType,
      note: payment.note || "",
      editedAt: payment.createdAt,
    },
  })

  function onSubmit(values: z.infer<typeof updatePaymentSchema>) {
    toast.promise(
      updatePayment(values).then(async () => {
        router.refresh()
        setIsOpen(false)
        await utils.cashReport.getTodayCashReport.invalidate()
        if (onSuccess) onSuccess()
      }),
      {
        loading: "Ödeme güncelleniyor...",
        success: "Ödeme başarıyla güncellendi.",
        error: "Ödeme güncellenirken bir hata oluştu.",
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <DialogTitle>Ödeme Düzenle</DialogTitle>
          <DialogDescription>
            Ödeme bilgilerini güncellemek için aşağıdaki formu doldurun.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ödeme Tutarı</FormLabel>
                  <FormControl>
                    <Input
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
            <DatePicker name="editedAt" label="Ödeme Tarihi" />

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
                        <SelectValue placeholder="Ödeme tipini seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Nakit</SelectItem>
                      <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Havale/EFT</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormControl>
                    <Textarea
                      placeholder="Ödeme ile ilgili not giriniz"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
