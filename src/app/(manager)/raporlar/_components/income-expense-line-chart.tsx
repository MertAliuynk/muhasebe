"use client"

import * as React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  views: {
    label: "Tutar",
  },
  income: {
    label: "Gelir",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Gider",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type PageProps = {
  chartData: RouterOutputs["report"]["incomeExpenseLineChart"]
}

export function IncomeExpenseLineChart({ chartData }: PageProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("income")

  const total = React.useMemo(() => {
    return {
      income: chartData?.reduce((acc, curr) => acc + curr.income, 0) || 0,
      expense: chartData?.reduce((acc, curr) => acc + curr.expense, 0) || 0,
    }
  }, [chartData])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Gelir ve Gider Raporu</CardTitle>
          <CardDescription>
            Bu rapor, gelir ve giderlerinizin aylık olarak nasıl değiştiğini
            gösterir.
          </CardDescription>
        </div>
        <div className="flex">
          {["income", "expense"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {formatCurrencyWithSymbol(total[key as keyof typeof total])}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("tr-TR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("tr-TR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="linear"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
