import React, { FC, memo, useEffect, useRef, useState } from 'react'
import {
  IconEdit,
  IconOpenAI,
  IconTrash,
  IconUser
} from '@/components/ui/icons'

import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { Message } from 'ai'

import { MemoizedReactMarkdown } from '@/components/markdown'
import { CodeBlock } from '@/components/ui/codeblock'
import { UseChatHelpers } from 'ai/react'

export interface Props {
  message: Message
  onEdit?: (editedMessage: Message) => void
}

const ChatMessage: FC<Props> = memo(({ message, onEdit }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [messageContent, setMessageContent] = useState(message.content)
  const [messageCopied, setMessageCopied] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(event.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleEditMessage = () => {
    if (message.content !== messageContent) {
      if (onEdit) {
        onEdit({ ...message, content: messageContent })
      }
      setIsEditing(false)
    }
  }

  const handleDeleteMessage = () => {
    // Handle delete logic
  }

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault()
      handleEditMessage()
    }
  }

  useEffect(() => {
    setMessageContent(message.content)
  }, [message.content])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  return (
    <div
      className={`group md:px-4 ${
        message.role === 'assistant'
          ? 'border-b border-black/10 bg-white-50 text-gray-800  '
          : 'border-b border-black/10 bg-white text-gray-800  '
      }`}
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] text-right font-bold">
          {message.role === 'assistant' ? <IconOpenAI /> : <IconUser />}
        </div>

        <div className="prose mt-[-2px] w-full ">
          {message.role === 'user' ? (
            <div className="flex w-full">
              {isEditing ? (
                <div className="flex w-full flex-col">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-slate-50 resize-none whitespace-pre-wrap border-none "
                    value={messageContent}
                    onChange={handleInputChange}
                    onKeyDown={handlePressEnter}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      padding: '0',
                      margin: '0',
                      overflow: 'hidden'
                    }}
                  />

                  <div className="mt-10 flex justify-center space-x-4">
                    <button
                      className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                      onClick={handleEditMessage}
                      disabled={messageContent.trim().length <= 0}
                    >
                      Save & Submit
                    </button>
                    <button
                      className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMessageContent(message.content)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose whitespace-pre-wrap  flex-1">
                  {message.content}
                </div>
              )}

              {!isEditing && (
                <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={toggleEditing}
                  >
                    <IconEdit />
                  </button>
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleDeleteMessage}
                  >
                    <IconTrash />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
              <MemoizedReactMarkdown
                className="prose break-words prose-p:leading-relaxed prose-pre:p-0"
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                  },
                  code({ node, inline, className, children, ...props }) {
                    if (children.length) {
                      if (children[0] == '▍') {
                        return (
                          <span className="mt-1 cursor-default animate-pulse">
                            ▍
                          </span>
                        )
                      }

                      children[0] = (children[0] as string).replace('`▍`', '▍')
                    }

                    const match = /language-(\w+)/.exec(className || '')

                    if (inline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }

                    return (
                      <CodeBlock
                        key={Math.random()}
                        language={(match && match[1]) || ''}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    )
                  }
                }}
              >
                {message.content}
              </MemoizedReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage

// // 'use client'
// import React, { FC, memo, useEffect, useRef, useState } from 'react'
// import {
//   IconCheck,
//   IconCopy,
//   IconEdit,
//   IconOpenAI,
//   IconTrash,
//   IconUser
// } from '@/components/ui/icons'
// import rehypeMathjax from 'rehype-mathjax'
// import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'

// import { Message } from '@/types/chat'
// import { updateConversation } from '@/utils/app/conversation'

// interface Props {
//   message: Message
//   messageIndex: number
//   onEdit?: (editedMessage: Message) => void
// }

// const ChatMessage: FC<Props> = memo(({ message, messageIndex, onEdit }) => {
//   const [isEditing, setIsEditing] = useState<boolean>(false)
//   const [isTyping, setIsTyping] = useState<boolean>(false)
//   const [messageContent, setMessageContent] = useState(message.content)
//   const [messageCopied, setMessageCopied] = useState(false)

//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   const toggleEditing = () => {
//     setIsEditing(!isEditing)
//   }

//   const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setMessageContent(event.target.value)
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'inherit'
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
//     }
//   }

//   const handleEditMessage = () => {
//     if (message.content !== messageContent) {
//       if (onEdit) {
//         onEdit({ ...message, content: messageContent })
//       }
//       setIsEditing(false)
//     }
//   }

//   const handleDeleteMessage = () => {
//     // Handle delete logic
//   }

//   const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
//       e.preventDefault()
//       handleEditMessage()
//     }
//   }

