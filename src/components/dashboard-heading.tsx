type DashboardHeaderProps = {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h2 className="font-heading text-xl md:text-4xl">{heading}</h2>
        {text && (
          <p className="text-sm md:text-lg text-muted-foreground">{text}</p>
        )}
      </div>
      {children}
    </div>
  )
}
