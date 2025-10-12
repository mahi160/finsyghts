export function PageHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl text-primary tracking-tight md:text-3xl">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
    </div>
  )
}
