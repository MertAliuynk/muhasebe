"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
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

export const allSmsSchema = z.object({
  message: z.string().min(5, {
    message: "Mesaj en az 5 karakter olmalıdır",
  }),
})

export type AllSmsFormValues = z.infer<typeof allSmsSchema>

interface AllSmsFormProps {
  isPending: boolean
  onSubmit: (values: AllSmsFormValues) => void
}

export default function AllSmsForm({ isPending, onSubmit }: AllSmsFormProps) {
  const form = useForm<AllSmsFormValues>({
    resolver: zodResolver(allSmsSchema),
    defaultValues: {
      message: "Sayın hastalarımız,\n",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                Bu mesaj sistemdeki tüm hastalara gönderilecektir.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending || !form.formState.isValid}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gönderiliyor...
            </>
          ) : (
            <>Tüm Hastalara Gönder</>
          )}
        </Button>
      </form>
    </Form>
  )
}
