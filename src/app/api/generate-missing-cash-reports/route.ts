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

    // Şube kontrolü
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

    // Tüm şubeleri al
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

    // Her şube için işlem yap
    for (const branch of branches) {
      // Bu şube için mevcut tüm kasa raporlarını sil
      const deletedRecords = await db.cashReport.deleteMany({
        where: { branchId: branch.id },
      })

      // Bu şube için en eski işlem tarihini bul
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

      // En eski tarihi bul
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

      // Tarih aralığındaki her günü oluştur
      const allDateRange = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })

      // Bu şube için oluşturulan rapor sonuçlarını tut
      const branchResults = []
      let currentCashBalance = 0
      let currentCardBalance = 0
      let currentTransferBalance = 0

      // Her gün için rapor oluştur
      for (const date of allDateRange.sort(
        (a, b) => a.getTime() - b.getTime()
      )) {
        // Günlük gelir ve giderleri hesapla
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

        // Bakiyeleri hesapla
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

        // Raporu oluştur
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
            createdAt: setHours(date, 18), // Günü saat 18:00 olarak ayarla
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
      results,
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
