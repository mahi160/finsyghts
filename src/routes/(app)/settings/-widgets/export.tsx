import { exportDB } from 'dexie-export-import'
import { Button } from '@/components/ui/button'
import { db } from '@/integrations/db/db'

export function Export() {
  const handleExport = async () => {
    const blob = await exportDB(db)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finsyghts-export-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div>
      <Button onClick={handleExport} variant="outline">
        Export (JSON)
      </Button>
    </div>
  )
}
