import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import PreviewDoctor from "./_components/preview-doctor"

type PageProps = {
  params: Promise<{ doctorUsername: string }>
}
export default async function page({ params }: PageProps) {
  const { doctorUsername } = await params

  const doctor = await api.doctor.getDoctorByUsername({
    username: doctorUsername,
  })

  if (!doctor) {
    return notFound()
  }

  return (
    <div className="">
      <PreviewDoctor doctor={doctor} />
    </div>
  )
}
