import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  getDoctorByIdSchema,
  getDoctorExpensesSchema,
  getDoctorFinancialDataSchema,
  getDoctorIncomesSchema,
  getDoctorPendingPaymentsSchema,
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

      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

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
        const commissionAmount = (income.amount * income.commission) / 100
        return acc + commissionAmount
      }, 0)

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

      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

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

      const incomesWithPatients = incomes.map((income) => {
        const matchingPayment = patientPayments.find(
          (payment) =>
            payment.amount === income.amount &&
            payment.paymentType === income.paymentType &&
            Math.abs(
              payment.paymentDate.getTime() - income.paymentDate.getTime()
            ) < 60000
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

      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

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
  getDoctorPendingPayments: protectedProcedure
    .input(getDoctorPendingPaymentsSchema)
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

      const dateFilter: { gte?: Date; lte?: Date } = {}

      if (input.startDate) {
        const startDate = new Date(input.startDate)
        dateFilter.gte = startDate

        if (!input.endDate) {
          const endOfDay = new Date(startDate)
          endOfDay.setHours(23, 59, 59, 999)
          dateFilter.lte = endOfDay
        }
      }

      if (input.endDate) {
        const endDate = new Date(input.endDate)
        endDate.setHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

      const pendingPayments = await ctx.db.patientPaymentPlan.findMany({
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
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          installments: {
            orderBy: {
              dueDate: "asc",
            },
            where: {
              isCompleted: false,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return pendingPayments.map((payment) => {
        const installments = payment.installments || []
        const nextPaymentDate =
          installments.length > 0 ? installments[0]?.dueDate : null

        return {
          id: payment.id,
          patientId: payment.patientId,
          patientName: payment.patient?.name ?? "Bilinmeyen Hasta",
          patientPhone: payment.patient?.phone ?? "",
          totalAmount: payment.totalAmount,
          paidAmount: payment.paidAmount,
          remainingAmount: payment.remainingAmount,
          installmentCount: payment.installmentCount,
          createdAt: payment.createdAt,
          startDate: payment.startDate,
          nextPaymentDate,
        }
      })
    }),
})
