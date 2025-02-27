import { NextResponse, type NextRequest } from "next/server"
import { createCaller } from "@/server/api/root"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      )
    }

    // İstek gövdesinden branchId'yi al (opsiyonel)
    const body = await req.json().catch(() => ({}))
    const branchId = body.branchId

    // TRPC caller oluştur
    const caller = createCaller({
      db,
      session,
      headers: req.headers,
    })

    // Belirtilen şube veya tüm şubeler için kasa raporu oluştur
    const result = await caller.cashReport.generateCashReport({
      branchId,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Kasa raporları başarıyla oluşturuldu",
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Kasa raporu oluşturma hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Kasa raporu oluşturulurken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    )
  }
}
