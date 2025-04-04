import { NextResponse } from "next/server"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Sonuçları takip etmek için bir obje oluşturuyoruz
    const updateResults = {
      patientPayment: { paymentDate: 0, createdAt: 0 },
    }
    const patientPaymentsPaymentDate = await db.$queryRaw`
        SELECT id, "paymentDate" 
        FROM "PatientPayment" 
        WHERE 
        to_char("paymentDate", 'HH24:MI:SS.MS') LIKE '21:00:00.000%' OR 
        to_char("paymentDate", 'HH24:MI:SS.MS') LIKE '00:00:00.000%'
    `

    for (const income of patientPaymentsPaymentDate as {
      id: string
      paymentDate: Date
    }[]) {
      const newDate = new Date(income.paymentDate)
      newDate.setUTCHours(12, 0, 0, 0)

      await db.patientPayment.update({
        where: { id: income.id },
        data: { paymentDate: newDate },
      })

      updateResults.patientPayment.paymentDate++
    }

    // 2. DoctorIncome modelinde createdAt güncellemesi
    const patientPaymentsCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "PatientPayment" 
      WHERE 
        to_char("createdAt", 'HH24:MI:SS.MS') LIKE '21:00:00.000%' OR 
        to_char("createdAt", 'HH24:MI:SS.MS') LIKE '00:00:00.000%'
    `

    for (const income of patientPaymentsCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(income.createdAt)
      newDate.setUTCHours(12, 0, 0, 0)

      await db.patientPayment.update({
        where: { id: income.id },
        data: { createdAt: newDate },
      })

      updateResults.patientPayment.createdAt++
    }

    const totalUpdated =
      updateResults.patientPayment.paymentDate +
      updateResults.patientPayment.createdAt

    return NextResponse.json(
      {
        success: true,
        message: "Tarih/saat değerleri başarıyla güncellendi",
        data: {
          patientPayment: updateResults.patientPayment,
          totalUpdated,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Tarih/saat güncelleme hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Tarih/saat değerleri güncellenirken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    )
  }
}
