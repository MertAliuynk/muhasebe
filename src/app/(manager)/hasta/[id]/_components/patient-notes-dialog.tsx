import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type PageProps = {
  patient: RouterOutputs["patient"]["getPatientById"]
}

export default function PatientNotesDialog({ patient }: PageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="size-4 text-muted-foreground" />
          Hasta Notları ({patient?.notes[0] ? patient?.notes.length : 0})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hasta Notları</DialogTitle>
          <DialogDescription>
            Bu bölümde hasta notlarını görüntüleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        {patient?.notes[0]?.length === 0 ? (
          <p className="text-center text-muted-foreground underline my-20 text-sm">
            Hasta için herangi bir not yok.
          </p>
        ) : (
          patient?.notes.map((note, index) => (
            <div
              key={index}
              className="border border-dashed py-5 px-3 relative"
            >
              <p className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground">
                {index + 1}.Not
              </p>
              <p className="text-sm">{note}</p>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>
  )
}
