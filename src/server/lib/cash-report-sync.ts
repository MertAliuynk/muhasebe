import { db } from "@/server/db"
import { PaymentType } from "@prisma/client"
import { addDays, eachDayOfInterval, setHours, startOfDay } from "date-fns"
import { after } from "next/server"

/**
 * Kasa raporu senkronizasyonunu response client'a döndükten sonra, arka planda
 * çalıştırır; ekleme/güncelleme/silme mutasyonu bu işlemi beklemeden hemen döner.
 * Bir hata olursa kullanıcıyı etkilemez, sadece loglanır.
 */
export function scheduleCashReportSync(branchId: string, fromDate: Date) {
  after(() =>
    syncCashReportsFrom(branchId, fromDate).catch((error) => {
      console.error("Kasa raporu senkronizasyon hatası:", error)
    })
  )
}

/**
 * Kasa bakiyesi kümülatif olduğu için yeni/güncellenen/silinen bir kayıt yalnızca
 * kendi tarihinden bugüne kadar olan raporları etkiler, öncesini etkilemez.
 * Bu yüzden her seferinde şubenin tüm geçmişini değil, sadece `fromDate`'ten
 * bugüne kadar olan aralığı yeniden hesaplar; başlangıç bakiyesi olarak
 * `fromDate`'ten önceki en son kasa raporunu kullanır.
 */
export async function syncCashReportsFrom(branchId: string, fromDate: Date) {
  const rangeStart = startOfDay(fromDate)
  const today = startOfDay(new Date())

  if (rangeStart > today) {
    return
  }

  const previousReport = await db.cashReport.findFirst({
    where: {
      branchId,
      createdAt: { lt: rangeStart },
    },
    orderBy: { createdAt: "desc" },
  })

  let currentCashBalance = previousReport?.cashBalance ?? 0
  let currentCardBalance = previousReport?.cardBalance ?? 0
  let currentTransferBalance = previousReport?.transferBalance ?? 0

  await db.cashReport.deleteMany({
    where: {
      branchId,
      createdAt: { gte: rangeStart },
    },
  })

  const dateRange = eachDayOfInterval({ start: rangeStart, end: today })

  for (const date of dateRange) {
    const dayStart = startOfDay(date)
    const dayEnd = startOfDay(addDays(date, 1))

    const [
      cashPatientIncomes,
      cashBranchIncomes,
      cashDoctorExpenses,
      cashBranchExpenses,
      cardPatientIncomes,
      cardBranchIncomes,
      cardDoctorExpenses,
      cardBranchExpenses,
      transferPatientIncomes,
      transferBranchIncomes,
      transferDoctorExpenses,
      transferBranchExpenses,
    ] = await Promise.all([
      db.patientPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CASH,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CASH,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.doctorExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CASH,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CASH,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.patientPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CREDIT_CARD,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CREDIT_CARD,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.doctorExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CREDIT_CARD,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.CREDIT_CARD,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.patientPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.BANK_TRANSFER,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchPayment.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.BANK_TRANSFER,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.doctorExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.BANK_TRANSFER,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      db.branchExpense.aggregate({
        where: {
          branchId,
          paymentType: PaymentType.BANK_TRANSFER,
          isDeleted: false,
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
    ])

    const cashIncome =
      (cashPatientIncomes._sum.amount || 0) +
      (cashBranchIncomes._sum.amount || 0)
    const cashExpense =
      (cashDoctorExpenses._sum.amount || 0) +
      (cashBranchExpenses._sum.amount || 0)
    currentCashBalance = currentCashBalance + cashIncome - cashExpense

    const cardIncome =
      (cardPatientIncomes._sum.amount || 0) +
      (cardBranchIncomes._sum.amount || 0)
    const cardExpense =
      (cardDoctorExpenses._sum.amount || 0) +
      (cardBranchExpenses._sum.amount || 0)
    currentCardBalance = currentCardBalance + cardIncome - cardExpense

    const transferIncome =
      (transferPatientIncomes._sum.amount || 0) +
      (transferBranchIncomes._sum.amount || 0)
    const transferExpense =
      (transferDoctorExpenses._sum.amount || 0) +
      (transferBranchExpenses._sum.amount || 0)
    currentTransferBalance =
      currentTransferBalance + transferIncome - transferExpense

    const totalIncome = cashIncome + cardIncome + transferIncome
    const totalExpense = cashExpense + cardExpense + transferExpense
    const totalBalance =
      currentCashBalance + currentCardBalance + currentTransferBalance

    await db.cashReport.create({
      data: {
        branchId,
        cashIncome,
        cashExpense,
        cashBalance: currentCashBalance,
        cardIncome,
        cardExpense,
        cardBalance: currentCardBalance,
        transferIncome,
        transferExpense,
        transferBalance: currentTransferBalance,
        totalIncome,
        totalExpense,
        totalBalance,
        createdAt: setHours(date, 18),
      },
    })
  }
}
