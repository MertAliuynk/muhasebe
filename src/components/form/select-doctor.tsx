"use client"

import { useState } from "react"
import Image from "next/image"
import { type RouterOutputs } from "@/trpc/react"
import { useFormContext } from "react-hook-form"

import { env } from "@/env"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface Props {
  name: string
  label?: string
  doctors: RouterOutputs["doctor"]["getDoctorsByBranch"]
}

export default function SelectDoctor({ name, label, doctors }: Props) {
  const form = useFormContext()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<
    RouterOutputs["doctor"]["getDoctorsByBranch"][number] | null
  >(null)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                {selectedDoctor ? (
                  <div className="flex gap-x-2 h-14 w-full items-center rounded-md border border-input bg-background px-3 py-1 shadow-sm text-sm select-none cursor-pointer">
                    <Avatar>
                      <AvatarImage
                        src={`${env.NEXT_PUBLIC_MINIO_URL}${selectedDoctor.user.imagePath}`}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{selectedDoctor.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedDoctor.specialty}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-x-2 h-14 w-full items-center rounded-md border border-input bg-background px-3 py-1 shadow-sm text-sm select-none cursor-pointer">
                    Doktor seçmek için bu alana tıklayın.
                  </div>
                )}
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg">
                <DialogHeader>
                  <DialogTitle>Doktor Seç</DialogTitle>
                  <DialogDescription>
                    Lütfen hasta tedavilerini gerçekleştirecek doktoru seçiniz.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-5 place-items-center max-h-[80vh] overflow-y-auto">
                  {doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      selectedDoctor={selectedDoctor}
                      setSelectedDoctor={(doctor) => {
                        setSelectedDoctor(doctor)
                        field.onChange(doctor.id)
                      }}
                      setIsOpen={setIsOpen}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type DoctorCardProps = {
  doctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number]
  selectedDoctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number] | null
  setSelectedDoctor: (
    doctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number]
  ) => void
  setIsOpen: (isOpen: boolean) => void
}

const DoctorCard = ({
  doctor,
  selectedDoctor,
  setSelectedDoctor,
  setIsOpen,
}: DoctorCardProps) => {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] size-full max-h-96 cursor-pointer select-none",
        selectedDoctor?.id === doctor.id &&
          "scale-90 ring-2 ring-ring/60 ring-offset-2 rounded-md"
      )}
      onClick={() => {
        setSelectedDoctor(doctor)
        setIsOpen(false)
      }}
    >
      <div className="relative size-full">
        <Image
          fill
          priority
          alt="Thumbnail"
          src={
            doctor.user.imagePath
              ? `${env.NEXT_PUBLIC_MINIO_URL}${doctor.user.imagePath}`
              : "/images/placeholder.svg"
          }
          className="object-cover size-full rounded-md"
        />
      </div>
      <div className="overlay">
        <div className="p-2 md:p-6">
          <h2 className="line-clamp-1 text-sm font-medium md:text-lg">
            {doctor.user.name}
          </h2>
          <p className="line-clamp-3 text-xs text-muted-foreground md:text-base">
            {doctor.specialty}
          </p>
        </div>
      </div>
    </div>
  )
}
