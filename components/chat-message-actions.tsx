'use client'
import React, { useState } from 'react'
import { PromptForm } from './prompt-form'
import { Button } from '@/components/ui/button'
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconCancel
} from '@/components/ui/icons'

import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message // Message to edit or copy to clipboard from actions menu (right side of message)
  onEdit: (message: string) => void // Callback for editing message
}

export function ChatMessageActions({
  message,
  className,
  onEdit,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const [isEditing, setIsEditing] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.content)

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = async () => {
    onEdit(editedMessage)
    setIsEditing(false)

    // Add an async operation here and return a promise

    // For example, you can use a setTimeout to simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleCancelClick = () => {
    setEditedMessage(message.content)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      {isEditing ? (
        <PromptForm
          input={editedMessage}
          setInput={setEditedMessage}
          onSubmit={handleSaveClick}
          isLoading={false}
        />
      ) : (
        // <div>
        //   <input
        //     className="bg-slate-100"
        //     type="text"
        //     value={editedMessage}
        //     onChange={e => setEditedMessage(e.target.value)}
        //   />
        //   <Button variant="ghost" size="icon" onClick={handleSaveClick}>
        //     <IconCheck />
        //     <span className="sr-only">Save</span>
        //   </Button>
        //   <Button variant="ghost" size="icon" onClick={handleCancelClick}>
        //     <IconCancel />
        //     <span className="sr-only">Cancel</span>
        //   </Button>
        // </div>
        <div>
          <Button variant="ghost" size="icon" onClick={handleEditClick}>
            <IconEdit />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onCopy}>
            {isCopied ? <IconCheck /> : <IconCopy />}
            <span className="sr-only">Copy message</span>
          </Button>
        </div>
      )}
    </div>
  )
}

// 'use client'

// import { type Message } from 'ai'

// import { Button } from '@/components/ui/button'
// import { IconCheck, IconCopy } from '@/components/ui/icons'
// import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
// import { cn } from '@/lib/utils'

// interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
//   message: Message
// }

// export function ChatMessageActions({
//   message,
//   className,
//   ...props
// }: ChatMessageActionsProps) {
//   const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

//   const onCopy = () => {
//     if (isCopied) return
//     copyToClipboard(message.content)
//   }

//   return (
//     <div
//       className={cn(
//         'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
//         className
//       )}
//       {...props}
//     >
//       <Button variant="ghost" size="icon" onClick={onCopy}>
//         {isCopied ? <IconCheck /> : <IconCopy />}
//         <span className="sr-only">Copy message</span>
//       </Button>
//     </div>
//   )
// }
