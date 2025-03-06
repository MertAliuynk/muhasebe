import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import {
  deleteDoctorSchema,
  getDoctorByIdSchema,
  getDoctorExpensesSchema,
  getDoctorFinancialDataSchema,
  getDoctorIncomesSchema,
  getDoctorPendingPaymentsSchema,
  updateDoctorSchema,
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
      const doctor = await ctx.db.doctor.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
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
        isDeleted: false,
      },
      include: {
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

      const totalCommission =
        doctorIncomes.reduce((acc, income) => {
          const commissionAmount = (income.amount * income.commission) / 100
          return acc + commissionAmount
        }, 0) - (totalExpense._sum.amount || 0)

      const pendingPayments = await ctx.db.doctorPaymentShare.aggregate({
        where: {
          doctorId: doctor.id,
          remainingAmount: { gt: 0 },
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
        include: {
          payment: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })

      const incomesWithPatients = incomes.map((income) => {
        return {
          id: income.id,
          amount: income.amount,
          paymentDate: income.paymentDate,
          paymentType: income.paymentType,
          patientId: income.payment?.patient?.id || null,
          patientName: income.payment?.patient?.name || "Bilinmeyen Hasta",
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
      if (!input.doctorId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doktor bulunamadı",
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

      const pendingPayments = await ctx.db.doctorPaymentShare.findMany({
        where: {
          doctorId: input.doctorId,
          remainingAmount: { gt: 0 },
        },
        include: {
          paymentPlan: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  doctors: true,
                },
              },
              installments: {
                where: {
                  isCompleted: false,
                  ...(Object.keys(dateFilter).length > 0 && {
                    dueDate: dateFilter,
                  }),
                },
                orderBy: {
                  dueDate: "asc",
                },
              },
            },
          },
        },
      })

      const formattedPayments = await Promise.all(
        pendingPayments.map(async (payment) => {
          const totalAmount = payment.totalAmount
          const paidAmount = payment.paidAmount
          const remainingAmount = payment.remainingAmount
          const doctorCount = payment.paymentPlan.patient.doctors.length

          // Kalan taksitleri al
          const remainingInstallments = payment.paymentPlan.installments

          // Her taksit için doktorun alacağı tutarı hesapla
          const monthlyPayments = remainingInstallments.map((installment) => {
            const installmentAmount = installment.amount

            // Eğer hastanın tek doktoru varsa, tüm ödemeyi o doktor alır
            if (doctorCount === 1) {
              return {
                date: installment.dueDate,
                amount: installmentAmount,
              }
            }

            // Birden fazla doktor varsa, pay oranlarına göre hesapla
            const doctorSharePercentage =
              (payment.totalAmount / payment.paymentPlan.totalAmount) * 100
            const doctorShare = Math.ceil(
              (installmentAmount * doctorSharePercentage) / 100
            )

            return {
              date: installment.dueDate,
              amount: doctorShare,
            }
          })

          // Aylık ödemeleri grupla
          const monthlyPaymentGroups = monthlyPayments.reduce(
            (acc, curr) => {
              const monthKey = format(new Date(curr.date), "MMMM yyyy", {
                locale: tr,
              })
              if (!acc[monthKey]) {
                acc[monthKey] = {
                  month: monthKey,
                  amount: 0,
                  count: 0,
                }
              }
              acc[monthKey].amount += curr.amount
              acc[monthKey].count += 1
              return acc
            },
            {} as Record<
              string,
              { month: string; amount: number; count: number }
            >
          )

          // Aylık ortalama ödeme tutarını hesapla
          const averageMonthlyPayment =
            monthlyPayments.length > 0
              ? Math.ceil(
                  monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0) /
                    monthlyPayments.length
                )
              : 0

          // Sonraki ödeme tarihini bul
          const nextPaymentDate = monthlyPayments[0]?.date || null

          return {
            id: payment.id,
            patientName: payment.paymentPlan.patient.name,
            totalAmount,
            paidAmount,
            remainingAmount,
            installmentCount: remainingInstallments.length,
            nextPaymentDate,
            doctorCount,
            averageMonthlyPayment,
            monthlyPayments: Object.values(monthlyPaymentGroups),
          }
        })
      )

      return formattedPayments
    }),
  updateDoctor: protectedProcedure
    .input(updateDoctorSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, imagePath, ...data } = input

      const doctor = await ctx.db.doctor.update({
        where: { id },
        data: {
          ...data,
        },
      })

      if (imagePath) {
        await ctx.db.user.update({
          where: { id: doctor.userId },
          data: {
            imagePath,
          },
        })
      }

      return doctor
    }),
  deleteDoctor: protectedProcedure
    .input(deleteDoctorSchema)
    .mutation(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
        },
      })

      return doctor
    }),
})
