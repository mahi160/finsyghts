import { importDB } from 'dexie-export-import'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { db } from '@/integrations/db/db'

export function Import() {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (targetFile: File) => {
    if (targetFile.size > 10 * 1024 * 1024)
      throw new Error('File must be under 10MB')
    if (!targetFile.type.includes('json') && !targetFile.name.endsWith('.json'))
      throw new Error('Only JSON files are allowed')
  }

  const reset = () => {
    setIsImporting(false)
    setProgress(0)
    setFile(null)
    setShowConfirm(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleImport = async (targetFile: File) => {
    try {
      setIsImporting(true)
      setProgress(0)
      await db.delete()

      await importDB(targetFile, {
        progressCallback: (p) => {
          const percentage = Math.round(
            (p.completedRows * 100) / (p.totalRows || 1),
          )
          setProgress(percentage)
          return p.done
        },
      })

      await db.open()
      toast.success('Import completed!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
      try {
        await db.open()
      } catch {
        toast.error('Database recovery failed. Please refresh.')
      }
    } finally {
      reset()
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0]
    if (!targetFile) return
    try {
      validateFile(targetFile)
      setFile(targetFile)
      setShowConfirm(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid file')
      reset()
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleUpload}
        accept=".json"
        hidden
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={isImporting}
        className="flex  items-center text-sm"
        variant="outline"
      >
        {isImporting ? (
          <div>
            <div className="text-xs mb-1 text-center">Importing</div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import Data
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite existing data with the imported JSON file.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting} onClick={reset}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => file && handleImport(file)}
              disabled={isImporting}
              className="bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
