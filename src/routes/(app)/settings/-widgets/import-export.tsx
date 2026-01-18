import { Import } from './import'
import { Export } from './export'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ImportExportWidget() {
  return (
    <Card className="p-0">
      <CardHeader className="p-6">
        <CardTitle className="text-lg">Import & Export</CardTitle>
        <CardDescription>
          Backup your data or restore from a previous backup
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Export Data</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Download your data as a JSON backup file
            </p>
            <Export />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Import Data</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Restore from a previous JSON backup file
            </p>
            <Import />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
