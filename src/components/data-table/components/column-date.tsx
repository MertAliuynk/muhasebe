import React from "react"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export default function ColumnDate({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays
        className="size-4 text-muted-foreground"
        aria-hidden="true"
      />
      {format(date, "dd LLLL yyyy, HH:mm")}
      <Badge variant="outline">{format(date, "EEEE")}</Badge>
    </div>
  )
}
