import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { getIncomesSchema, exportIncomesSchema } from "./schema"
import { type Prisma } from "@prisma/client"

export const incomeRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(getIncomesSchema)
    .query(async ({ ctx, input }) => {
      const {
        branchId,
        doctorId,
        startDate,
        endDate,
        type,
        incomeType,
        expenseType,
        paymentType,
        page,
        limit,
        sortBy,
        sortOrder,
      } = input

      const skip = (page - 1) * limit

      // Tarih filtreleri
      const dateFilters: Record<string, Date> = {}
      if (startDate) {
        dateFilters.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilters.lte = end
      }

      // Ödeme tipi filtresi
      const paymentTypeFilter = paymentType ? { paymentType } : {}

      let totalIncome = 0
      let totalExpense = 0
      type IncomeItem = {
        id: string
        type: "patient" | "branch" | "doctorExpense" | "branchExpense"
        transactionType: "income" | "expense"
        amount: number
        paymentType: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER"
        date: Date
        patientName?: string
        doctorName?: string
        branchName: string
        note?: string | null
        description?: string | null
        expenseTypeName?: string
        totalPlanAmount?: number
        remainingAmount?: number
        createdAt: Date
      }
      let items: IncomeItem[] = []
      let totalCount = 0

      // GELİRLER
      if (type === "all" || type === "income") {
        // Hasta ödemeleri
        if (!incomeType || incomeType === "patient") {
          const patientPaymentWhere: Prisma.PatientPaymentWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
          }

          const [patientPayments, patientPaymentCount] = await Promise.all([
            ctx.db.patientPayment.findMany({
              where: patientPaymentWhere,
              include: {
                patient: {
                  select: {
                    name: true,
                  },
                },
                branch: {
                  select: {
                    name: true,
                  },
                },
                paymentPlan: {
                  select: {
                    totalAmount: true,
                    remainingAmount: true,
                  },
                },
              },
              ...(type === "income" && incomeType === "patient" ? { skip, take: limit } : {}),
              orderBy:
                sortBy === "date"
                  ? { createdAt: sortOrder }
                  : { amount: sortOrder },
            }),
            ctx.db.patientPayment.count({ where: patientPaymentWhere }),
          ])

          const mappedPatientPayments = patientPayments.map((payment) => ({
            id: payment.id,
            type: "patient" as const,
            transactionType: "income" as const,
            amount: payment.amount,
            paymentType: payment.paymentType,
            date: payment.createdAt,
            patientName: payment.patient?.name || "Bilinmiyor",
            branchName: payment.branch.name,
            note: payment.note,
            totalPlanAmount: payment.paymentPlan?.totalAmount,
            remainingAmount: payment.paymentPlan?.remainingAmount,
            createdAt: payment.createdAt,
          }))

          if (type === "income" && incomeType === "patient") {
            items = mappedPatientPayments
            totalCount = patientPaymentCount
          } else {
            items = [...items, ...mappedPatientPayments]
            if (type === "income") totalCount += patientPaymentCount
          }

          const patientPaymentSum = await ctx.db.patientPayment.aggregate({
            where: patientPaymentWhere,
            _sum: {
              amount: true,
            },
          })
          totalIncome += patientPaymentSum._sum.amount || 0
        }

        // Şube ödemeleri
        if (!incomeType || incomeType === "branch") {
          const branchPaymentWhere: Prisma.BranchPaymentWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              paymentDate: dateFilters,
            }),
            ...paymentTypeFilter,
          }

          const [branchPayments, branchPaymentCount] = await Promise.all([
            ctx.db.branchPayment.findMany({
              where: branchPaymentWhere,
              include: {
                branch: {
                  select: {
                    name: true,
                  },
                },
              },
              ...(type === "income" && incomeType === "branch" ? { skip, take: limit } : {}),
              orderBy:
                sortBy === "date"
                  ? { paymentDate: sortOrder }
                  : { amount: sortOrder },
            }),
            ctx.db.branchPayment.count({ where: branchPaymentWhere }),
          ])

          const mappedBranchPayments = branchPayments.map((payment) => ({
            id: payment.id,
            type: "branch" as const,
            transactionType: "income" as const,
            amount: payment.amount,
            paymentType: payment.paymentType,
            date: payment.paymentDate,
            branchName: payment.branch.name,
            note: payment.note,
            createdAt: payment.createdAt,
          }))

          if (type === "income" && incomeType === "branch") {
            items = mappedBranchPayments
            totalCount = branchPaymentCount
          } else {
            items = [...items, ...mappedBranchPayments]
            if (type === "income") totalCount += branchPaymentCount
          }

          const branchPaymentSum = await ctx.db.branchPayment.aggregate({
            where: branchPaymentWhere,
            _sum: {
              amount: true,
            },
          })
          totalIncome += branchPaymentSum._sum.amount || 0
        }
      }

      // GİDERLER
      if (type === "all" || type === "expense") {
        // Doktor giderleri
        if (!expenseType || expenseType === "doctor") {
          const doctorExpenseWhere: Prisma.DoctorExpenseWhereInput = {
            ...(branchId && { branchId }),
            ...(doctorId && { doctorId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
            isDeleted: false,
          }

          const [doctorExpenses, doctorExpenseCount] = await Promise.all([
            ctx.db.doctorExpense.findMany({
              where: doctorExpenseWhere,
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                branch: {
                  select: {
                    name: true,
                  },
                },
                expenseType: {
                  select: {
                    name: true,
                  },
                },
              },
              ...(type === "expense" && expenseType === "doctor" ? { skip, take: limit } : {}),
              orderBy:
                sortBy === "date"
                  ? { createdAt: sortOrder }
                  : { amount: sortOrder },
            }),
            ctx.db.doctorExpense.count({ where: doctorExpenseWhere }),
          ])

          const mappedDoctorExpenses = doctorExpenses.map((expense) => ({
            id: expense.id,
            type: "doctorExpense" as const,
            transactionType: "expense" as const,
            amount: expense.amount,
            paymentType: expense.paymentType,
            date: expense.createdAt,
            doctorName: expense.doctor.user.name,
            branchName: expense.branch.name,
            expenseTypeName: expense.expenseType.name,
            description: expense.description,
            createdAt: expense.createdAt,
          }))

          if (type === "expense" && expenseType === "doctor") {
            items = mappedDoctorExpenses
            totalCount = doctorExpenseCount
          } else {
            items = [...items, ...mappedDoctorExpenses]
            if (type === "expense") totalCount += doctorExpenseCount
          }

          const doctorExpenseSum = await ctx.db.doctorExpense.aggregate({
            where: doctorExpenseWhere,
            _sum: {
              amount: true,
            },
          })
          totalExpense += doctorExpenseSum._sum.amount || 0
        }

        // Şube giderleri
        if (!expenseType || expenseType === "branch") {
          const branchExpenseWhere: Prisma.BranchExpenseWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
            isDeleted: false,
          }

          const [branchExpenses, branchExpenseCount] = await Promise.all([
            ctx.db.branchExpense.findMany({
              where: branchExpenseWhere,
              include: {
                branch: {
                  select: {
                    name: true,
                  },
                },
                expenseType: {
                  select: {
                    name: true,
                  },
                },
              },
              ...(type === "expense" && expenseType === "branch" ? { skip, take: limit } : {}),
              orderBy:
                sortBy === "date"
                  ? { createdAt: sortOrder }
                  : { amount: sortOrder },
            }),
            ctx.db.branchExpense.count({ where: branchExpenseWhere }),
          ])

          const mappedBranchExpenses = branchExpenses.map((expense) => ({
            id: expense.id,
            type: "branchExpense" as const,
            transactionType: "expense" as const,
            amount: expense.amount,
            paymentType: expense.paymentType,
            date: expense.createdAt,
            branchName: expense.branch.name,
            expenseTypeName: expense.expenseType.name,
            description: expense.description,
            createdAt: expense.createdAt,
          }))

          if (type === "expense" && expenseType === "branch") {
            items = mappedBranchExpenses
            totalCount = branchExpenseCount
          } else {
            items = [...items, ...mappedBranchExpenses]
            if (type === "expense") totalCount += branchExpenseCount
          }

          const branchExpenseSum = await ctx.db.branchExpense.aggregate({
            where: branchExpenseWhere,
            _sum: {
              amount: true,
            },
          })
          totalExpense += branchExpenseSum._sum.amount || 0
        }
      }

      // Tüm öğeleri tarih bazında sırala ve sayfalama yap
      if (type === "all") {
        // Önce tüm öğeleri birleştir ve sırala
        items.sort((a, b) => {
          if (sortBy === "date") {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB
          } else {
            const amountA = a.amount
            const amountB = b.amount
            return sortOrder === "desc" ? amountB - amountA : amountA - amountB
          }
        })

        // Sayfalama için toplam sayıyı belirle
        totalCount = items.length

        // Sayfalama uygula
        items = items.slice(skip, skip + limit)
      }

      // Özet istatistikler
      const stats = {
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        totalCount,
        averageIncome: totalIncome > 0 && totalCount > 0 ? totalIncome / totalCount : 0,
        averageExpense: totalExpense > 0 && totalCount > 0 ? totalExpense / totalCount : 0,
        byPaymentType: await getPaymentTypeStats(
          ctx,
          branchId ?? null,
          dateFilters,
          type,
          incomeType ?? null,
          expenseType ?? null
        ),
        byBranch: await getBranchStats(ctx, dateFilters, type, incomeType ?? null, expenseType ?? null),
      }

      return {
        incomes: items,
        stats,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      }
    }),

  export: protectedProcedure
    .input(exportIncomesSchema)
    .query(async ({ ctx, input }) => {
      const { 
        branchId, 
        doctorId, 
        startDate, 
        endDate, 
        type, 
        incomeType, 
        expenseType, 
        paymentType 
      } = input

      // Tarih filtreleri
      const dateFilters: Record<string, Date> = {}
      if (startDate) {
        dateFilters.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilters.lte = end
      }

      // Ödeme tipi filtresi
      const paymentTypeFilter = paymentType ? { paymentType } : {}

      type IncomeItem = {
        id: string
        type: "patient" | "branch" | "doctorExpense" | "branchExpense"
        transactionType: "income" | "expense"
        amount: number
        paymentType: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER"
        date: Date
        patientName?: string
        doctorName?: string
        branchName: string
        note?: string | null
        description?: string | null
        expenseTypeName?: string
        totalPlanAmount?: number
        remainingAmount?: number
        createdAt: Date
      }
      let items: IncomeItem[] = []

      // GELİRLER
      if (type === "all" || type === "income") {
        // Hasta ödemeleri
        if (!incomeType || incomeType === "patient") {
          const patientPaymentWhere: Prisma.PatientPaymentWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
          }

          const patientPayments = await ctx.db.patientPayment.findMany({
            where: patientPaymentWhere,
            include: {
              patient: {
                select: {
                  name: true,
                },
              },
              branch: {
                select: {
                  name: true,
                },
              },
              paymentPlan: {
                select: {
                  totalAmount: true,
                  remainingAmount: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })

          const mappedPatientPayments = patientPayments.map((payment) => ({
            id: payment.id,
            type: "patient" as const,
            transactionType: "income" as const,
            amount: payment.amount,
            paymentType: payment.paymentType,
            date: payment.createdAt,
            patientName: payment.patient?.name || "Bilinmiyor",
            branchName: payment.branch.name,
            note: payment.note,
            createdAt: payment.createdAt,
          }))

          items = [...items, ...mappedPatientPayments]
        }

        // Şube ödemeleri
        if (!incomeType || incomeType === "branch") {
          const branchPaymentWhere: Prisma.BranchPaymentWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              paymentDate: dateFilters,
            }),
            ...paymentTypeFilter,
          }

          const branchPayments = await ctx.db.branchPayment.findMany({
            where: branchPaymentWhere,
            include: {
              branch: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { paymentDate: "desc" },
          })

          const mappedBranchPayments = branchPayments.map((payment) => ({
            id: payment.id,
            type: "branch" as const,
            transactionType: "income" as const,
            amount: payment.amount,
            paymentType: payment.paymentType,
            date: payment.paymentDate,
            branchName: payment.branch.name,
            note: payment.note,
            createdAt: payment.createdAt,
          }))

          items = [...items, ...mappedBranchPayments]
        }
      }

      // GİDERLER
      if (type === "all" || type === "expense") {
        // Doktor giderleri
        if (!expenseType || expenseType === "doctor") {
          const doctorExpenseWhere: Prisma.DoctorExpenseWhereInput = {
            ...(branchId && { branchId }),
            ...(doctorId && { doctorId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
            isDeleted: false,
          }

          const doctorExpenses = await ctx.db.doctorExpense.findMany({
            where: doctorExpenseWhere,
            include: {
              doctor: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              branch: {
                select: {
                  name: true,
                },
              },
              expenseType: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })

          const mappedDoctorExpenses = doctorExpenses.map((expense) => ({
            id: expense.id,
            type: "doctorExpense" as const,
            transactionType: "expense" as const,
            amount: expense.amount,
            paymentType: expense.paymentType,
            date: expense.createdAt,
            doctorName: expense.doctor.user.name,
            branchName: expense.branch.name,
            expenseTypeName: expense.expenseType.name,
            description: expense.description,
            createdAt: expense.createdAt,
          }))

          items = [...items, ...mappedDoctorExpenses]
        }

        // Şube giderleri
        if (!expenseType || expenseType === "branch") {
          const branchExpenseWhere: Prisma.BranchExpenseWhereInput = {
            ...(branchId && { branchId }),
            ...(Object.keys(dateFilters).length > 0 && {
              createdAt: dateFilters,
            }),
            ...paymentTypeFilter,
            isDeleted: false,
          }

          const branchExpenses = await ctx.db.branchExpense.findMany({
            where: branchExpenseWhere,
            include: {
              branch: {
                select: {
                  name: true,
                },
              },
              expenseType: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })

          const mappedBranchExpenses = branchExpenses.map((expense) => ({
            id: expense.id,
            type: "branchExpense" as const,
            transactionType: "expense" as const,
            amount: expense.amount,
            paymentType: expense.paymentType,
            date: expense.createdAt,
            branchName: expense.branch.name,
            expenseTypeName: expense.expenseType.name,
            description: expense.description,
            createdAt: expense.createdAt,
          }))

          items = [...items, ...mappedBranchExpenses]
        }
      }

      // Tüm gelirleri tarih bazında sırala
      items.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })

      return items
    }),
})

