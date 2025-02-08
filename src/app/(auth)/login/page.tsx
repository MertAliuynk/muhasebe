import Image from "next/image"

import Logo from "@/components/logo"

import LoginForm from "../_components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[3fr_2fr]">
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <Image
          src="/images/dentist-treating-patient.jpg"
          alt="Image"
          className="object-cover"
          priority
          fill
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
