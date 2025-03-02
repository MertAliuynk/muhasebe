import React from "react"
import { api } from "@/trpc/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import Spinner from "@/components/spinner"

import columns from "./pending-payments-columuns"
import PendingPaymentsMonth from "./pending-payments-month"

type PageProps = {
  doctorId: string
  children: React.ReactNode
}

export default function PendingPaymentsDialog({
  doctorId,
  children,
}: PageProps) {
  const { data: pendingPayments, isLoading } =
    api.doctor.getDoctorPendingPayments.useQuery({
      doctorId,
    })

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Bekleyen Ödemeler</DialogTitle>
          <DialogDescription>
            Doktorun hastalarına ait bekleyen ödemeler listesi
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="month">Aylık</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <DataTable columns={columns} data={pendingPayments || []} />
            </TabsContent>
            <TabsContent value="month">
              <PendingPaymentsMonth data={pendingPayments || []} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
