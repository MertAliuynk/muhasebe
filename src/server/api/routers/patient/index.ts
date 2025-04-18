import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

import { capitalize } from "@/lib/utils"

import {
  addDoctorToPatientSchema,
  deleteDoctorFromPatientSchema,
  deletePatientSchema,
  getFilteredPatientsSchema,
  getPatientByIdSchema,
  getPatientDoctorsSchema,
  savePatientNoteSchema,
  savePatientSchema,
  savePaymentPlanSchema,
  searchPatientSchema,
  updatePatientSchema,
} from "./schema"

export const patientRouter = createTRPCRouter({
  getPatientById: protectedProcedure
    .input(getPatientByIdSchema)
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
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
    const branchId = ctx.session.user.branchId ?? ""

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
      },
    })

    return patients
  }),
  getFilteredPatients: protectedProcedure
    .input(getFilteredPatientsSchema)
    .query(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId ?? ""
      const today = new Date()

      if (input.filters.includes("ALL")) {
        const patients = await ctx.db.patient.findMany({
          where: {
            branchId: branchId,
            isDeleted: false,
            paymentPlans:
              input.startDate && input.endDate
                ? {
                    some: {
                      isDeleted: false,
                      isApproved: true,
                      installments: {
                        some: {
                          AND: [
                            {
                              dueDate: {
                                gte: input.startDate,
                                lte: input.endDate,
                              },
                            },
                            {
                              isCompleted: false,
                            },
                          ],
                        },
                      },
                    },
                  }
                : undefined,
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
                isApproved: true,
                installments:
                  input.startDate && input.endDate
                    ? {
                        some: {
                          AND: [
                            {
                              dueDate: {
                                gte: input.startDate,
                                lte: input.endDate,
                              },
                            },
                            {
                              isCompleted: false,
                            },
                          ],
                        },
                      }
                    : undefined,
              },
              include: {
                installments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        return patients.map((patient) => {
          const approvedPlan = patient.paymentPlans.find(
            (plan) => plan.isApproved === true
          )

          if (!approvedPlan) {
            return {
              ...patient,
              totalRemainingAmount: 0,
              remainingInstallmentCount: 0,
              nextPaymentAmount: 0,
            }
          }

          const today = new Date()
          const currentMonth = today.getMonth()
          const currentYear = today.getFullYear()

          const sortedInstallments = approvedPlan.installments
            .filter((installment) => !installment.isCompleted)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

          const pastDueAmount = sortedInstallments
            .filter((installment) => installment.dueDate < today)
            .reduce((sum, installment) => sum + installment.remainingAmount, 0)

          const currentMonthDueAmount = sortedInstallments
            .filter((installment) => {
              const installmentDate = new Date(installment.dueDate)
              return (
                installmentDate.getMonth() === currentMonth &&
                installmentDate.getFullYear() === currentYear &&
                installmentDate >= today
              )
            })
            .reduce((sum, installment) => sum + installment.remainingAmount, 0)

          const nextPaymentAmount = pastDueAmount + currentMonthDueAmount

          return {
            ...patient,
            totalRemainingAmount: approvedPlan.remainingAmount,
            remainingInstallmentCount: approvedPlan.installments.filter(
              (installment) => installment.isCompleted === false
            ).length,
            nextPaymentAmount,
          }
        })
      }

      const conditions = []

      if (input.filters.includes("PENDING_PAYMENT")) {
        conditions.push({
          paymentPlans: {
            some: {
              isCompleted: false,
              isDeleted: false,
              isApproved: true,
              installments: {
                some: {
                  AND: [
                    input.startDate && input.endDate
                      ? {
                          dueDate: {
                            gte: input.startDate,
                            lte: input.endDate,
                          },
                        }
                      : {},
                    {
                      isCompleted: false,
                    },
                  ],
                },
              },
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
              isApproved: true,
              installments: {
                some: {
                  AND: [
                    {
                      dueDate: {
                        lt: today,
                      },
                    },
                    input.startDate && input.endDate
                      ? {
                          dueDate: {
                            gte: input.startDate,
                            lte: input.endDate,
                          },
                        }
                      : {},
                    {
                      remainingAmount: {
                        gt: 0,
                      },
                    },
                    {
                      isCompleted: false,
                    },
                  ],
                },
              },
            },
          },
        })
      }

      if (conditions.length === 0) {
        return []
      }

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
        orderBy: {
          createdAt: "desc",
        },
      })

      return patients.map((patient) => {
        const approvedPlan = patient.paymentPlans.find(
          (plan) => plan.isApproved === true
        )

        if (!approvedPlan) {
          return {
            ...patient,
            totalRemainingAmount: 0,
            remainingInstallmentCount: 0,
            nextPaymentAmount: 0,
          }
        }

        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()

        const sortedInstallments = approvedPlan.installments
          .filter((installment) => !installment.isCompleted)
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

        const pastDueAmount = sortedInstallments
          .filter((installment) => installment.dueDate < today)
          .reduce((sum, installment) => sum + installment.remainingAmount, 0)

        const currentMonthDueAmount = sortedInstallments
          .filter((installment) => {
            const installmentDate = new Date(installment.dueDate)
            return (
              installmentDate.getMonth() === currentMonth &&
              installmentDate.getFullYear() === currentYear &&
              installmentDate >= today
            )
          })
          .reduce((sum, installment) => sum + installment.remainingAmount, 0)

        const nextPaymentAmount = pastDueAmount + currentMonthDueAmount

        return {
          ...patient,
          totalRemainingAmount: approvedPlan.remainingAmount,
          remainingInstallmentCount: approvedPlan.installments.filter(
            (installment) => installment.isCompleted === false
          ).length,
          nextPaymentAmount,
        }
      })
    }),
  savePatient: protectedProcedure
    .input(savePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const branchId = ctx.session.user.branchId ?? ""

      const patient = await ctx.db.patient.create({
        data: {
          ...input,
          name: capitalize(input.name),
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
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ı/g, "i")
          .replace(/i̇/g, "i")
          .replace(/ç/g, "c")
          .replace(/ş/g, "s")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ö/g, "o")
      }

      const normalizedQuery = normalizeText(input.query)

      const allPatients = await ctx.db.patient.findMany({
        where: {
          branchId: ctx.session.user.branchId ?? "",
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          tcNo: true,
        },
      })

      const matchedPatients = allPatients.filter((patient) => {
        const normalizedName = normalizeText(patient.name || "")
        const normalizedPhone = normalizeText(patient.phone || "")
        const normalizedTcNo = normalizeText(patient.tcNo || "")

        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedPhone.includes(normalizedQuery) ||
          normalizedTcNo.includes(normalizedQuery)
        )
      })

      return matchedPatients.slice(0, 10)
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
  updatePatient: protectedProcedure
    .input(updatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const patient = await ctx.db.patient.update({
        where: { id },
        data: {
          ...data,
        },
      })

      return patient
    }),
  deletePatient: protectedProcedure
    .input(deletePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const patientData = await ctx.db.patient.findUnique({
        where: { id: input.id },
        include: {
          paymentPlans: {
            where: {
              isDeleted: false,
              isApproved: true,
              isCompleted: false,
            },
            include: {
              doctorShares: true,
            },
          },
          payments: true,
        },
      })

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
        })
      }

      if (patientData.payments.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Hasta ödemesi var, silinemez. Bu Hastayı silebilmek için önce hastanın ödemelerini silmelisiniz.",
        })
      }
      const patient = await ctx.db.patient.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
        },
      })

      if (patientData.paymentPlans.length > 0) {
        await ctx.db.$transaction(async (tx) => {
          await tx.patientPaymentPlan.updateMany({
            where: {
              patientId: input.id,
              isDeleted: false,
            },
            data: {
              isDeleted: true,
            },
          })

          for (const plan of patientData.paymentPlans) {
            for (const share of plan.doctorShares) {
              await tx.doctorPaymentShare.delete({
                where: { id: share.id },
              })
            }
          }
        })
      }

      return patient
    }),
  savePatientNote: protectedProcedure
    .input(savePatientNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { patientId, note } = input

      const patient = await ctx.db.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
        })
      }

      const notes =
        !patient.notes || patient.notes.length === 0
          ? [note]
          : [note, ...patient.notes]

      const patientNote = await ctx.db.patient.update({
        where: { id: patientId },
        data: {
          notes,
        },
      })

      return patientNote
    }),
  getAllPatients: protectedProcedure.query(async ({ ctx }) => {
    const patients = await ctx.db.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return patients
  }),
  getPatientDoctors: protectedProcedure
    .input(getPatientDoctorsSchema)
    .query(async ({ ctx, input }) => {
      const { patientId } = input

      const patient = await ctx.db.patient.findUnique({
        where: {
          id: patientId,
          isDeleted: false,
        },
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

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
        })
      }

      const paymentPlan = await ctx.db.patientPaymentPlan.findFirst({
        where: {
          patientId,
          isDeleted: false,
          isApproved: true,
        },
        include: {
          doctorShares: true,
        },
      })

      const doctorsWithPaymentStatus = patient.doctors.map((doctor) => {
        const hasPaid =
          paymentPlan?.doctorShares.some(
            (share) => share.doctorId === doctor.id && share.paidAmount > 0
          ) ?? false

        return {
          ...doctor,
          hasPaid,
        }
      })

      return doctorsWithPaymentStatus
    }),
  addDoctorToPatient: protectedProcedure
    .input(addDoctorToPatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { patientId, doctorId } = input

      const patient = await ctx.db.patient.findUnique({
        where: {
          id: patientId,
          isDeleted: false,
        },
        include: {
          doctors: true,
        },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
        })
      }

      const doctor = await ctx.db.doctor.findUnique({
        where: {
          id: doctorId,
          isDeleted: false,
        },
      })

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doktor bulunamadı",
        })
      }

      if (patient.doctors.some((doc) => doc.id === doctorId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu doktor zaten hastaya eklenmiş",
        })
      }

      return await ctx.db.$transaction(async (tx) => {
        const updatedPatient = await tx.patient.update({
          where: {
            id: patientId,
          },
          data: {
            doctors: {
              connect: {
                id: doctorId,
              },
            },
          },
        })

        const approvedPaymentPlan = await tx.patientPaymentPlan.findFirst({
          where: {
            patientId,
            isDeleted: false,
            isApproved: true,
          },
        })

        if (approvedPaymentPlan) {
          await tx.doctorPaymentShare.create({
            data: {
              doctorId,
              paymentPlanId: approvedPaymentPlan.id,
              totalAmount: 0,
              paidAmount: 0,
              remainingAmount: 0,
            },
          })
        }

        return updatedPatient
      })
    }),
  deleteDoctorFromPatient: protectedProcedure
    .input(deleteDoctorFromPatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { patientId, doctorId } = input

      const patient = await ctx.db.patient.findUnique({
        where: { id: patientId },
        include: {
          doctors: true,
        },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
        })
      }

      const doctor = await ctx.db.doctor.findUnique({
        where: { id: doctorId },
      })

      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doktor bulunamadı",
        })
      }

      return await ctx.db.$transaction(async (tx) => {
        const updatedPatient = await tx.patient.update({
          where: { id: patientId },
          data: {
            doctors: {
              disconnect: { id: doctorId },
            },
          },
          include: {
            doctors: true,
          },
        })

        const approvedPaymentPlan = await tx.patientPaymentPlan.findFirst({
          where: {
            patientId,
            isDeleted: false,
            isApproved: true,
          },
        })

        if (!approvedPaymentPlan) {
          return updatedPatient
        }

        const deleteDoctorShare = await tx.doctorPaymentShare.findFirst({
          where: {
            paymentPlanId: approvedPaymentPlan.id,
            doctorId,
          },
        })

        if (deleteDoctorShare) {
          await tx.doctorPaymentShare.delete({
            where: {
              id: deleteDoctorShare.id,
            },
          })
        }

        if (updatedPatient.doctors.length === 1) {
          const remainingDoctor = updatedPatient.doctors[0]

          if (!remainingDoctor) {
            return updatedPatient
          }

          const remainingDoctorShare = await tx.doctorPaymentShare.findFirst({
            where: {
              paymentPlanId: approvedPaymentPlan.id,
              doctorId: remainingDoctor.id,
            },
          })

          if (remainingDoctorShare) {
            await tx.doctorPaymentShare.update({
              where: {
                id: remainingDoctorShare.id,
              },
              data: {
                totalAmount: approvedPaymentPlan.totalAmount,
                remainingAmount: approvedPaymentPlan.remainingAmount,
              },
            })
          }
        }

        return updatedPatient
      })
    }),
})