async function getPaymentTypeStats(
  ctx: { db: typeof import("@/server/db").db },
  branchId: string | null,
  dateFilters: Record<string, Date>,
  type: string,
  incomeType: string | null,
  expenseType: string | null
) {
  const stats: {
    income: Record<string, number>
    expense: Record<string, number>
  } = {
    income: {
      CASH: 0,
      CREDIT_CARD: 0,
      BANK_TRANSFER: 0,
    },
    expense: {
      CASH: 0,
      CREDIT_CARD: 0,
      BANK_TRANSFER: 0,
    },
  }

  // GELİR İSTATİSTİKLERİ
  if (type === "all" || type === "income") {
    if (!incomeType || incomeType === "patient") {
      const patientStats = await ctx.db.patientPayment.groupBy({
        by: ["paymentType"],
        where: {
          ...(branchId && { branchId }),
          ...(Object.keys(dateFilters).length > 0 && {
            createdAt: dateFilters,
          }),
        },
        _sum: {
          amount: true,
        },
      })

      patientStats.forEach((stat) => {
        if (stat._sum.amount) {
          stats.income[stat.paymentType] = (stats.income[stat.paymentType] || 0) + stat._sum.amount
        }
      })
    }

    if (!incomeType || incomeType === "branch") {
      const branchStats = await ctx.db.branchPayment.groupBy({
        by: ["paymentType"],
        where: {
          ...(branchId && { branchId }),
          ...(Object.keys(dateFilters).length > 0 && {
            paymentDate: dateFilters,
          }),
        },
        _sum: {
          amount: true,
        },
      })

      branchStats.forEach((stat) => {
        if (stat._sum.amount) {
          stats.income[stat.paymentType] = (stats.income[stat.paymentType] || 0) + stat._sum.amount
        }
      })
    }
  }

  // GİDER İSTATİSTİKLERİ
  if (type === "all" || type === "expense") {
    if (!expenseType || expenseType === "doctor") {
      const doctorExpenseStats = await ctx.db.doctorExpense.groupBy({
        by: ["paymentType"],
        where: {
          ...(branchId && { branchId }),
          ...(Object.keys(dateFilters).length > 0 && {
            createdAt: dateFilters,
          }),
          isDeleted: false,
        },
        _sum: {
          amount: true,
        },
      })

      doctorExpenseStats.forEach((stat) => {
        if (stat._sum.amount) {
          stats.expense[stat.paymentType] = (stats.expense[stat.paymentType] || 0) + stat._sum.amount
        }
      })
    }

    if (!expenseType || expenseType === "branch") {
      const branchExpenseStats = await ctx.db.branchExpense.groupBy({
        by: ["paymentType"],
        where: {
          ...(branchId && { branchId }),
          ...(Object.keys(dateFilters).length > 0 && {
            createdAt: dateFilters,
          }),
          isDeleted: false,
        },
        _sum: {
          amount: true,
        },
      })

      branchExpenseStats.forEach((stat) => {
        if (stat._sum.amount) {
          stats.expense[stat.paymentType] = (stats.expense[stat.paymentType] || 0) + stat._sum.amount
        }
      })
    }
  }

  return stats
}

