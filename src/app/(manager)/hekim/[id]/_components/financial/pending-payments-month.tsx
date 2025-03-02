import React, { useMemo } from "react"
import { type RouterOutputs } from "@/trpc/react"
import { addMonths, format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MonthlyPayment {
  month: string
  totalAmount: number
  count: number
  details: Array<{
    patientName: string
    amount: number
    doctorCount: number
    id: string
  }>
}

export default function PendingPaymentsMonth({
  data,
}: {
  data: RouterOutputs["doctor"]["getDoctorPendingPayments"]
}) {
  // Doktor sayısı 1 olan ve 1'den fazla olan ödemeleri ayıralım
  const singleDoctorPayments = data.filter(
    (payment) => payment.doctorCount === 1
  )
  const multipleDoctorPayments = data.filter(
    (payment) => payment.doctorCount > 1
  )

  // Tek doktorlu ödemeler için aylık dağılım
  const monthlyData = useMemo(() => {
    const monthlyPayments = new Map<string, MonthlyPayment>()

    singleDoctorPayments.forEach((payment) => {
      if (!payment.nextPaymentDate) return

      const startDate =
        typeof payment.nextPaymentDate === "string"
          ? parseISO(payment.nextPaymentDate)
          : payment.nextPaymentDate

      // Taksit sayısı 0 ise 1 olarak kabul et (sıfıra bölme hatasını önlemek için)
      const installmentCount = payment.installmentCount || 1

      // Kalan tutarı taksit sayısına böl
      const amountPerInstallment = Math.round(
        payment.remainingAmount / installmentCount
      )

      // Her taksit için ayrı ayrı aylara dağıt
      for (let i = 0; i < installmentCount; i++) {
        // Başlangıç tarihine i ay ekle
        const installmentDate = addMonths(startDate, i)
        const monthKey = format(installmentDate, "yyyy-MM")
        const monthLabel = format(installmentDate, "MMMM yyyy", { locale: tr })

        if (!monthlyPayments.has(monthKey)) {
          monthlyPayments.set(monthKey, {
            month: monthLabel,
            totalAmount: 0,
            count: 0,
            details: [],
          })
        }

        const current = monthlyPayments.get(monthKey)!

        // Detay bilgisini ekle
        current.details.push({
          patientName: payment.patientName,
          amount: amountPerInstallment,
          doctorCount: payment.doctorCount,
          id: payment.id,
        })

        monthlyPayments.set(monthKey, {
          ...current,
          totalAmount: current.totalAmount + amountPerInstallment,
          count: current.count + 1,
        })
      }
    })

    return Array.from(monthlyPayments.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, value]) => value)
  }, [singleDoctorPayments])

  // Çoklu doktorlu ödemeler için sadece liste gösterimi
  const multipleDocPaymentsList = useMemo(() => {
    return multipleDoctorPayments.map((payment) => ({
      id: payment.id,
      patientName: payment.patientName,
      remainingAmount: payment.remainingAmount,
      installmentCount: payment.installmentCount,
      nextPaymentDate: payment.nextPaymentDate,
      doctorCount: payment.doctorCount,
    }))
  }, [multipleDoctorPayments])

  if (monthlyData.length === 0 && multipleDocPaymentsList.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Aylık Bekleyen Ödemeler</CardTitle>
          <CardDescription>Bekleyen ödeme bulunamadı</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Tek Doktorlu Ödemeler</span>
            {monthlyData.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {monthlyData.reduce((acc, item) => acc + item.count, 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="multiple" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Çoklu Doktorlu Ödemeler</span>
            {multipleDocPaymentsList.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {multipleDocPaymentsList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-0">
          {monthlyData.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Tek Doktorlu Ödeme Bulunamadı</AlertTitle>
              <AlertDescription>
                Tek doktora ait bekleyen ödeme bulunmamaktadır.
              </AlertDescription>
            </Alert>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {monthlyData.map((item, index) => (
                <AccordionItem key={index} value={`month-${index}`}>
                  <AccordionTrigger>
                    <div className="flex flex-1 justify-between items-center pr-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{item.month}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="ml-auto">
                          {item.count} Ödeme
                        </Badge>
                        <span className="font-semibold text-right">
                          {formatCurrencyWithSymbol(item.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {item.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">
                            {detail.patientName}
                          </span>
                          <span className="text-right">
                            {formatCurrencyWithSymbol(detail.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="multiple" className="mt-0">
          {multipleDocPaymentsList.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Çoklu Doktorlu Ödeme Bulunamadı</AlertTitle>
              <AlertDescription>
                Birden fazla doktora ait bekleyen ödeme bulunmamaktadır.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Dikkat</AlertTitle>
                <AlertDescription>
                  Bu ödemeler birden fazla doktora ait olduğu için aylık dağılım
                  gösterilemiyor.
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                {multipleDocPaymentsList.map((payment, idx) => (
                  <AccordionItem key={idx} value={`payment-${idx}`}>
                    <AccordionTrigger>
                      <div className="flex flex-1 justify-between items-center pr-4">
                        <span className="font-medium">
                          {payment.patientName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {payment.doctorCount} Doktor
                          </Badge>
                          <span className="font-semibold">
                            {formatCurrencyWithSymbol(payment.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Taksit Sayısı
                            </p>
                            <p className="font-medium">
                              {payment.installmentCount}
                            </p>
                          </div>
                          {payment.nextPaymentDate && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Sonraki Ödeme
                              </p>
                              <p className="font-medium">
                                {format(
                                  typeof payment.nextPaymentDate === "string"
                                    ? parseISO(payment.nextPaymentDate)
                                    : payment.nextPaymentDate,
                                  "dd MMMM yyyy",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Kalan Tutar
                            </p>
                            <p className="font-medium">
                              {formatCurrencyWithSymbol(
                                payment.remainingAmount
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Doktor Sayısı
                            </p>
                            <p className="font-medium">{payment.doctorCount}</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
