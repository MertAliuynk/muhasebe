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

      // Eğer "ALL" filtresi seçilmişse, diğer filtreleri yoksay
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

          // Geçmiş ve bugünkü taksitlerden kalan tutarları topla
          const pastDueAmount = sortedInstallments
            .filter((installment) => installment.dueDate < today)
            .reduce((sum, installment) => sum + installment.remainingAmount, 0)

          // Bu ay içindeki taksitlerden kalan tutarları topla
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

          // Sonraki ödeme tutarı: Geçmiş taksitlerden kalan + bu ayın taksitleri
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

      // Çoklu filtre için koşulları hazırla
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

        // Geçmiş ve bugünkü taksitlerden kalan tutarları topla
        const pastDueAmount = sortedInstallments
          .filter((installment) => installment.dueDate < today)
          .reduce((sum, installment) => sum + installment.remainingAmount, 0)

        // Bu ay içindeki taksitlerden kalan tutarları topla
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

        // Sonraki ödeme tutarı: Geçmiş taksitlerden kalan + bu ayın taksitleri
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
      // Türkçe karakter normalizasyonu için yardımcı fonksiyon
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

      // Normalize arama terimi
      const normalizedQuery = normalizeText(input.query)

      // Veritabanında hasta adlarını önbelleğe alalım
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

      // Manuel olarak hasta adlarını normalleştirip, sorguyla eşleşenleri bulalım
      const matchedPatients = allPatients.filter((patient) => {
        // Her hasta verisi için normalleştirme yapalım
        const normalizedName = normalizeText(patient.name || "")
        const normalizedPhone = normalizeText(patient.phone || "")
        const normalizedTcNo = normalizeText(patient.tcNo || "")

        // Sorgu ile hasta verilerini karşılaştıralım
        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedPhone.includes(normalizedQuery) ||
          normalizedTcNo.includes(normalizedQuery)
        )
      })

      // En fazla 10 sonuç döndürelim
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
        },
      })

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hasta bulunamadı",
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

      // Hastayı ve doktorlarını getir
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

      // Onaylanmış ödeme planında doktorlara yapılmış ödemeleri kontrol et
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

      // Doktorlara ödeme durumunu ekle
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

      // Hasta ve doktoru kontrol et
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

      // Doktor zaten bu hastaya eklenmişse hata fırlat
      if (patient.doctors.some((doc) => doc.id === doctorId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu doktor zaten hastaya eklenmiş",
        })
      }

      return await ctx.db.$transaction(async (tx) => {
        // Doktoru hastaya ekle
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

        // Onaylanmış ödeme planını bul
        const approvedPaymentPlan = await tx.patientPaymentPlan.findFirst({
          where: {
            patientId,
            isDeleted: false,
            isApproved: true,
          },
        })

        // Eğer onaylanmış ödeme planı varsa, doktor payı oluştur
        if (approvedPaymentPlan) {
          // Doktor payı oluştur (totalAmount 0 olarak)
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

      // Hastayı kontrol et
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

      // Doktoru kontrol et
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
        // Doktoru hastadan sil
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

        // Onaylanmış ödeme planını bul
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

        // Silinecek doktorun payını bul ve sil
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

        // Eğer geriye sadece 1 doktor kaldıysa
        if (updatedPatient.doctors.length === 1) {
          const remainingDoctor = updatedPatient.doctors[0]

          // Kalan doktor tanımlı değilse işlemi sonlandır
          if (!remainingDoctor) {
            return updatedPatient
          }

          // Kalan doktorun ödeme payını bul
          const remainingDoctorShare = await tx.doctorPaymentShare.findFirst({
            where: {
              paymentPlanId: approvedPaymentPlan.id,
              doctorId: remainingDoctor.id,
            },
          })

          // Kalan doktorun payını, ödeme planının toplam tutarı olarak güncelle
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
