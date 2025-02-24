import { api } from "@/trpc/server"
import type { Doctor, User } from "@prisma/client"
import { format } from "date-fns"
import { Building, Clock, Stethoscope } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import NewExpenseDialog from "@/components/new-expense-dialog"

type PageProps = {
  date: string
}

export default async function Expenses({ date }: PageProps) {
  const expenses = await api.expense.getExpensesByBranchId({ date })
  const doctors = await api.doctor.getDoctorsByBranch()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Giderler</CardTitle>
            <CardDescription>Bugün gider akışı listeleniyor.</CardDescription>
          </div>
          <NewExpenseDialog doctors={doctors} />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-24rem)] overflow-y-auto no-scrollbar">
        <div className="space-y-8">
          <div className="divide-y">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{item.expenseType.name}</p>

                  <div className="flex items-center gap-2 h-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {"doctor" in item ? (
                        <>
                          <Stethoscope size={14} />
                          {(item.doctor as Doctor & { user: User }).user.name}
                        </>
                      ) : (
                        <>
                          <Building size={14} />
                          Klinik Ödemesi
                        </>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      Açıklama: {item.description}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-destructive">
                    {formatCurrency(item.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    {format(item.createdAt, "HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
