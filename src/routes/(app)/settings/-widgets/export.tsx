import { exportDB } from 'dexie-export-import'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { db } from '@/integrations/db/db'

export function Export() {
  const handleExport = async () => {
    try {
      const blob = await exportDB(db)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finsyghts-${new Date().toISOString()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export completed')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  return (
    <div>
      <Button onClick={handleExport} variant="outline" className="text-sm">
        <Download className="h-4 w-4" />
        Export Data
      </Button>
    </div>
  )
}
