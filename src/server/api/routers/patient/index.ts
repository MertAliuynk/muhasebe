import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"

import {
  getFilteredPatientsSchema,
  getPatientByIdSchema,
  savePatientSchema,
  savePaymentPlanSchema,
  searchPatientSchema,
} from "./schema"

export const patientRouter = createTRPCRouter({
  getPatientById: protectedProcedure
    .input(getPatientByIdSchema)
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.id },
        include: {
          doctors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  imagePath: true,
                  username: true,
                },
              },
            },
          },
        },
      })

      return patient
    }),
  getPatientsAdmin: adminProcedure.query(async ({ ctx }) => {
    const patients = await ctx.db.patient.findMany({
      include: {
        doctors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imagePath: true,
              },
            },
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    })

    return patients
  }),
  getPatientsByBranch: protectedProcedure.query(async ({ ctx }) => {
    const branchId = ctx.session.user.branchId

    const patients = await ctx.db.patient.findMany({
      where: {
        branchId: branchId!,
      },
      include: {
        doctors: {
          select: {
            id: true,
            specialty: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                imagePath: true,
              },
            },
          },
        },
      },
    })

    return patients
  }),
  getFilteredPatients: protectedProcedure
    .input(getFilteredPatientsSchema)
    .query(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId!
      const today = new Date()

      // Eğer "ALL" filtresi seçilmişse, diğer filtreleri yoksay
      if (input.filters.includes("ALL")) {
        const patients = await ctx.db.patient.findMany({
          where: {
            branchId: branchId,
            isDeleted: false,
          },
          include: {
            doctors: {
              select: {
                id: true,
                specialty: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    imagePath: true,
                  },
                },
              },
            },
            paymentPlans: {
              where: {
                isDeleted: false,
              },
              include: {
                installments: true,
              },
            },
          },
        })
        return patients
      }

      // Çoklu filtre için koşulları hazırla
      const conditions = []

      if (input.filters.includes("PENDING_PAYMENT")) {
        conditions.push({
          paymentPlans: {
            some: {
              isCompleted: false,
              isDeleted: false,
            },
          },
        })
      }

      if (input.filters.includes("OVERDUE_PAYMENT")) {
        conditions.push({
          paymentPlans: {
            some: {
              isCompleted: false,
              isDeleted: false,
              installments: {
                some: {
                  dueDate: {
                    lt: today,
                  },
                  remainingAmount: {
                    gt: 0,
                  },
                },
              },
            },
          },
        })
      }

      // Hiçbir filtre seçilmediyse boş dizi döndür
      if (conditions.length === 0) {
        return []
      }

      // Seçilen filtrelere göre hastaları getir
      const patients = await ctx.db.patient.findMany({
        where: {
          branchId: branchId,
          isDeleted: false,
          OR: conditions,
        },
        include: {
          doctors: {
            select: {
              id: true,
              specialty: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  imagePath: true,
                },
              },
            },
          },
          paymentPlans: {
            where: {
              isDeleted: false,
            },
            include: {
              installments: true,
            },
          },
        },
      })

      return patients
    }),
  savePatient: protectedProcedure
    .input(savePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId!

      const patient = await ctx.db.patient.create({
        data: {
          ...input,
          branchId,
          doctors: {
            connect: input.doctors.map((doctor) => ({ id: doctor })),
          },
          notes: input.notes ?? [],
        },
      })

      return patient
    }),
  searchPatient: protectedProcedure
    .input(searchPatientSchema)
    .query(async ({ ctx, input }) => {
      const patients = await ctx.db.patient.findMany({
        where: {
          OR: [
            { phone: { contains: input.query, mode: "insensitive" } },
            { name: { contains: input.query, mode: "insensitive" } },
            { tcNo: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      })

      return patients
    }),
  savePaymentPlan: protectedProcedure
    .input(savePaymentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        patientId,
        originalAmount,
        totalAmount,
        installmentCount,
        interestRate,
        startDate,
        installments,
        note,
      } = input

      return await ctx.db.$transaction(async (tx) => {
        const paymentPlan = await tx.patientPaymentPlan.create({
          data: {
            totalAmount,
            remainingAmount: totalAmount,
            paidAmount: 0,
            installmentCount,
            startDate: startDate,
            note,
            patientId,
            originalAmount,
            interestRate,
            isApproved: false,
            isCompleted: false,
          },
        })

        const installmentPromises = installments.map((installment, index) => {
          return tx.installment.create({
            data: {
              number: index + 1,
              amount: installment.amount,
              dueDate: installment.date,
              remainingAmount: installment.amount,
              paymentPlanId: paymentPlan.id,
            },
          })
        })

        await Promise.all(installmentPromises)

        return paymentPlan
      })
    }),
})
