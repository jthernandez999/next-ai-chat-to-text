// useEditMessage.tsx
import { useState } from 'react'

export interface useEditMessageProps {
  timeout?: number
}

export function useEditMessage({ timeout = 2000 }: useEditMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMessage, setEditedMessage] = useState('')

  const startEditing = (initialMessage: string) => {
    setIsEditing(true)
    setEditedMessage(initialMessage)
  }

  const stopEditing = () => {
    setIsEditing(false)
    setEditedMessage('')
  }

  const handleSave = async (onSave: (message: string) => void) => {
    onSave(editedMessage)
    stopEditing()
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, timeout))
  }

  return { isEditing, startEditing, stopEditing, editedMessage, handleSave }
}
