import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import { Separator } from "@/components/ui/separator"

import FinancialCards from "./_components/financial/financial-cards"
import PreviewPatient from "./_components/patient-info/preview-patient"
import Instalments from "./_components/payments/instalments"

import "@/config/date"

import PaymentDetailDialog from "./_components/payments/payment-detail-dialog"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function page({ params }: PageProps) {
  const { id } = await params

  const patient = await api.patient.getPatientById({ id })
  const paymentPlans = await api.paymentPlan.getPatientPaymentPlanById({
    patientId: id,
  })
  const payments = await api.payment.getAllPaymentsByPatientId({
    patientId: id,
  })

  const approvedPaymentPlan = paymentPlans.find((plan) => plan.isApproved)

  if (!patient) {
    return notFound()
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <PreviewPatient patient={patient} paymentPlans={paymentPlans} />
        <FinancialCards approvedPaymentPlan={approvedPaymentPlan!} />
      </div>
      <Separator />
      {approvedPaymentPlan && <PaymentDetailDialog payments={payments} />}
      <Instalments
        payments={payments}
        approvedPaymentPlan={approvedPaymentPlan!}
      />
    </div>
  )
}
