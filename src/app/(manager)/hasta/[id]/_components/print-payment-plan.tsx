import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Printer } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PrintPaymentPlanProps {
  data: {
    totalAmount: number
    installmentCount: number
    firstInstallmentDate: Date
    installments: Array<{
      date: Date
      amount: number
    }>
  }
}

export function PrintPaymentPlan({ data }: PrintPaymentPlanProps) {
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Ödeme Planı</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .table th { background-color: #f5f5f5; }
            .footer { margin-top: 30px; text-align: right; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ödeme Planı</h1>
              <p>Oluşturulma Tarihi: ${format(new Date(), "dd MMMM yyyy", {
                locale: tr,
              })}</p>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Taksit No</th>
                  <th>Taksit Tarihi</th>
                  <th>Taksit Tutarı</th>
                </tr>
              </thead>
              <tbody>
                ${data.installments
                  .map(
                    (installment, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${format(installment.date, "dd MMMM yyyy", { locale: tr })}</td>
                    <td>${formatCurrencyWithSymbol(installment.amount)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              <p><strong>Toplam Ödenecek:</strong> ${formatCurrencyWithSymbol(
                data.installments.reduce((a, b) => a + b.amount, 0)
              )}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="flex items-center gap-2"
    >
      <Printer className="size-4" />
      Yazdır
    </Button>
  )
}
