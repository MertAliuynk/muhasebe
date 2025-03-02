"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveBranchSchema } from "@/server/api/routers/branch/schema"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { SelectManager } from "@/components/form/select-manager"
import { PhoneInput } from "@/components/phone-input"

type Branch = RouterOutputs["branch"]["getAll"][number]

type PageProps = {
  setIsOpen: (isOpen: boolean) => void
  branch?: Branch
}

export default function SaveBranchForm({ setIsOpen, branch }: PageProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const { mutateAsync: saveBranch, isPending } =
    api.branch.saveBranch.useMutation()

  const form = useForm<z.infer<typeof saveBranchSchema>>({
    resolver: zodResolver(saveBranchSchema),
    defaultValues: {
      id: branch?.id || undefined,
      name: branch?.name || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      managerId: branch?.managerId || "",
      cashReports: {
        cashIncome: 0,
        cashExpense: 0,
        creditCardIncome: 0,
        creditCardExpense: 0,
        transferIncome: 0,
        transferExpense: 0,
      },
    },
    mode: "onChange",
  })

  const onSubmit = async (values: z.infer<typeof saveBranchSchema>) => {
    await saveBranch(values)
    router.refresh()
    form.reset()
    setStep(1)
    toast.success(
      branch ? "Şube başarıyla güncellendi." : "Şube başarıyla kaydedildi."
    )
    setIsOpen(false)
  }

  const handleNextStep = async () => {
    const isValid = await form.trigger([
      "name",
      "address",
      "phone",
      "managerId",
    ])
    if (isValid) {
      setStep(2)
    }
  }

  const handlePreviousStep = () => {
    setStep(1)
  }

  return (
    <Form {...form}>
      {!branch && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center w-full">
            <div
              className={`flex items-center justify-center rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"} px-3 py-1 text-xs`}
            >
              {step > 1 ? <Check className="h-4 w-4 mr-1" /> : null}
              Şirket Bilgileri
            </div>
            <div className="h-1 flex-1 mx-2 bg-muted">
              <div
                className={`h-full bg-primary ${step === 1 ? "w-0" : "w-full"} transition-all duration-300`}
              ></div>
            </div>
            <div
              className={`flex items-center justify-center rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"} px-3 py-1 text-xs`}
            >
              Kasa Bilgileri
            </div>
          </div>
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
        {branch || step === 1 ? (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şubenin Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örneğin: Atakum Şubesi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şubenin Adresi</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şubenin Telefon Numarası</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="TR"
                        placeholder="533 333 33 33"
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
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şubenin Yöneticisi</FormLabel>
                    <FormControl>
                      <SelectManager {...field} />
                    </FormControl>
                    <FormDescription className="hidden md:block">
                      Bir kişi sadece bir şubenin yöneticisi olabilir. Lütfen
                      şube için bir yönetici seçiniz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {branch ? (
              <DialogFooter className="flex-row">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="w-28 md:w-40"
                    type="button"
                  >
                    İptal
                  </Button>
                </DialogClose>
                <Button className="flex-1" loading={isPending}>
                  Güncelle
                </Button>
              </DialogFooter>
            ) : (
              <div className="flex justify-end">
                <Button type="button" onClick={handleNextStep}>
                  İleri <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <h3 className="text-lg font-medium">Kasa Detay Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cashReports.cashIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nakit Gelir</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashReports.cashExpense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nakit Gider</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashReports.creditCardIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kredi Kartı Gelir</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashReports.creditCardExpense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kredi Kartı Gider</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashReports.transferIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Havale/EFT Gelir</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashReports.transferExpense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Havale/EFT Gider</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
              >
                Geri
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-28 md:w-40"
                  type="button"
                >
                  İptal
                </Button>
              </DialogClose>
              <Button className="flex-1" loading={isPending}>
                Kaydet
              </Button>
            </DialogFooter>
          </div>
        )}
      </form>
    </Form>
  )
}
