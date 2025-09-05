"use client"

import Link from "next/link"
import type { RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarSync, MessageSquare, MoreVertical, Phone } from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { formatCurrencyWithSymbol, getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import SendSmsDialog from "../[id]/_components/patient-info/send-sms-dialog"
import DeletePatientDialog from "./delete-patient-dialog"
import EditPatientDialog from "./edit-patient-dialog"

type Item = RouterOutputs["patient"]["getFilteredPatients"][number]

export function getLastPaidInstallment(plan?: { installments?: { paidAmount: number; lastPaymentDate?: Date | string | null }[] }) {
  return plan?.installments?.filter((i) => i.paidAmount > 0)
    .sort((a, b) => {
      const dateA = a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0
      const dateB = b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0
      return dateB - dateA
    })[0]
}

export default [
  {
    accessorKey: "name",
    header: "Hasta Adı ve Soyadı",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <Link
          href={`/hasta/${patient.id}`}
          className="flex items-center gap-2 hover:bg-muted p-2 rounded-md transition-all duration-300"
        >
          <div>{patient.name}</div>
        </Link>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon Numarası",
    cell: ({ row }) => {
      const phone = row.original.phone
      return (
        <div className="flex items-center gap-2">
          <Phone className="size-4 text-muted-foreground" />
          {phone ? formatPhoneNumber(phone) : "Yok"}
        </div>
      )
    },
  },
  {
  accessorKey: "totalAmount",
  header: "Toplam Tutar",
  cell: ({ row }) => {
    const patient = row.original
    const plan = patient.paymentPlans?.find(plan => plan.isApproved) || patient.paymentPlans?.[0]
    return plan?.totalAmount
      ? formatCurrencyWithSymbol(plan.totalAmount)
      : "-"
  }
  },
  {
  accessorKey: "paidAmount",
  header: "Toplam Ödenen Tutar",
  cell: ({ row }) => {
    const patient = row.original
    const plan = patient.paymentPlans?.find(plan => plan.isApproved) || patient.paymentPlans?.[0]
      return plan?.paidAmount
        ? formatCurrencyWithSymbol(plan.paidAmount)
        : "-"
  }
  },
  {
    accessorKey: "totalRemainingAmount",
    header: "Toplam Kalan Tutar",
    cell: ({ row }) => {
      const totalRemainingAmount = row.original.totalRemainingAmount || 0
      return formatCurrencyWithSymbol(totalRemainingAmount)
    },
  },
  {
    accessorKey: "doctor",
    header: "Hekimler",
    cell: ({ row }) => {
      const doctors = row.original.doctors

      if (!doctors)
        return (
          <Badge variant="destructive">Doktor&apos;u sistemden silinmiş!</Badge>
        )

      return (
        <div className="flex items-center">
          {doctors.map((doctor, index) => (
            <Link
              href={`/hekim/${doctor.id}`}
              key={doctor.id}
              className="flex items-center -ml-3 first:ml-0 hover:scale-125 transition-transform cursor-pointer"
              style={{ zIndex: doctors.length - index }}
            >
              <Avatar className="ring-2 ring-border">
                <AvatarImage src={getImageUrl(doctor?.user?.imagePath)} />
                <AvatarFallback>
                  {doctor?.user?.name?.split(" ")[0]?.charAt(0)}
                  {doctor?.user?.name?.split(" ")[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      )
    },
  },
  {
  accessorKey: "lastPaymentDate",
  header: "Son Ödeme Tarihi",
  cell: ({ row }) => {
    const patient = row.original
    const plan = patient.paymentPlans?.find(plan => plan.isApproved) || patient.paymentPlans?.[0]
    const lastPaidInstallment = getLastPaidInstallment(plan)
    return lastPaidInstallment?.lastPaymentDate
      ? new Date(lastPaidInstallment.lastPaymentDate).toLocaleDateString()
      : "-"
  }
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const data = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <SendSmsDialog patient={data}>
              <DropdownMenuItem modal>
                SMS Gönder
                <DropdownMenuShortcut>
                  <MessageSquare size={14} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </SendSmsDialog>
            <EditPatientDialog patient={data} />
            <DeletePatientDialog patient={data} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    side: "end",
    size: "10",
  },
] as ColumnDef<Item>[]
