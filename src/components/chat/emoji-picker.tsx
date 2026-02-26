'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import type { ReactionEmoji } from '@/types'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: ReactionEmoji) => void
  variant?: 'inline' | 'popover'
}

const EMOJIS: ReactionEmoji[] = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥']

/**
 * Componente para seleccionar emojis/reacciones
 */
export function EmojiPicker({ onEmojiSelect, variant = 'popover' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: ReactionEmoji) => {
    onEmojiSelect(emoji)
    setOpen(false)
  }

  if (variant === 'inline') {
    return (
      <div className="flex gap-1 flex-wrap">
        {EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => handleSelect(emoji)}
            className="hover:bg-secondary text-lg p-2 h-auto"
          >
            {emoji}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(emoji)}
              className="hover:bg-secondary text-2xl p-2 h-auto aspect-square"
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Componente para mostrar reacciones de un mensaje
 */
interface MessageReactionsProps {
  reactions: Array<{
    emoji: ReactionEmoji
    count: number
    userReacted?: boolean
  }>
  onReactionClick: (emoji: ReactionEmoji) => void
  showPicker?: boolean
}

export function MessageReactions({
  reactions,
  onReactionClick,
  showPicker = false,
}: MessageReactionsProps) {
  if (reactions.length === 0 && !showPicker) {
    return null
  }

  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.userReacted ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onReactionClick(reaction.emoji)}
          className="h-6 text-xs gap-1"
        >
          <span className="text-sm">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
      {showPicker && (
        <EmojiPicker
          onEmojiSelect={onReactionClick}
          variant="inline"
        />
      )}
    </div>
  )
}
