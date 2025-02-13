import Image from "next/image"
import { Info } from "lucide-react"

import { Alert } from "@/components/ui/alert"

import { SaveCompanyForm } from "./_components/save-company-form"

export default function Page() {
  return (
    <div className="grid grid-cols-[1fr_500px] h-screen max-h-screen">
      <div className="flex items-center justify-center">
        <div className="flex-1 max-w-2xl space-y-4">
          <h1 className="text-3xl font-medium">Şirket Bilgileri</h1>
          <Alert variant="muted">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Devam edebilmek için önce şirket bilgilerinizi düzenleyiniz.
            </div>
          </Alert>
          <SaveCompanyForm />
        </div>
      </div>
      <div className="relative size-full">
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
        <Image
          src="/images/dental-company.jpg"
          fill
          alt="appointment"
          className="hidden h-full  object-cover md:block"
        />
      </div>
    </div>
  )
}
