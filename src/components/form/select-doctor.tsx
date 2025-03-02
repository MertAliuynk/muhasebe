"use client"

import { useState } from "react"
import Image from "next/image"
import { type RouterOutputs } from "@/trpc/react"
import { useFormContext } from "react-hook-form"

import { cn, getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { Button } from "../ui/button"

interface Props {
  name: string
  label?: string
  doctors: RouterOutputs["doctor"]["getDoctorsByBranch"]
}

export default function SelectDoctor({ name, label, doctors }: Props) {
  const form = useFormContext()
  const [isOpen, setIsOpen] = useState(false)

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
                {field.value?.length > 0 ? (
                  <div className="flex p-4 gap-5 w-full rounded-md border border-input bg-background shadow-sm select-none cursor-pointer hover:bg-muted/50 transition-colors">
                    {doctors
                      .filter((doctor) => field.value.includes(doctor.id))
                      .map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex gap-x-2 items-center"
                        >
                          <Avatar>
                            <AvatarImage
                              src={getImageUrl(doctor.user.imagePath)}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{doctor.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doctor.specialty}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      selectedDoctor={
                        field.value?.includes(doctor.id) ? doctor : undefined
                      }
                      setSelectedDoctors={(doctor) => {
                        const selectedIds = field.value || []
                        const isSelected = selectedIds.includes(doctor.id)
                        const newSelectedIds = isSelected
                          ? selectedIds.filter((id: string) => id !== doctor.id)
                          : [...selectedIds, doctor.id]

                        field.onChange(newSelectedIds)
                      }}
                    />
                  ))}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Tamamla</Button>
                  </DialogClose>
                </DialogFooter>
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
  selectedDoctor:
    | RouterOutputs["doctor"]["getDoctorsByBranch"][number]
    | undefined
  setSelectedDoctors: (
    doctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number]
  ) => void
}

const DoctorCard = ({
  doctor,
  selectedDoctor,
  setSelectedDoctors,
}: DoctorCardProps) => {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] size-full max-h-96 cursor-pointer select-none",
        selectedDoctor &&
          "scale-90 ring-2 ring-ring/60 ring-offset-2 rounded-md"
      )}
      onClick={() => setSelectedDoctors(doctor)}
    >
      <div className="relative size-full">
        <Image
          fill
          priority
          alt="Thumbnail"
          src={
            doctor.user.imagePath
              ? getImageUrl(doctor.user.imagePath)
              : "/images/placeholder.svg"
          }
          className="object-cover size-full rounded-md"
        />
        <div className="absolute inset-0 rounded-md flex items-end bg-gradient-to-t from-background">
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
    </div>
  )
}
