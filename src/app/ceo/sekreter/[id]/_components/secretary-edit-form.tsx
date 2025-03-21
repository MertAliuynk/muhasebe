"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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

type Secretary = RouterOutputs["secretary"]["getSecretaryById"]

const formSchema = z.object({
  phoneNumber: z.string().optional(),
  branchId: z.string().min(1, "Şube seçiniz"),
})

type FormValues = z.infer<typeof formSchema>

interface SecretaryEditFormProps {
  secretary: Secretary
}

export function SecretaryEditForm({ secretary }: SecretaryEditFormProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: branches = [] } = api.branch.getAllBranches.useQuery()

  const { mutate } = api.secretary.updateSecretary.useMutation({
    onSuccess: () => {
      toast.success("Sekreter başarıyla güncellendi")
      router.refresh()
      setIsUpdating(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsUpdating(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: secretary.phoneNumber || "",
      branchId: secretary.branch.id,
    },
  })

  function onSubmit(data: FormValues) {
    setIsUpdating(true)
    void mutate({
      id: secretary.id,
      ...data,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="Telefon Numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şube</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Şube Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Güncelleniyor..." : "Güncelle"}
        </Button>
      </form>
    </Form>
  )
}
