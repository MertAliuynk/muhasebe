import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { PaymentType, type Prisma } from "@prisma/client"
import {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  setHours,
  startOfDay,
  subDays,
} from "date-fns"

export async function GET(req: Request) {
  try {
    // URL'den parametreleri al
    const url = new URL(req.url)
    const startDateParam = url.searchParams.get("startDate")
    const endDateParam = url.searchParams.get("endDate")
    const branchIdParam = url.searchParams.get("branchId")

    // Tarih parametreleri için varsayılan değerleri ayarla
    let startDate = startDateParam
      ? new Date(startDateParam)
      : subDays(new Date(), 40)
    let endDate = endDateParam ? new Date(endDateParam) : new Date()

    // Günün başlangıcına ayarla
    startDate = startOfDay(startDate)
    endDate = startOfDay(endDate)

    // Şubeler için sorgu hazırla
    const branchQuery: Prisma.BranchWhereInput = branchIdParam
      ? { id: branchIdParam }
      : { isDeleted: false }

    // Tüm aktif şubeleri al
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
      // Bu şube için mevcut raporları al
      const existingReports = await db.cashReport.findMany({
        where: {
          branchId: branch.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      // Tarih aralığındaki her günü oluştur
      const allDates = eachDayOfInterval({ start: startDate, end: endDate })

      // Mevcut raporların tarihlerini ayıkla
      const existingDates = existingReports.map((report) =>
        startOfDay(new Date(report.createdAt))
      )

      // Eksik tarihleri bul
      const missingDates = allDates.filter(
        (date) =>
          !existingDates.some(
            (existingDate) =>
              format(existingDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          )
      )

      if (missingDates.length === 0) {
        results.push({
          branchId: branch.id,
          branchName: branch.name,
          message: "Eksik rapor bulunmadı",
          generatedReports: 0,
        })
        continue
      }

      // Bu şube için oluşturulan rapor sonuçlarını tut
      const branchResults = []

      // Her eksik tarih için rapor oluştur
      for (const missingDate of missingDates.sort(
        (a, b) => a.getTime() - b.getTime()
      )) {
        // Bir önceki tarihin raporunu bul
        const previousReport = await db.cashReport.findFirst({
          where: {
            branchId: branch.id,
            createdAt: {
              lt: missingDate,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        // Eksik gün için gelir ve giderleri hesapla
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
        const previousCashBalance = previousReport?.cashBalance || 0
        const cashBalance = previousCashBalance + cashIncome - cashExpense

        const cardIncome =
          (cardPatientIncomes._sum.amount || 0) +
          (cardBranchIncomes._sum.amount || 0)
        const cardExpense =
          (cardDoctorExpenses._sum.amount || 0) +
          (cardBranchExpenses._sum.amount || 0)
        const previousCardBalance = previousReport?.cardBalance || 0
        const cardBalance = previousCardBalance + cardIncome - cardExpense

        const transferIncome =
          (transferPatientIncomes._sum.amount || 0) +
          (transferBranchIncomes._sum.amount || 0)
        const transferExpense =
          (transferDoctorExpenses._sum.amount || 0) +
          (transferBranchExpenses._sum.amount || 0)
        const previousTransferBalance = previousReport?.transferBalance || 0
        const transferBalance =
          previousTransferBalance + transferIncome - transferExpense

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
            createdAt: setHours(missingDate, 18), // Eksik gün için tarihi saat 18:00 olarak ayarla
          },
        })

        branchResults.push({
          date: format(missingDate, "yyyy-MM-dd"),
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
        generatedReports: branchResults.length,
        reports: branchResults,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Eksik kasa raporları oluşturuldu.",
      results,
    })
  } catch (error) {
    console.error("Eksik kasa raporlarını oluşturma hatası:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Eksik kasa raporları oluşturulurken bir hata oluştu: ${(error as Error).message}`,
      },
      { status: 500 }
    )
  }
}

// Belirli bir tarih aralığındaki tüm eksik raporları oluşturmak için POST
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { startDate, endDate, branchId } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Başlangıç ve bitiş tarihleri gereklidir" },
        { status: 400 }
      )
    }

    const parsedStartDate = startOfDay(new Date(startDate))
    const parsedEndDate = startOfDay(new Date(endDate))

    // Tarih kontrolü
    if (isAfter(parsedStartDate, parsedEndDate)) {
      return NextResponse.json(
        {
          success: false,
          error: "Başlangıç tarihi bitiş tarihinden sonra olamaz",
        },
        { status: 400 }
      )
    }

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
      // Bu şube için mevcut raporları al
      const existingReports = await db.cashReport.findMany({
        where: {
          branchId: branch.id,
          createdAt: {
            gte: parsedStartDate,
            lte: parsedEndDate,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      // Tarih aralığındaki her günü oluştur
      const allDates = eachDayOfInterval({
        start: parsedStartDate,
        end: parsedEndDate,
      })

      // Mevcut raporların tarihlerini ayıkla
      const existingDates = existingReports.map((report) =>
        startOfDay(new Date(report.createdAt))
      )

      // Eksik tarihleri bul
      const missingDates = allDates.filter(
        (date) =>
          !existingDates.some(
            (existingDate) =>
              format(existingDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          )
      )

      if (missingDates.length === 0) {
        results.push({
          branchId: branch.id,
          branchName: branch.name,
          message: "Eksik rapor bulunmadı",
          generatedReports: 0,
        })
        continue
      }

      // Bu şube için oluşturulan rapor sonuçlarını tut
      const branchResults = []

      // Her eksik tarih için rapor oluştur
      for (const missingDate of missingDates.sort(
        (a, b) => a.getTime() - b.getTime()
      )) {
        // Bir önceki tarihin raporunu bul
        const previousReport = await db.cashReport.findFirst({
          where: {
            branchId: branch.id,
            createdAt: {
              lt: missingDate,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        // Eksik gün için gelir ve giderleri hesapla
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CASH,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.CREDIT_CARD,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
              },
            },
            _sum: { amount: true },
          }),
          db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              paymentType: PaymentType.BANK_TRANSFER,
              createdAt: {
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
                gte: startOfDay(missingDate),
                lt: startOfDay(addDays(missingDate, 1)),
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
        const previousCashBalance = previousReport?.cashBalance || 0
        const cashBalance = previousCashBalance + cashIncome - cashExpense

        const cardIncome =
          (cardPatientIncomes._sum.amount || 0) +
          (cardBranchIncomes._sum.amount || 0)
        const cardExpense =
          (cardDoctorExpenses._sum.amount || 0) +
          (cardBranchExpenses._sum.amount || 0)
        const previousCardBalance = previousReport?.cardBalance || 0
        const cardBalance = previousCardBalance + cardIncome - cardExpense

        const transferIncome =
          (transferPatientIncomes._sum.amount || 0) +
          (transferBranchIncomes._sum.amount || 0)
        const transferExpense =
          (transferDoctorExpenses._sum.amount || 0) +
          (transferBranchExpenses._sum.amount || 0)
        const previousTransferBalance = previousReport?.transferBalance || 0
        const transferBalance =
          previousTransferBalance + transferIncome - transferExpense

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
            createdAt: setHours(missingDate, 18), // Eksik gün için tarihi saat 18:00 olarak ayarla
          },
        })

        branchResults.push({
          date: format(missingDate, "yyyy-MM-dd"),
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
        generatedReports: branchResults.length,
        reports: branchResults,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Eksik kasa raporları oluşturuldu.",
      results,
    })
  } catch (error) {
    console.error("Eksik kasa raporlarını oluşturma hatası:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Eksik kasa raporları oluşturulurken bir hata oluştu: ${(error as Error).message}`,
      },
      { status: 500 }
    )
  }
}
