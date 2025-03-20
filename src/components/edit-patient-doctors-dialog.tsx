"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { type Doctor } from "@prisma/client"
import { Trash2, UserPlus, UserRoundPen } from "lucide-react"
import { toast } from "sonner"

import { cn, getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

export default function EditPatientDoctorsDialog({
  patientId,
}: {
  patientId: string
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const { data: doctors } = api.patient.getPatientDoctors.useQuery({
    patientId,
  })

  const { mutateAsync: deleteDoctorFromPatient, isPending: isDeletingDoctor } =
    api.patient.deleteDoctorFromPatient.useMutation()

  const handleDeleteDoctor = (doctorId: string) => {
    toast.promise(
      deleteDoctorFromPatient({
        patientId,
        doctorId,
      }).then(async () => {
        router.refresh()
        await utils.patient.getPatientDoctors.invalidate()
      }),
      {
        loading: "Doktor siliniyor...",
        success: "Doktor başarıyla silindi",
        error: "Doktor silinirken bir hata oluştu",
      }
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="size-12 bg-background rounded-full"
        >
          <UserRoundPen className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex flex-row justify-between items-end gap-5">
          <div>
            <DialogTitle>Hekimleri Düzenle</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Bu işlem, verilerinizi kalıcı olarak
              günceller. Ödeme alınmış doktorların silinmesi mümkün değildir.
            </DialogDescription>
          </div>
          <div className="flex-shrink-0">
            <AddDoctorDialog patientId={patientId} />
          </div>
        </DialogHeader>
        <Separator />
        {doctors?.map((doctor) => (
          <React.Fragment key={doctor.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={getImageUrl(doctor.user.imagePath)} />
                  <AvatarFallback>
                    {doctor.user.name
                      ?.split(" ")
                      .map((name) => name.charAt(0))
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>{doctor.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
              {doctor.hasPaid ? (
                <div className="text-xs underline text-red-500">
                  Ödeme alınmış
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  loading={isDeletingDoctor}
                  onClick={() => handleDeleteDoctor(doctor.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </DialogContent>
    </Dialog>
  )
}

function AddDoctorDialog({ patientId }: { patientId: string }) {
  const router = useRouter()
  const utils = api.useUtils()
  const { data: doctors } = api.doctor.getDoctorsByBranch.useQuery()
  const { data: patientDoctors } = api.patient.getPatientDoctors.useQuery({
    patientId,
  })
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [open, setOpen] = useState(false)

  const { mutate: addDoctorToPatient, isPending } =
    api.patient.addDoctorToPatient.useMutation({
      onSuccess: async () => {
        await utils.patient.getPatientDoctors.invalidate()
        router.refresh()
        toast.success("Doktor başarıyla eklendi")
        setOpen(false)
        setSelectedDoctor(null)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const filteredDoctors = doctors?.filter(
    (doctor) => !patientDoctors?.some((d) => d.id === doctor.id)
  )

  const handleAddDoctor = () => {
    if (!selectedDoctor) {
      toast.error("Lütfen bir doktor seçin")
      return
    }

    addDoctorToPatient({
      patientId,
      doctorId: selectedDoctor.id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="size-5 mr-2" />
          Yeni Hekim Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hekim Ekle</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Bu işlem geri alınamaz. Bu işlem, verilerinizi kalıcı olarak
          günceller.
        </DialogDescription>
        {filteredDoctors?.map((doctor) => (
          <div
            key={doctor.id}
            className={cn(
              "select-none py-2 px-4 rounded-lg cursor-pointer hover:bg-muted",
              selectedDoctor?.id === doctor.id && "bg-muted ring-1 ring-border"
            )}
            onClick={() => setSelectedDoctor(doctor)}
          >
            <div className="flex gap-2 items-center">
              <div>
                <p className="font-medium">{doctor.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {doctor.specialty}
                </p>
              </div>
            </div>
          </div>
        ))}
        <Button
          onClick={handleAddDoctor}
          disabled={!selectedDoctor || isPending}
        >
          {isPending ? "Ekleniyor..." : "Ekle"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
