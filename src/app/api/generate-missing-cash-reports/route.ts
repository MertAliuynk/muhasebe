import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/server/db"
import { PaymentType, type Prisma } from "@prisma/client"
import {
  addDays,
  eachDayOfInterval,
  format,
  setHours,
  startOfDay,
} from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branchId")

    let branchQuery: Prisma.BranchWhereInput = {}
    if (branchId) {
      const branch = await db.branch.findUnique({
        where: { id: branchId },
      })

      if (!branch) {
        return NextResponse.json(
          { success: false, error: "Belirtilen şube bulunamadı" },
          { status: 404 }
        )
      }

      branchQuery = { id: branchId }
    } else {
      branchQuery = { isDeleted: false }
    }

    const branches = await db.branch.findMany({
      where: branchQuery,
      select: { id: true, name: true },
    })

    if (branches.length === 0) {
      return NextResponse.json({
        success: false,
        message: "İşlem yapılacak şube bulunamadı",
      })
    }

    const results = []

    for (const branch of branches) {
      const deletedRecords = await db.cashReport.deleteMany({
        where: { branchId: branch.id },
      })

      const [
        oldestPatientPayment,
        oldestBranchPayment,
        oldestDoctorExpense,
        oldestBranchExpense,
      ] = await Promise.all([
        db.patientPayment.findFirst({
          where: { branchId: branch.id },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
        db.branchPayment.findFirst({
          where: { branchId: branch.id },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
        db.doctorExpense.findFirst({
          where: { branchId: branch.id, isDeleted: false },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
        db.branchExpense.findFirst({
          where: { branchId: branch.id, isDeleted: false },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
      ])

      const allDates = [
        oldestPatientPayment?.createdAt,
        oldestBranchPayment?.createdAt,
        oldestDoctorExpense?.createdAt,
        oldestBranchExpense?.createdAt,
      ].filter(Boolean) as Date[]

      if (allDates.length === 0) {
        results.push({
          branchId: branch.id,
          branchName: branch.name,
          message: "Şubede hiç işlem bulunamadı",
          deletedReports: deletedRecords.count,
          generatedReports: 0,
        })
        continue
      }

      const startDate = startOfDay(
        allDates.reduce((oldest, current) =>
          current < oldest ? current : oldest
        )
      )
      const endDate = startOfDay(new Date())

      const allDateRange = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })

      const branchResults = []
      let currentCashBalance = 0
      let currentCardBalance = 0
      let currentTransferBalance = 0

      for (const date of allDateRange.sort(
        (a, b) => a.getTime() - b.getTime()
      )) {
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
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              isDeleted: false,
              createdAt: {
                gte: startOfDay(date),
                lt: startOfDay(addDays(date, 1)),
              },
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
        const cashBalance = currentCashBalance

        const cardIncome =
          (cardPatientIncomes._sum.amount || 0) +
          (cardBranchIncomes._sum.amount || 0)
        const cardExpense =
          (cardDoctorExpenses._sum.amount || 0) +
          (cardBranchExpenses._sum.amount || 0)

        currentCardBalance = currentCardBalance + cardIncome - cardExpense
        const cardBalance = currentCardBalance

        const transferIncome =
          (transferPatientIncomes._sum.amount || 0) +
          (transferBranchIncomes._sum.amount || 0)
        const transferExpense =
          (transferDoctorExpenses._sum.amount || 0) +
          (transferBranchExpenses._sum.amount || 0)

        currentTransferBalance =
          currentTransferBalance + transferIncome - transferExpense
        const transferBalance = currentTransferBalance

        const totalIncome = cashIncome + cardIncome + transferIncome
        const totalExpense = cashExpense + cardExpense + transferExpense
        const totalBalance = cashBalance + cardBalance + transferBalance

        const createdReport = await db.cashReport.create({
          data: {
            branchId: branch.id,
            cashIncome,
            cashExpense,
            cashBalance,
            cardIncome,
            cardExpense,
            cardBalance,
            transferIncome,
            transferExpense,
            transferBalance,
            totalIncome,
            totalExpense,
            totalBalance,
            createdAt: setHours(date, 18),
          },
        })

        branchResults.push({
          date: format(date, "yyyy-MM-dd"),
          reportId: createdReport.id,
          cashBalance,
          cardBalance,
          transferBalance,
          totalBalance,
        })
      }

      results.push({
        branchId: branch.id,
        branchName: branch.name,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        deletedReports: deletedRecords.count,
        generatedReports: branchResults.length,
        reports: branchResults,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Kasa raporları yeniden oluşturuldu.",
    })
  } catch (error) {
    console.error("Kasa raporlarını yeniden oluşturma hatası:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Kasa raporları yeniden oluşturulurken bir hata oluştu: ${(error as Error).message}`,
      },
      { status: 500 }
    )
  }
}
