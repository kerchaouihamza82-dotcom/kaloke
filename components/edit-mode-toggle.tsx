'use client'

import { Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditMode } from '@/hooks/use-edit-mode'
import { useAdmin } from '@/hooks/use-admin'
import { Badge } from '@/components/ui/badge'

export function EditModeToggle() {
  const { isAdmin } = useAdmin()
  const { isEditMode, toggleEditMode } = useEditMode()

  if (!isAdmin) return null

  return (
    <div className="flex items-center gap-2">
      {isEditMode && (
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-xs">
          Editando
        </Badge>
      )}
      <Button
        variant={isEditMode ? 'default' : 'outline'}
        size="sm"
        onClick={toggleEditMode}
        className="gap-2"
        title={isEditMode ? 'Cambiar a vista de alumno' : 'Activar modo edición'}
      >
        {isEditMode ? (
          <>
            <Eye className="h-4 w-4" />
            Vista Alumno
          </>
        ) : (
          <>
            <Edit3 className="h-4 w-4" />
            Modo Edición
          </>
        )}
      </Button>
    </div>
  )
}