//   const copyOnClick = () => {
//     if (!navigator.clipboard) return
//     navigator.clipboard.writeText(message.content).then(() => {
//       setMessageCopied(true)
//       setTimeout(() => {
//         setMessageCopied(false)
//       }, 2000)
//     })
//   }

//   useEffect(() => {
//     setMessageContent(message.content)
//   }, [message.content])

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'inherit'
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
//     }
//   }, [isEditing])

//   return (
//     <div
//       className={`group md:px-4 ${
//         message.role === 'assistant'
//           ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
//           : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
//       }`}
//       style={{ overflowWrap: 'anywhere' }}
//     >
//       <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
//         <div className="min-w-[40px] text-right font-bold">
//           {message.role === 'assistant' ? <IconOpenAI /> : <IconUser />}
//         </div>

//         <div className="prose mt-[-2px] w-full dark:prose-invert">
//           {message.role === 'user' ? (
//             <div className="flex w-full">
//               {isEditing ? (
//                 <div className="flex w-full flex-col">
//                   <textarea
//                     ref={textareaRef}
//                     className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
//                     value={messageContent}
//                     onChange={handleInputChange}
//                     onKeyDown={handlePressEnter}
//                     onCompositionStart={() => setIsTyping(true)}
//                     onCompositionEnd={() => setIsTyping(false)}
//                     style={{
//                       fontFamily: 'inherit',
//                       fontSize: 'inherit',
//                       lineHeight: 'inherit',
//                       padding: '0',
//                       margin: '0',
//                       overflow: 'hidden'
//                     }}
//                   />

//                   <div className="mt-10 flex justify-center space-x-4">
//                     <button
//                       className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
//                       onClick={handleEditMessage}
//                       disabled={messageContent.trim().length <= 0}
//                     >
//                       Save & Submit
//                     </button>
//                     <button
//                       className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
//                       onClick={() => {
//                         setMessageContent(message.content)
//                         setIsEditing(false)
//                       }}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="prose whitespace-pre-wrap dark:prose-invert flex-1">
//                   {message.content}
//                 </div>
//               )}

//               {!isEditing && (
//                 <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
//                   <button
//                     className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//                     onClick={toggleEditing}
//                   >
//                     <IconEdit size={20} />
//                   </button>
//                   <button
//                     className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//                     onClick={handleDeleteMessage}
//                   >
//                     <IconTrash size={20} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex flex-row">
//               {/* Markdown rendering logic */}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// })

// ChatMessage.displayName = 'ChatMessage'

// export default ChatMessage

// // Inspired by Chatbot-UI and modified to fit the needs of this project
// // @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

// import { Message } from 'ai'
// import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'

// import { cn } from '@/lib/utils'
// import { CodeBlock } from '@/components/ui/codeblock'
// import { MemoizedReactMarkdown } from '@/components/markdown'
// import { IconOpenAI, IconUser } from '@/components/ui/icons'
// import { ChatMessageActions } from '@/components/chat-message-actions'

// export interface ChatMessageProps {
//   message: Message
// }

// export function ChatMessage({ message, ...props }: ChatMessageProps) {
//   return (
//     <div
//       className={cn('group relative mb-4 flex items-start md:-ml-12')}
//       {...props}
//     >
//       <div
//         className={cn(
//           'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
//           message.role === 'user'
//             ? 'bg-background'
//             : 'bg-primary text-primary-foreground'
//         )}
//       >
//         {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
//       </div>
//       <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
//         <MemoizedReactMarkdown
//           className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
//           remarkPlugins={[remarkGfm, remarkMath]}
//           components={{
//             p({ children }) {
//               return <p className="mb-2 last:mb-0">{children}</p>
//             },
//             code({ node, inline, className, children, ...props }) {
//               if (children.length) {
//                 if (children[0] == '▍') {
//                   return (
//                     <span className="mt-1 cursor-default animate-pulse">▍</span>
//                   )
//                 }

//                 children[0] = (children[0] as string).replace('`▍`', '▍')
//               }

//               const match = /language-(\w+)/.exec(className || '')

//               if (inline) {
//                 return (
//                   <code className={className} {...props}>
//                     {children}
//                   </code>
//                 )
//               }

//               return (
//                 <CodeBlock
//                   key={Math.random()}
//                   language={(match && match[1]) || ''}
//                   value={String(children).replace(/\n$/, '')}
//                   {...props}
//                 />
//               )
//             }
//           }}
//         >
//           {message.content}
//         </MemoizedReactMarkdown>
//         <ChatMessageActions
//           onEdit={() => {
//             console.log('edit')
//           }}
//           message={message}
//         />
//       </div>
//     </div>
//   )
// }
