import { NextResponse, type NextRequest } from "next/server"
import { createCaller } from "@/server/api/root"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // // API anahtarını kontrol et (güvenlik için)
    // const authHeader = req.headers.get("authorization")
    // const apiKey = process.env.CRON_API_KEY

    // if (!apiKey) {
    //   return NextResponse.json(
    //     { error: "CRON_API_KEY çevre değişkeni ayarlanmamış" },
    //     { status: 500 }
    //   )
    // }

    // if (authHeader !== `Bearer ${apiKey}`) {
    //   return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    // }

    // TRPC caller oluştur
    const caller = createCaller({
      db,
      session: null,
      headers: req.headers,
    })

    // Tüm şubeler için kasa raporu oluştur
    const result = await caller.cashReport.generateCashReport({})

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
