'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import { isOpenAIEnabled } from '@/lib/openai-config'

interface AIStatusIndicatorProps {
  compact?: boolean
}

export function AIStatusIndicator({ compact = false }: AIStatusIndicatorProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const enabled = isOpenAIEnabled()
        setIsEnabled(enabled)
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setIsEnabled(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAIStatus()
  }, [])

  if (isChecking) {
    return compact ? (
      <div className="w-2 h-2 bg-muted rounded-full animate-pulse" />
    ) : (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
        <span className="text-xs">Checking AI...</span>
      </Badge>
    )
  }

  if (!isEnabled) {
    return compact ? (
      <AlertTriangle className="w-3 h-3 text-destructive" />
    ) : (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle className="w-3 h-3" />
        <span className="text-xs">AI Offline</span>
      </Badge>
    )
  }

  return compact ? (
    <Sparkles className="w-3 h-3 text-primary" />
  ) : (
    <Badge variant="default" className="flex items-center space-x-1 bg-primary/10 text-primary border-primary/20">
      <Sparkles className="w-3 h-3" />
      <span className="text-xs">AI Ready</span>
    </Badge>
  )
}
