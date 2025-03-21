"use client"

import React, { useRef } from "react"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { Printer } from "lucide-react"

import { formatCurrency, paymentTypeLabels } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function PrintInstalments({
  payments,
  patientName,
  instalments,
}: {
  payments: RouterOutputs["payment"]["getAllPaymentsByPatientId"]
  patientName: string
  instalments: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]["installments"]
}) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const originalDisplay = printRef.current.style.display
    printRef.current.style.display = "block"

    const style = document.createElement("style")
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-content, #print-content * {
          visibility: visible;
        }
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
      #print-content {
        display: none;
      }
      @media print {
        #print-content {
          display: block !important;
        }
      }
    `
    document.head.appendChild(style)

    window.print()

    document.head.removeChild(style)
    printRef.current.style.display = originalDisplay
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="size-4 mr-2" />
        Yazdır
      </Button>

      <div ref={printRef} className="hidden">
        <div id="print-content" className="p-8">
          <h1 className="text-2xl font-bold mb-6 capitalize">
            {patientName} Taksit ve Ödeme Listesi
          </h1>

          {/* Taksitler Tablosu */}
          <h2 className="text-xl font-semibold mb-4">Taksitler</h2>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Taksit No
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Ödeme Tarihi
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  En Son Ödeme Yapılan Tarih
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Tutar
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Ödenen Tutar
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {instalments.map((instalment) => {
                const paidPercentage =
                  (instalment.paidAmount * 100) / instalment.amount
                const isOverdue = new Date(instalment.dueDate) < new Date()
                const isCompleted = instalment.isCompleted

                return (
                  <tr key={instalment.id}>
                    <td className="border border-gray-300 p-2">
                      {instalment.number}. Taksit
                    </td>
                    <td className="border border-gray-300 p-2">
                      {format(instalment.dueDate, "PPP EEEE")}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {instalment.lastPaymentDate
                        ? format(instalment.lastPaymentDate, "PPP EEEE")
                        : "-"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {formatCurrency(instalment.amount)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {formatCurrency(instalment.paidAmount)}
                      {paidPercentage > 0 && !isCompleted && (
                        <span className="ml-1 text-sm text-blue-700">
                          (%{Math.round(paidPercentage)})
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {isOverdue && !isCompleted && (
                        <span className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Gecikmiş Ödeme
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Tamamlandı
                        </span>
                      )}
                      {!isOverdue && !isCompleted && (
                        <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          Beklemede
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Ödemeler Tablosu */}
          <h2 className="text-xl font-semibold mb-4">Ödemeler</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Ödeme Tarihi
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Tutar
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Ödeme Yöntemi
                </th>
                <th className="border border-gray-300 p-2 text-left bg-gray-100">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-300 p-2 text-center text-gray-500"
                  >
                    Henüz ödeme yapılmamış
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border border-gray-300 p-2">
                      {format(payment.paymentDate, "PPP EEEE")}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {paymentTypeLabels[payment.paymentType]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {payment.note || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
