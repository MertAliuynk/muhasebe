"use client"

import React from "react"
import { api } from "@/trpc/react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import AllSmsForm, { type AllSmsFormValues } from "./_components/all-sms-form"
import BranchSmsForm, {
  type BranchSmsFormValues,
} from "./_components/branch-sms-form"
import SingleSmsForm, {
  type SingleSmsFormValues,
} from "./_components/single-sms-form"

export default function SmsPage() {
  const [activeTab, setActiveTab] = React.useState("singlePatient")

  const { data: patients } = api.patient.getAllPatients.useQuery()

  const { data: branches } = api.branch.getAllBranches.useQuery()

  const sendSmsMutation = api.sms.send.useMutation({
    onSuccess: (data) => {
      toast.success(`SMS başarıyla gönderildi (${data.sentCount} alıcı)`)
    },
    onError: (error) => {
      toast.error(`SMS gönderimi başarısız: ${error.message}`)
    },
  })

  const onSingleSubmit = (values: SingleSmsFormValues) => {
    const selectedPatient = patients?.find((p) => p.id === values.patientId)
    if (!selectedPatient?.phone) {
      toast.error("Hastanın telefon numarası bulunamadı")
      return
    }

    sendSmsMutation.mutate({
      message: values.message,
      recipients: {
        type: "single",
        phoneNumber: selectedPatient.phone,
      },
    })
  }

  const onBranchSubmit = (values: BranchSmsFormValues) => {
    sendSmsMutation.mutate({
      message: values.message,
      recipients: {
        type: "branch",
        branchId: values.branchId,
      },
    })
  }

  const onAllSubmit = (values: AllSmsFormValues) => {
    sendSmsMutation.mutate({
      message: values.message,
      recipients: {
        type: "all",
      },
    })
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SMS Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Hastalara toplu veya bireysel olarak SMS gönderme işlemlerini buradan
          gerçekleştirebilirsiniz.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>SMS Gönderme</CardTitle>
          <CardDescription>
            Göndermek istediğiniz SMS türünü seçin ve gerekli bilgileri
            doldurun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="singlePatient">Tek Hasta</TabsTrigger>
              <TabsTrigger value="branch">Şube Hastaları</TabsTrigger>
              <TabsTrigger value="allPatients">Tüm Hastalar</TabsTrigger>
            </TabsList>

            {/* Tek hasta SMS gönderme */}
            <TabsContent value="singlePatient">
              <SingleSmsForm
                patients={patients}
                isPending={sendSmsMutation.isPending}
                onSubmit={onSingleSubmit}
              />
            </TabsContent>

            {/* Şube hastalarına SMS gönderme */}
            <TabsContent value="branch">
              <BranchSmsForm
                branches={branches}
                isPending={sendSmsMutation.isPending}
                onSubmit={onBranchSubmit}
              />
            </TabsContent>

            {/* Tüm hastalara SMS gönderme */}
            <TabsContent value="allPatients">
              <AllSmsForm
                isPending={sendSmsMutation.isPending}
                onSubmit={onAllSubmit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Not: SMS gönderme işlemi, hastalarınızın telefon numaralarına göre
            gerçekleştirilir. Geçersiz numaralar için SMS gönderimi yapılmaz.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
