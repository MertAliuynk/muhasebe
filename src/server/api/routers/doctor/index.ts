import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  getDoctorByIdSchema,
  getDoctorByUsernameSchema,
  getDoctorExpensesSchema,
  getDoctorFinancialDataSchema,
  getDoctorIncomesSchema,
} from "./schema"

export const doctorRouter = createTRPCRouter({
  getDoctorsAdmin: adminProcedure.query(async ({ ctx }) => {
    const doctors = await ctx.db.doctor.findMany({
      include: {
        branch: {
          select: {
            name: true,
          },
        },
        patients: {
          select: {
            _count: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            imagePath: true,
            username: true,
          },
        },
      },
    })

    return doctors
  }),
  getDoctorByUsername: protectedProcedure
    .input(getDoctorByUsernameSchema)
    .query(async ({ ctx, input }) => {
      const { username } = input

      const doctor = await ctx.db.doctor.findFirst({
        where: {
          user: {
            username,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imagePath: true,
            },
          },
        },
      })

      return doctor
    }),
  getDoctorById: protectedProcedure
    .input(getDoctorByIdSchema)
    .query(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imagePath: true,
            },
          },
        },
      })

      return doctor
    }),
  getDoctorsByBranch: protectedProcedure.query(async ({ ctx }) => {
    const branchId = ctx.session.user.branchId

    if (!branchId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      })
    }

    const doctors = await ctx.db.doctor.findMany({
      where: {
        branchId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imagePath: true,
          },
        },
      },
    })

    return doctors
  }),
  getDoctorFinancialData: protectedProcedure
    .input(getDoctorFinancialDataSchema)
    .query(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hekim bulunamadı",
        })
      }

      // Tarih aralığı filtresi için koşulları oluştur
      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        // Eğer endDate yoksa ve sadece startDate varsa, o günün sonuna kadar filtrele
        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        // Bitiş tarihini günün sonuna ayarla (23:59:59)
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

      // Toplam Gelir: DoctorIncome modelindeki doktora ait tüm gelirler
      const totalIncome = await ctx.db.doctorIncome.aggregate({
        where: {
          doctorId: doctor.id,
          ...(Object.keys(dateFilter).length > 0 && {
            paymentDate: dateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      })

      // Toplam Gider: DoctorExpense modelindeki doktora ait tüm giderler
      const totalExpense = await ctx.db.doctorExpense.aggregate({
        where: {
          doctorId: doctor.id,
          isDeleted: false,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      })

      // Hakediş: DoctorIncome modelinde doktorun gelirini komisyon oranına göre hesaplanmış hali
      const doctorIncomes = await ctx.db.doctorIncome.findMany({
        where: {
          doctorId: doctor.id,
          ...(Object.keys(dateFilter).length > 0 && {
            paymentDate: dateFilter,
          }),
        },
        select: {
          amount: true,
          commission: true,
        },
      })

      const totalCommission = doctorIncomes.reduce((acc, income) => {
        // Her gelir için komisyon oranına göre hesaplama
        const commissionAmount = (income.amount * income.commission) / 100
        return acc + commissionAmount
      }, 0)

      // Bekleyen Ödemeler: Doktorun hastalarının onaylanmış planlarındaki totalAmount'tan hesapla
      const pendingPayments = await ctx.db.patientPaymentPlan.aggregate({
        where: {
          patient: {
            doctors: {
              some: {
                id: doctor.id,
              },
            },
          },
          isApproved: true,
          isCompleted: false,
          isDeleted: false,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        _sum: {
          remainingAmount: true,
        },
      })

      return {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        totalCommission,
        pendingPayments: pendingPayments._sum.remainingAmount || 0,
      }
    }),
  getDoctorIncomes: protectedProcedure
    .input(getDoctorIncomesSchema)
    .query(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hekim bulunamadı",
        })
      }

      // Tarih aralığı filtresi için koşulları oluştur
      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        // Eğer endDate yoksa ve sadece startDate varsa, o günün sonuna kadar filtrele
        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        // Bitiş tarihini günün sonuna ayarla (23:59:59)
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

      // Doktorun gelirleri
      const incomes = await ctx.db.doctorIncome.findMany({
        where: {
          doctorId: doctor.id,
          ...(Object.keys(dateFilter).length > 0 && {
            paymentDate: dateFilter,
          }),
        },
        orderBy: {
          paymentDate: "desc",
        },
      })

      // Doktorun gelirlerine karşılık gelen hasta ödemeleri
      const patientPayments = await ctx.db.patientPayment.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && {
            paymentDate: dateFilter,
          }),
          patient: {
            doctors: {
              some: {
                id: doctor.id,
              },
            },
          },
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })

      // Gelirleri hasta bilgileriyle eşleştir
      const incomesWithPatients = incomes.map((income) => {
        // Aynı tarih ve tutara sahip hasta ödemesini bul
        const matchingPayment = patientPayments.find(
          (payment) =>
            payment.amount === income.amount &&
            payment.paymentType === income.paymentType &&
            Math.abs(
              payment.paymentDate.getTime() - income.paymentDate.getTime()
            ) < 60000 // 1 dakika içinde
        )

        return {
          id: income.id,
          amount: income.amount,
          paymentDate: income.paymentDate,
          paymentType: income.paymentType,
          note: income.note,
          patientId: matchingPayment?.patient?.id || null,
          patientName: matchingPayment?.patient?.name || "Bilinmeyen Hasta",
        }
      })

      return incomesWithPatients
    }),
  getDoctorExpenses: protectedProcedure
    .input(getDoctorExpensesSchema)
    .query(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hekim bulunamadı",
        })
      }

      // Tarih aralığı filtresi için koşulları oluştur
      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        // Eğer endDate yoksa ve sadece startDate varsa, o günün sonuna kadar filtrele
        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        // Bitiş tarihini günün sonuna ayarla (23:59:59)
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

      // Doktorun giderleri
      const expenses = await ctx.db.doctorExpense.findMany({
        where: {
          doctorId: doctor.id,
          isDeleted: false,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        include: {
          expenseType: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return expenses.map((expense) => ({
        id: expense.id,
        expenseType: expense.expenseType.name,
        amount: expense.amount,
        date: expense.createdAt,
        description: expense.description,
      }))
    }),
})