async function getBranchStats(
  ctx: { db: typeof import("@/server/db").db },
  dateFilters: Record<string, Date>,
  type: string,
  incomeType: string | null,
  expenseType: string | null
) {
  const branches = await ctx.db.branch.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
    },
  })

  const branchStats = await Promise.all(
    branches.map(async (branch) => {
      let totalIncome = 0
      let totalExpense = 0

      // GELİRLER
      if (type === "all" || type === "income") {
        if (!incomeType || incomeType === "patient") {
          const patientIncome = await ctx.db.patientPayment.aggregate({
            where: {
              branchId: branch.id,
              ...(Object.keys(dateFilters).length > 0 && {
                createdAt: dateFilters,
              }),
            },
            _sum: {
              amount: true,
            },
          })
          totalIncome += patientIncome._sum.amount || 0
        }

        if (!incomeType || incomeType === "branch") {
          const branchIncome = await ctx.db.branchPayment.aggregate({
            where: {
              branchId: branch.id,
              ...(Object.keys(dateFilters).length > 0 && {
                paymentDate: dateFilters,
              }),
            },
            _sum: {
              amount: true,
            },
          })
          totalIncome += branchIncome._sum.amount || 0
        }
      }

      // GİDERLER
      if (type === "all" || type === "expense") {
        if (!expenseType || expenseType === "doctor") {
          const doctorExpense = await ctx.db.doctorExpense.aggregate({
            where: {
              branchId: branch.id,
              ...(Object.keys(dateFilters).length > 0 && {
                createdAt: dateFilters,
              }),
              isDeleted: false,
            },
            _sum: {
              amount: true,
            },
          })
          totalExpense += doctorExpense._sum.amount || 0
        }

        if (!expenseType || expenseType === "branch") {
          const branchExpense = await ctx.db.branchExpense.aggregate({
            where: {
              branchId: branch.id,
              ...(Object.keys(dateFilters).length > 0 && {
                createdAt: dateFilters,
              }),
              isDeleted: false,
            },
            _sum: {
              amount: true,
            },
          })
          totalExpense += branchExpense._sum.amount || 0
        }
      }

      return {
        branchId: branch.id,
        branchName: branch.name,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
      }
    })
  )

  return branchStats.filter((stat) => stat.totalIncome > 0 || stat.totalExpense > 0)
}