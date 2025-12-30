'use client'

import React, { useState } from 'react'
import { Form } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eye, EyeOff, Save, Share, Settings, Play, ExternalLink, Undo2, Redo2, BarChart3 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { AIStatusIndicator } from '@/components/AIStatusIndicator'

interface FormHeaderProps {
  form: Form
  onFormUpdate: (updates: Partial<Form>) => void
  previewMode: boolean
  onPreviewToggle: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

export function FormHeader({
  form,
  onFormUpdate,
  previewMode,
  onPreviewToggle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}: FormHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(form.title)

  const handleTitleSave = () => {
    onFormUpdate({ title: tempTitle })
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTempTitle(form.title)
      setIsEditingTitle(false)
    }
  }

  const handleSave = () => {
    // TODO: Implement save to localStorage or API
    console.log('Saving form:', form)
  }

  const handleShare = () => {
    const previewUrl = `${window.location.origin}/preview?formId=${form.id}`
    navigator.clipboard.writeText(previewUrl).then(() => {
      // In a real app, show a toast notification
      alert('Preview link copied to clipboard!')
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = previewUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Preview link copied to clipboard!')
    })
  }

  const handleExport = () => {
    // Export form configuration as JSON
    const dataStr = JSON.stringify(form, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `${form.title.replace(/\s+/g, '_').toLowerCase()}_form.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <header className="min-h-[4rem] bg-card border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-0 gap-3 sm:gap-0">
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Logo size="md" showText={false} />
          <span className="font-semibold text-lg hidden sm:inline">Formify</span>
        </div>

        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="text-base sm:text-lg font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0 min-w-0 flex-1"
              autoFocus
            />
          ) : (
            <h1
              className="text-base sm:text-lg font-medium cursor-pointer hover:text-primary transition-colors truncate"
              onClick={() => setIsEditingTitle(true)}
              title={form.title}
            >
              {form.title}
            </h1>
          )}

          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
            </span>
            <AIStatusIndicator compact />
          </div>
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviewToggle}
          className="flex items-center space-x-2"
        >
          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden md:inline">{previewMode ? 'Edit' : 'Preview'}</span>
        </Button>

        {!previewMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center space-x-2"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden md:inline">Undo</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center space-x-2"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
              <span className="hidden md:inline">Redo</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">Save</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/preview?formId=${form.id}`, '_blank')}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Preview</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/dashboard?formId=${form.id}`, '_blank')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()} // Placeholder - could integrate AI analysis
              className="flex items-center space-x-2"
              title="AI Form Analysis"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analyze</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </>
        )}

            <ThemeToggle />
            <Button size="sm" className="ml-2">
              <span className="hidden md:inline">Publish</span>
              <span className="md:hidden">Publish</span>
            </Button>
      </div>

      {/* Mobile Actions */}
      <div className="flex sm:hidden items-center space-x-1 w-full justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewToggle}
            className="flex items-center space-x-1 px-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs">{previewMode ? 'Edit' : 'Preview'}</span>
          </Button>

          {!previewMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex items-center space-x-1 px-2"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex items-center space-x-1 px-2"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="flex items-center space-x-1 px-2"
              >
                <Save className="w-4 h-4" />
                <span className="text-xs">Save</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1 px-2"
              >
                <Share className="w-4 h-4" />
                <span className="text-xs">Share</span>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {!previewMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/preview?formId=${form.id}`, '_blank')}
                className="flex items-center space-x-1 px-2"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs">Preview</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-1 px-2"
              >
                <Play className="w-4 h-4" />
                <span className="text-xs">Export</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()} // Placeholder - could integrate AI analysis
                className="flex items-center space-x-1 px-2"
                title="AI Analysis"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Analyze</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 px-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </>
          )}

          <ThemeToggle />
          <Button size="sm" className="px-3">
            <span className="text-xs">Publish</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
