'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AIValidationService } from '@/lib/ai-service'
import { FormField } from '@/types/form'
import { Sparkles, Loader2, CheckCircle, AlertCircle, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onFormGenerated: (fields: FormField[]) => void
  onTitleUpdate?: (title: string, description: string) => void
}

interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message?: string
}

export function AIAssistant({
  isOpen,
  onClose,
  onFormGenerated,
  onTitleUpdate
}: AIAssistantProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedForm, setGeneratedForm] = useState<{
    title: string
    description: string
    fields: FormField[]
  } | null>(null)
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'analyze', label: 'Analyzing your request', status: 'pending' },
    { id: 'design', label: 'Designing form structure', status: 'pending' },
    { id: 'validate', label: 'Adding smart validation', status: 'pending' },
    { id: 'finalize', label: 'Finalizing form', status: 'pending' }
  ])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const updateStep = (stepId: string, status: GenerationStep['status'], message?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, message } : step
    ))
  }

  const generateForm = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedForm(null)

    try {
      updateStep('analyze', 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing

      updateStep('analyze', 'completed')
      updateStep('design', 'processing')

      const result = await AIValidationService.generateNaturalLanguageForm(description)

      updateStep('design', 'completed')
      updateStep('validate', 'processing')

      // Add IDs to generated fields
      const fieldsWithIds = result.fields.map(field => ({
        ...field,
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))

      updateStep('validate', 'completed')
      updateStep('finalize', 'processing')

      await new Promise(resolve => setTimeout(resolve, 500))

      updateStep('finalize', 'completed')

      setGeneratedForm({
        title: result.title,
        description: result.description,
        fields: fieldsWithIds
      })

    } catch (err) {
      console.error('Form generation failed:', err)
      setError('Failed to generate form. Please try again with a more specific description.')
      updateStep('analyze', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplyForm = () => {
    if (generatedForm) {
      onFormGenerated(generatedForm.fields)
      if (onTitleUpdate) {
        onTitleUpdate(generatedForm.title, generatedForm.description)
      }
      handleClose()
    }
  }

  const handleClose = () => {
    setDescription('')
    setGeneratedForm(null)
    setError(null)
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateForm()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold truncate">AI Form Assistant</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Describe your form and let AI create it for you
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="flex-shrink-0">
              ×
            </Button>
          </div>

          {/* Input Section */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your form
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  ref={inputRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Create a job application form with name, email, resume upload, and cover letter"
                  disabled={isGenerating}
                  className="flex-1 min-h-[44px] touch-manipulation"
                />
                <Button
                  onClick={generateForm}
                  disabled={!description.trim() || isGenerating}
                  className="flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation sm:px-4"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate'}</span>
                  <span className="sm:hidden">{isGenerating ? 'Generating...' : 'Generate'}</span>
                </Button>
              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  "Contact form with name, email, and message",
                  "Event registration with personal details and preferences",
                  "Product feedback survey",
                  "Job application form"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setDescription(example)}
                    className="text-xs bg-background hover:bg-accent px-2 sm:px-3 py-1 rounded-full border touch-manipulation"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generation Steps */}
          {isGenerating && (
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <h3 className="text-sm font-medium">Generating your form...</h3>
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-2 sm:space-x-3">
                  <div className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0",
                    step.status === 'pending' && "bg-muted",
                    step.status === 'processing' && "bg-primary animate-pulse",
                    step.status === 'completed' && "bg-green-500",
                    step.status === 'error' && "bg-destructive"
                  )}>
                    {step.status === 'completed' && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                    {step.status === 'error' && <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                    {step.status === 'processing' && <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white animate-spin" />}
                  </div>
                  <span className="text-xs sm:text-sm">{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0" />
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Generated Form Preview */}
          {generatedForm && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-medium">Generated Form</h3>
                <Badge variant="secondary" className="w-fit">AI Generated</Badge>
              </div>

              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-sm sm:text-base">{generatedForm.title}</CardTitle>
                  {generatedForm.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{generatedForm.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium">Fields ({generatedForm.fields.length})</h4>
                    {generatedForm.fields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <span className="text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                            {field.type}
                          </span>
                          <span className="text-xs sm:text-sm font-medium truncate">{field.label}</span>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0">Required</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          Field {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleApplyForm} className="w-full sm:w-auto">
                  Use This Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
