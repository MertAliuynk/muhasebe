"use client"

import { api, type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVerticalIcon, KeyRound, Pencil, Trash2 } from "lucide-react"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteByIdDiaglog from "@/components/delete-by-id-diaglog"

import { ChangeSecretaryPasswordDialog } from "./change-secretary-password-dialog"
import { EditSecretaryDialog } from "./edit-secretary-dialog"

type Item = RouterOutputs["secretary"]["getSecretariesAdmin"][number]

export default [
  {
    accessorFn: (row) => row.user.name,
    accessorKey: "name",
    header: "Sekreter Adı Soyadı",
    cell: ({ row }) => {
      const name = row.original.user.name
      const image = row.original.user.imagePath

      return (
        <div className="flex items-center gap-2 p-2">
          <Avatar className="rounded-xl">
            <AvatarImage src={getImageUrl(image)} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
          </div>
        </div>
      )
    },
    size: 600,
  },
  {
    accessorKey: "branch",
    header: "Şube",
    cell: ({ row }) => {
      return row.original.branch.name
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefon Numarası",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber
      return phone ? formatPhoneNumberIntl(phone) : "Yok"
    },
    size: 200,
  },
  {
    accessorKey: "createdAt",
    header: "Kayıt Tarihi",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { mutateAsync, isPending } =
        api.secretary.deleteSecretary.useMutation()
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <EditSecretaryDialog
                secretary={row.original}
                trigger={
                  <DropdownMenuItem modal>
                    Düzenle
                    <Pencil size={16} className="ml-auto" />
                  </DropdownMenuItem>
                }
              />
              <ChangeSecretaryPasswordDialog
                secretary={row.original}
                trigger={
                  <DropdownMenuItem modal>
                    Şifre Değiştir
                    <KeyRound size={16} className="ml-auto" />
                  </DropdownMenuItem>
                }
              />
              <DeleteByIdDiaglog
                title="Sekreter Sil"
                description="Bu sekreteri silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                action={{
                  mutateAsync: async () => {
                    await mutateAsync({ id: row.original.id })
                    return
                  },
                  isPending,
                }}
              >
                <DropdownMenuItem modal variant="destructive">
                  Sil
                  <Trash2 size={16} className="ml-auto" />
                </DropdownMenuItem>
              </DeleteByIdDiaglog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
