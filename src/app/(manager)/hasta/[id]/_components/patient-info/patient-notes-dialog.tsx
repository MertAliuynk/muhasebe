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

import SavePatientNoteDialog from "./save-patient-note-dialog"

type PageProps = {
  patient: RouterOutputs["patient"]["getPatientById"]
}

export default function PatientNotesDialog({ patient }: PageProps) {
  const filteredNotes = patient?.notes?.filter((note) => note.length)
  console.log(filteredNotes)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="size-4 text-muted-foreground" />
          Hasta Notları ({filteredNotes?.length ?? 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-end justify-between mr-4">
          <div>
            <DialogTitle>Hasta Notları</DialogTitle>
            <DialogDescription>
              Bu bölümde hasta notlarını görüntüleyebilirsiniz.
            </DialogDescription>
          </div>
          <SavePatientNoteDialog patientId={patient?.id} />
        </DialogHeader>
        {filteredNotes?.length === 0 ? (
          <p className="text-center text-muted-foreground underline my-20 text-sm">
            Hasta için herangi bir not yok.
          </p>
        ) : (
          filteredNotes?.map((note, index) => (
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
