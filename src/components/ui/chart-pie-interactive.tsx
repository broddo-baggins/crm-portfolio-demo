"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorShapeProps } from "recharts"
import { useTranslation } from 'react-i18next'
import { useLang } from '@/hooks/useLang'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive pie chart"

// Real data based on monthly lead generation from the system
const desktopData = [
  { month: "january", desktop: 3, fill: "hsl(var(--chart-1))" },
  { month: "february", desktop: 5, fill: "hsl(var(--chart-2))" },
  { month: "march", desktop: 7, fill: "hsl(var(--chart-3))" },
  { month: "april", desktop: 4, fill: "hsl(var(--chart-4))" },
  { month: "may", desktop: 6, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  visitors: {
    label: "Leads",
  },
  desktop: {
    label: "Leads Generated",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "hsl(var(--chart-1))",
  },
  february: {
    label: "February", 
    color: "hsl(var(--chart-2))",
  },
  march: {
    label: "March",
    color: "hsl(var(--chart-3))",
  },
  april: {
    label: "April",
    color: "hsl(var(--chart-4))",
  },
  may: {
    label: "May",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartPieInteractive() {
  const { t } = useTranslation('dashboard');
  const { isRTL, textStart, flexRowReverse } = useLang();
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)

  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  return (
    <Card data-chart={id} className="flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className={`flex-row items-start space-y-0 pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="grid gap-1">
          <CardTitle className={textStart()}>{t('charts.leadGenerationConversionTrends', 'Lead Generation & Conversion Trends')}</CardTitle>
          <CardDescription className={textStart()}>{t('charts.monthlyPerformanceDescription', 'Monthly performance showing lead volume and conversion outcomes')}</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className={`${isRTL ? 'mr-auto' : 'ml-auto'} h-7 w-[130px] rounded-lg pl-2.5`}
            aria-label="Select a value"
          >
            <SelectValue placeholder={t('months.january', 'Select month')} />
          </SelectTrigger>
          <SelectContent align={isRTL ? "start" : "end"} className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `hsl(var(--chart-${months.indexOf(key) + 1}))`,
                      }}
                    />
                    {t(`months.${key}`, config?.label || key)}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              shape={({ outerRadius = 0, ...props }: PieSectorShapeProps, index: number) =>
                index === activeIndex ? (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                ) : (
                  <Sector {...props} outerRadius={outerRadius} />
                )
              }
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {desktopData[activeIndex].desktop.toLocaleString(isRTL ? 'he-IL' : 'en-US')}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {t('charts.leads', 'Leads')}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 