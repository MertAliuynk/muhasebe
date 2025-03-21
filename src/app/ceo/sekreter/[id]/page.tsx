import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import { SecretaryDetailHeader } from "./_components/secretary-detail-header"
import { SecretaryEditForm } from "./_components/secretary-edit-form"

interface SecretaryDetailsPageProps {
  params: {
    id: string
  }
}

export default async function SecretaryDetailsPage({
  params,
}: SecretaryDetailsPageProps) {
  const id = params.id

  try {
    const secretary = await api.secretary.getSecretaryById({ id })

    return (
      <div className="space-y-5">
        <SecretaryDetailHeader secretary={secretary} />
        <SecretaryEditForm secretary={secretary} />
      </div>
    )
  } catch {
    return notFound()
  }
}
