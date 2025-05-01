import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/server/db"
import { type Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branchId")
    const doctorId = request.nextUrl.searchParams.get("doctorId")

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

    for (const branch of branches) {
      // Doktor gelirlerini silmek yerine, sadece tarih değerlerini güncelleyeceğiz
      // Bu şubedeki tüm doktor gelirlerini bulalım
      const doctorIncomesToUpdate = await db.doctorIncome.findMany({
        where: {
          doctor: {
            branchId: branch.id,
          },
          ...(doctorId ? { doctorId } : {}),
        },
        include: {
          payment: true,
        },
      })

      let updatedRecords = 0

      // Her doktor gelirini ilgili ödeme tarihi ile güncelleyelim
      for (const income of doctorIncomesToUpdate) {
        if (income.payment?.createdAt) {
          await db.doctorIncome.update({
            where: { id: income.id },
            data: {
              paymentDate: income.payment.createdAt,
              createdAt: income.payment.createdAt,
            },
          })
          updatedRecords++
        }
      }

      // Şubedeki doktorları buluyoruz
      let doctorQuery: Prisma.DoctorWhereInput = {
        branchId: branch.id,
        isDeleted: false,
      }

      if (doctorId) {
        doctorQuery = {
          ...doctorQuery,
          id: doctorId,
        }
      }

      const doctors = await db.doctor.findMany({
        where: doctorQuery,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      if (doctors.length === 0) {
        results.push({
          branchId: branch.id,
          branchName: branch.name,
          message: "Şubede işlem yapılacak doktor bulunamadı",
          updatedRecords,
        })
        continue
      }

      results.push({
        branchId: branch.id,
        branchName: branch.name,
        message: "Doktor gelir tarihleri başarıyla güncellendi",
        updatedRecords,
        doctors: doctors.map((doctor) => ({
          doctorId: doctor.id,
          doctorName: doctor.user.name,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Doktor gelir tarihleri başarıyla güncellendi.",
      results,
    })
  } catch (error) {
    console.error(
      "Doktor gelir tarihlerini güncellerken bir hata oluştu:",
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: `Doktor gelir tarihleri güncellenirken bir hata oluştu: ${(error as Error).message}`,
      },
      { status: 500 }
    )
  }
}
