import { NextResponse, type NextRequest } from "next/server"
import { createCaller } from "@/server/api/root"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const caller = createCaller({
      db,
      session: null,
      headers: req.headers,
    })

    const result = await caller.cashReport.generateCashReport()

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
