"use client"

import React from "react"
import { useSession } from "next-auth/react"

export default function Page() {
  const { data: session } = useSession()

  return <div>{session?.user.username}</div>
}
