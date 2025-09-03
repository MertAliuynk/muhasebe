"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { savePatientNoteSchema } from "@/server/api/routers/patient/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FilePlus2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export default function Page({ patientId }: { patientId: string | undefined }) {
  const router = useRouter()

  const { mutateAsync: saveNote } = api.patient.savePatientNote.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof savePatientNoteSchema>>({
    resolver: zodResolver(savePatientNoteSchema),
    defaultValues: {
      patientId,
      note: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof savePatientNoteSchema>) => {
    toast.promise(
      saveNote(values).then(() => {
        form.reset()
        setIsOpen(false)
        router.refresh()
      }),
      {
        loading: "Not kaydediliyor...",
        success: "Not kaydedildi",
        error: "Not kaydedilirken bir hata oluştu",
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilePlus2 className="size-4 mr-2" />
          Yeni Not Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Not Ekle</DialogTitle>
          <DialogDescription>
            Bu bölümde hasta için yeni bir not ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 p-5"
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Not</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Kaydet</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
