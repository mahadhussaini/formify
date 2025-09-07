'use client'

import React, { useState } from 'react'
import { FormStep } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Plus, Trash2, Edit3, Check, X, GripVertical } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StepNavigationProps {
  steps: FormStep[]
  isMultiStep: boolean
  selectedStepId: string | null
  onStepSelect: (stepId: string | null) => void
  onStepsUpdate: (steps: FormStep[]) => void
  onMultiStepToggle: (isMultiStep: boolean) => void
  onStepReorder: (fromIndex: number, toIndex: number) => void
}

export function StepNavigation({
  steps,
  isMultiStep,
  selectedStepId,
  onStepSelect,
  onStepsUpdate,
  onMultiStepToggle,
  onStepReorder
}: StepNavigationProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  const handleAddStep = () => {
    const newStep: FormStep = {
      id: generateId(),
      title: `Step ${steps.length + 1}`,
      description: '',
      fields: [],
      order: steps.length
    }
    onStepsUpdate([...steps, newStep])
    onStepSelect(newStep.id)
  }

  const handleDeleteStep = (stepId: string) => {
    if (steps.length <= 1) return // Don't allow deleting the last step

    const updatedSteps = steps.filter(step => step.id !== stepId)
    onStepsUpdate(updatedSteps)

    if (selectedStepId === stepId) {
      onStepSelect(updatedSteps[0]?.id || null)
    }
  }

  const handleEditStep = (step: FormStep) => {
    setEditingStepId(step.id)
    setEditingTitle(step.title)
    setEditingDescription(step.description || '')
  }

  const handleSaveStepEdit = () => {
    if (!editingStepId) return

    const updatedSteps = steps.map(step =>
      step.id === editingStepId
        ? { ...step, title: editingTitle, description: editingDescription }
        : step
    )
    onStepsUpdate(updatedSteps)
    setEditingStepId(null)
  }

  const handleCancelEdit = () => {
    setEditingStepId(null)
    setEditingTitle('')
    setEditingDescription('')
  }

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    e.dataTransfer.setData('text/plain', stepId)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const draggedStepId = e.dataTransfer.getData('text/plain')
    const draggedIndex = steps.findIndex(step => step.id === draggedStepId)

    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      onStepReorder(draggedIndex, targetIndex)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (!isMultiStep) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Form Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="multi-step-toggle">Enable Multi-Step Form</Label>
              <Switch
                id="multi-step-toggle"
                checked={isMultiStep}
                onCheckedChange={onMultiStepToggle}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enable multi-step forms to break your form into multiple pages for better user experience.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Form Steps ({steps.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="multi-step-toggle"
              checked={isMultiStep}
              onCheckedChange={onMultiStepToggle}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              draggable
              onDragStart={(e) => handleDragStart(e, step.id)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className={cn(
                "p-3 border rounded-lg cursor-pointer transition-all",
                selectedStepId === step.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onStepSelect(step.id)}
            >
              {editingStepId === step.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`step-title-${step.id}`}>Step Title</Label>
                    <Input
                      id={`step-title-${step.id}`}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Enter step title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`step-description-${step.id}`}>Description (optional)</Label>
                    <Textarea
                      id={`step-description-${step.id}`}
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Enter step description"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleSaveStepEdit}>
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="cursor-move">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium truncate">{step.title}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {step.fields.length} fields
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStep(step)
                      }}
                      className="p-1 h-6 w-6"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    {steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteStep(step.id)
                        }}
                        className="p-1 h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {steps.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">No steps yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add your first step to get started with multi-step forms.
            </p>
            <Button onClick={handleAddStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
