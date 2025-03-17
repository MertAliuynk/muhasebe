import React from "react"
import { api } from "@/trpc/server"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function BranchPaymentSummary() {
  const data = await api.report.branchPaymentSummary()

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Bekleyen Tutar
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Gecikmiş Tutar
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingPercentage = data
    ? Math.round((data.totalOverdueAmount / data.totalPendingAmount) * 100) || 0
    : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Bekleyen Tutar
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data?.totalPendingAmount || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Tüm hastaların toplam bekleyen ödeme tutarı
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Gecikmiş Tutar
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {formatCurrency(data?.totalOverdueAmount || 0)}
            </div>
            {pendingPercentage > 0 && (
              <div className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                <TrendingUp className="mr-1 h-3 w-3" />
                {pendingPercentage}%
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Vadesi geçmiş toplam ödeme tutarı
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-destructive"
              style={{ width: `${pendingPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
