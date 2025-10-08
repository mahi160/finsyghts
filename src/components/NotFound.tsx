import { Link } from '@tanstack/react-router'
import { Frown } from 'lucide-react' // Icon for visual appeal
import { Button } from '@/components/ui/button' // Assuming shadcn Button import
import { Card, CardContent } from '@/components/ui/card' // Assuming shadcn Card import

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-lg border-destructive border-t-4 shadow-xl">
        <CardContent className="p-8 text-center sm:p-10">
          <Frown className="mx-auto mb-6 h-16 w-16 animate-pulse text-destructive" />

          <h1 className="mb-4 font-extrabold text-6xl text-foreground tracking-tight sm:text-7xl">
            404
          </h1>

          <h2 className="mb-6 font-semibold text-2xl text-muted-foreground sm:text-3xl">
            Page Not Found
          </h2>

          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>

          {/* Use shadcn Button component */}
          <Link to="/">
            <Button size="lg" className="shadow-md">
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Footer/Support Note */}
      <p className="mt-8 text-muted-foreground text-sm">
        If you believe this is an error, please try clearing your cache.
      </p>
    </div>
  )
}
