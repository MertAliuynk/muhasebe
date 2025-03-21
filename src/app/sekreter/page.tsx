import { redirect } from "next/navigation"
import { format } from "date-fns"

export default function page() {
  return redirect(
    `/sekreter/gunluk-kasa?date=${format(new Date(), "yyyy-MM-dd")}`
  )
}
