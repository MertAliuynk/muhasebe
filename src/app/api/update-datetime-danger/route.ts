import { NextResponse } from "next/server"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const updateResults = {
      patientPayment: { paymentDate: 0, createdAt: 0 },
      doctorIncome: { paymentDate: 0, createdAt: 0 },
      branchPayment: { paymentDate: 0, createdAt: 0 },
      branchExpense: { createdAt: 0 },
      doctorExpense: { createdAt: 0 },
    }

    const patientPaymentsPaymentDate = await db.$queryRaw`
        SELECT id, "paymentDate" 
        FROM "PatientPayment" 
        WHERE to_char("paymentDate", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const payment of patientPaymentsPaymentDate as {
      id: string
      paymentDate: Date
    }[]) {
      const newDate = new Date(payment.paymentDate)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.patientPayment.update({
        where: { id: payment.id },
        data: { paymentDate: newDate },
      })

      updateResults.patientPayment.paymentDate++
    }

    const patientPaymentsCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "PatientPayment" 
      WHERE to_char("createdAt", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const payment of patientPaymentsCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(payment.createdAt)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.patientPayment.update({
        where: { id: payment.id },
        data: { createdAt: newDate },
      })

      updateResults.patientPayment.createdAt++
    }

    const doctorIncomesPaymentDate = await db.$queryRaw`
        SELECT id, "paymentDate" 
        FROM "DoctorIncome" 
        WHERE to_char("paymentDate", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const income of doctorIncomesPaymentDate as {
      id: string
      paymentDate: Date
    }[]) {
      const newDate = new Date(income.paymentDate)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.doctorIncome.update({
        where: { id: income.id },
        data: { paymentDate: newDate },
      })

      updateResults.doctorIncome.paymentDate++
    }

    const doctorIncomesCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "DoctorIncome" 
      WHERE to_char("createdAt", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const income of doctorIncomesCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(income.createdAt)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.doctorIncome.update({
        where: { id: income.id },
        data: { createdAt: newDate },
      })

      updateResults.doctorIncome.createdAt++
    }

    const branchPaymentsPaymentDate = await db.$queryRaw`
        SELECT id, "paymentDate" 
        FROM "BranchPayment" 
        WHERE to_char("paymentDate", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const payment of branchPaymentsPaymentDate as {
      id: string
      paymentDate: Date
    }[]) {
      const newDate = new Date(payment.paymentDate)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.branchPayment.update({
        where: { id: payment.id },
        data: { paymentDate: newDate },
      })

      updateResults.branchPayment.paymentDate++
    }

    const branchPaymentsCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "BranchPayment" 
      WHERE to_char("createdAt", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const payment of branchPaymentsCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(payment.createdAt)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.branchPayment.update({
        where: { id: payment.id },
        data: { createdAt: newDate },
      })

      updateResults.branchPayment.createdAt++
    }

    const branchExpensesCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "BranchExpense" 
      WHERE to_char("createdAt", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const expense of branchExpensesCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(expense.createdAt)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.branchExpense.update({
        where: { id: expense.id },
        data: { createdAt: newDate },
      })

      updateResults.branchExpense.createdAt++
    }

    const doctorExpensesCreatedAt = await db.$queryRaw`
      SELECT id, "createdAt" 
      FROM "DoctorExpense" 
      WHERE to_char("createdAt", 'HH24:MI:SS.MS') LIKE '12:00:00.000%'
    `

    for (const expense of doctorExpensesCreatedAt as {
      id: string
      createdAt: Date
    }[]) {
      const newDate = new Date(expense.createdAt)
      newDate.setUTCDate(newDate.getUTCDate() - 1) // 1 gün ileri taşı

      await db.doctorExpense.update({
        where: { id: expense.id },
        data: { createdAt: newDate },
      })

      updateResults.doctorExpense.createdAt++
    }

    const totalUpdated =
      updateResults.patientPayment.paymentDate +
      updateResults.patientPayment.createdAt +
      updateResults.doctorIncome.paymentDate +
      updateResults.doctorIncome.createdAt +
      updateResults.branchPayment.paymentDate +
      updateResults.branchPayment.createdAt +
      updateResults.branchExpense.createdAt +
      updateResults.doctorExpense.createdAt

    return NextResponse.json(
      {
        success: true,
        message: "Tarih/saat değerleri başarıyla güncellendi",
        data: {
          patientPayment: updateResults.patientPayment,
          doctorIncome: updateResults.doctorIncome,
          branchPayment: updateResults.branchPayment,
          branchExpense: updateResults.branchExpense,
          doctorExpense: updateResults.doctorExpense,
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
