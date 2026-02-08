'use client'

import { Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditMode } from '@/hooks/use-edit-mode'
import { useAdmin } from '@/hooks/use-admin'

export function EditModeToggle() {
  const { isAdmin } = useAdmin()
  const { isEditMode, toggleEditMode } = useEditMode()

  if (!isAdmin) return null

  return (
    <Button
      variant={isEditMode ? 'default' : 'outline'}
      size="sm"
      onClick={toggleEditMode}
      className="gap-2"
    >
      {isEditMode ? (
        <>
          <Edit3 className="h-4 w-4" />
          Modo Edición
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Modo Vista
        </>
      )}
    </Button>
  )
}
