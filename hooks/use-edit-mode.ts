'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EditModeStore {
  isEditMode: boolean
  toggleEditMode: () => void
  setEditMode: (value: boolean) => void
}

export const useEditMode = create<EditModeStore>()(
  persist(
    (set) => ({
      isEditMode: false,
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      setEditMode: (value: boolean) => set({ isEditMode: value }),
    }),
    {
      name: 'edit-mode-storage',
    }
  )
)
