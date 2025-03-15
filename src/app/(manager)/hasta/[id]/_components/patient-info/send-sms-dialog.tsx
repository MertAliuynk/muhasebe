"use client"

import { useState } from "react"
import { type RouterOutputs } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Mesajınızı buraya yazınız...",
  }),
})

type PageProps = {
  patient:
    | RouterOutputs["patient"]["getPatientById"]
    | RouterOutputs["patient"]["getFilteredPatients"][number]
  children: React.ReactNode
}

export default function SendSmsDialog({ patient, children }: PageProps) {
  const [isOpen, setIsOpen] = useState(false)

  const message = `Sayın ${patient?.name},
  `
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: message,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>SMS Gönder</DialogTitle>
          <DialogDescription>
            Bu alan, SMS mesajınızın içeriğini içerir.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 p-5"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesaj</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mesajınızı buraya yazınız..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Bu alan, SMS mesajınızın içeriğini içerir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Gönder</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
