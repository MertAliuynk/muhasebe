import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import PreviewPatient from "./_components/preview-patient"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function page({ params }: PageProps) {
  const { id } = await params

  const patient = await api.patient.getPatientById({ id })

  if (!patient) {
    return notFound()
  }

  return (
    <div>
      <PreviewPatient patient={patient} />
    </div>
  )
}
