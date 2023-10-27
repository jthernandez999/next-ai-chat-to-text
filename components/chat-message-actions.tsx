'use client'
import * as React from 'react'
import { PromptForm } from './prompt-form'
import { Button } from '@/components/ui/button'
import {
  IconEdit,
  IconCopy,
  IconCheck,
  IconCancel
} from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { useEditMessage } from '@/lib/hooks/useEditMessage'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
  onEdit: (message: string) => void
}

export function ChatMessageActions({
  message,
  className,
  onEdit,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const { isEditing, startEditing, stopEditing, editedMessage, handleSave } =
    useEditMessage({
      timeout: 2000
    })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const handleEditClick = () => {
    startEditing(message.content)
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
          setInput={stopEditing}
          onSubmit={() => handleSave(onEdit)}
          isLoading={false}
        />
      ) : (
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
