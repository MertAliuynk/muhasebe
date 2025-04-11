"use client"

import { type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"

type Patient = RouterOutputs["patient"]["getAllPatients"][number]

export const singleSmsSchema = z.object({
  patientId: z.string({
    required_error: "Hasta seçimi zorunludur",
  }),
  message: z.string().min(5, {
    message: "Mesaj en az 5 karakter olmalıdır",
  }),
})

export type SingleSmsFormValues = z.infer<typeof singleSmsSchema>

interface SingleSmsFormProps {
  patients?: Patient[]
  isPending: boolean
  onSubmit: (values: SingleSmsFormValues) => void
}

export default function SingleSmsForm({
  patients = [],
  isPending,
  onSubmit,
}: SingleSmsFormProps) {
  const form = useForm<SingleSmsFormValues>({
    resolver: zodResolver(singleSmsSchema),
    defaultValues: {
      message: "Sayın hastamız,\n",
    },
  })

  const handleSubmit = (values: SingleSmsFormValues) => {
    const selectedPatient = patients.find((p) => p.id === values.patientId)
    if (!selectedPatient?.phone) {
      toast.error("Hastanın telefon numarası bulunamadı")
      return
    }

    onSubmit(values)
  }

  const isLoading = isPending || !patients || patients.length === 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasta Seçin</FormLabel>
              <FormControl>
                <Combobox
                  value={field.value}
                  onChange={field.onChange}
                  items={
                    patients?.map((patient) => ({
                      id: patient.id,
                      name: patient.phone
                        ? `${patient.name} (${patient.phone})`
                        : patient.name,
                    })) || []
                  }
                  placeholder="Hasta seçin"
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mesaj</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mesaj içeriğini girin..."
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mesajınız Türkçe karakter içerebilir.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gönderiliyor...
            </>
          ) : (
            <>Gönder</>
          )}
        </Button>
      </form>
    </Form>
  )
}
