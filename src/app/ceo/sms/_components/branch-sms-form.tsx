"use client"

import { type RouterOutputs } from "@/trpc/react"
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
import { Combobox } from "@/components/combobox"

type Branch = RouterOutputs["branch"]["getAllBranches"][number]

// Form şeması
export const branchSmsSchema = z.object({
  branchId: z.string({
    required_error: "Şube seçimi zorunludur",
  }),
  message: z.string().min(5, {
    message: "Mesaj en az 5 karakter olmalıdır",
  }),
})

export type BranchSmsFormValues = z.infer<typeof branchSmsSchema>

interface BranchSmsFormProps {
  branches?: Branch[]
  isPending: boolean
  onSubmit: (values: BranchSmsFormValues) => void
}

export default function BranchSmsForm({
  branches = [],
  isPending,
  onSubmit,
}: BranchSmsFormProps) {
  const form = useForm<BranchSmsFormValues>({
    resolver: zodResolver(branchSmsSchema),
    defaultValues: {
      message: "Sayın hastalarımız,\n",
    },
  })

  const isLoading = isPending || !branches || branches.length === 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şube Seçin</FormLabel>
              <FormControl>
                <Combobox
                  value={field.value}
                  onChange={field.onChange}
                  items={
                    branches?.map((branch) => ({
                      id: branch.id,
                      name: branch.name,
                    })) || []
                  }
                  placeholder="Şube seçin"
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
                Bu mesaj seçilen şubedeki tüm hastalara gönderilecektir.
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
            <>Şube Hastalarına Gönder</>
          )}
        </Button>
      </form>
    </Form>
  )
}
