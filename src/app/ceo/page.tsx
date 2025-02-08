"use client"

import React from "react"
import { signOut, useSession } from "next-auth/react"

export default function Page() {
  const { data: session } = useSession()

  return <div onClick={() => signOut()}>{session?.user.userName}</div>
}
