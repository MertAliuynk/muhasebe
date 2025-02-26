import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import {
  getDoctorByIdSchema,
  getDoctorByUsernameSchema,
  getDoctorFinancialDataSchema,
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
      const doctor = await ctx.db.doctor.findFirst({
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

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
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
})
