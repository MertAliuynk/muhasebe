import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import EditPaymentPlanForm from "./_components/edit-payment-plan-form"

type PageProps = {
  params: Promise<{ paymentPlanId: string }>
}

export default async function page({ params }: PageProps) {
  const { paymentPlanId } = await params

  const paymentPlan = await api.paymentPlan.getPaymentPlanById({
    id: paymentPlanId,
  })

  if (!paymentPlan) {
    return notFound()
  }
  console.log(paymentPlan)

  return (
    <div>
      <EditPaymentPlanForm paymentPlan={paymentPlan} />
    </div>
  )
}
