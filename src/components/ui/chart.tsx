"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    theme?: {
      light?: string
      dark?: string
    }
    icon?: React.ComponentType
  }
}

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={config}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis_line]:stroke-border/50 [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve]:stroke-border [&_.recharts-default-tooltip_::-webkit-scrollbar-thumb]:rounded-full [&_.recharts-default-tooltip_::-webkit-scrollbar-thumb]:bg-border [&_.recharts-default-tooltip_::-webkit-scrollbar-track]:bg-transparent [&_.recharts-default-tooltip_::-webkit-scrollbar]:h-2.5 [&_.recharts-default-tooltip_::-webkit-scrollbar]:w-2.5 [&_.recharts-default-tooltip]:rounded-lg [&_.recharts-default-tooltip]:border-border/50 [&_.recharts-default-tooltip]:bg-background/95 [&_.recharts-default-tooltip]:shadow-md [&_.recharts-dot[name='active']]:stroke-background [&_.recharts-dot[name='active']]:r-5.5 [&_.recharts-dot[name='active']]:stroke-[1.5px] [&_.recharts-dot]:r-2.5 [&_.recharts-layer]:outline-none [&_.recharts-legend-item-text]:!text-foreground [&_.recharts-legend-wrapper]:!right-0 [&_.recharts-legend-wrapper]:!top-0 [&_.recharts-polar-grid_[stroke='%23ccc']]:stroke-border [&_.recharts-polar-grid-angle_line]:stroke-border [&_.recharts-polar-grid-concentric_circle]:stroke-border [&_.recharts-radial-bar]:outline-none [&_.recharts-reference-area-background]:fill-accent [&_.recharts-reference-area-background]:fill-opacity-20 [&_.recharts-reference-dot-circle]:fill-accent [&_.recharts-reference-line-y]:stroke-accent [&_.recharts-reference-line]:stroke-border [&_.recharts-sector]:outline-none [&_.recharts-sector[fill='#ffc658']]:fill-accent [&_.recharts-sector[fill='#82ca9d']]:fill-[hsl(var(--chart-2))] [&_.recharts-sector[fill='#ffc658']]:fill-[hsl(var(--chart-3))] [&_.recharts-sector[fill='#ff7c7c']]:fill-[hsl(var(--chart-4))] [&_.recharts-sector[fill='#0088fe']]:fill-[hsl(var(--chart-5))] [&_.recharts-sector]:stroke-background [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #${chartId} {
                --chart-1: 12 6.5% 15.1%;
                --chart-2: 160 84% 39.7%;
                --chart-3: 30 80% 55.1%;
                --chart-4: 280 85% 49.7%;
                --chart-5: 275 91% 57.1%;
              }
              .dark #${chartId} {
                --chart-1: 220 13% 91%;
                --chart-2: 160 60% 45%;
                --chart-3: 30 80% 55%;
                --chart-4: 280 85% 56%;
                --chart-5: 275 91% 65%;
              }
            `,
          }}
        />
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.label,
  )

  if (colorConfig.length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: colorConfig
          .map(([key, itemConfig]) => {
            const light =
              itemConfig.theme?.light || `hsl(var(--chart-${key}))`
            const dark = itemConfig.theme?.dark || light
            return `
                .light [data-chart="${id}"] [data-chart-item="${key}"] { color: ${light}; }
                .dark [data-chart="${id}"] [data-chart-item="${key}"] { color: ${dark}; }
              `
          })
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: Array<any>
  label?: any
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      nameKey,
      labelKey,
      className,
      ...props
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload || payload.length === 0) {
        return null
      }

      const item = payload[0] as any
      const key = labelKey || "name"
      const itemConfig = (config as Record<string, any>)[item[key] as string]

      if (itemConfig?.label) {
        return itemConfig.label
      }

      return item[key]
    }, [config, hideLabel, labelKey, payload])

    if (!active || !payload || payload.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background/95 px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
        {...props}
      >
        {!hideLabel && tooltipLabel ? (
          <div className="text-muted-foreground">{tooltipLabel}</div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item: any, index: number) => {
            const key = nameKey || "name"
            const itemConfig = (config as Record<string, any>)[item[key] as string]
            const value =
              typeof item.value === "number"
                ? item.value.toLocaleString()
                : item[key]

            return (
              <div
                key={`${index}`}
                className="flex w-full flex-nowrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5">
                  {!hideIndicator && (
                    <div
                      className={cn("shrink-0 rounded-[2px]", {
                        "h-2.5 w-2.5": indicator !== "line",
                        "h-1 w-3": indicator === "line",
                      })}
                      style={{
                        backgroundColor:
                          item.color || "var(--color-fg)",
                      }}
                    />
                  )}
                  <span className="text-muted-foreground">
                    {itemConfig?.label || item[key]}
                  </span>
                </div>
                <span className="font-mono font-medium text-foreground">
                  {value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltip"

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}
