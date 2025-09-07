'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Form, FormField } from '@/types/form'
import { FieldPalette } from './form-builder/FieldPalette'
import { FormCanvas } from './form-builder/FormCanvas'
import { PropertiesPanel } from './form-builder/PropertiesPanel'
import { FormHeader } from './form-builder/FormHeader'
import { AIAssistant } from './AIAssistant'
import { FormHistoryProvider, useFormHistory } from '@/contexts/FormHistoryContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { TemplateSelector } from './TemplateSelector'
import { createFormFromTemplate } from '@/lib/formTemplates'
import { generateId } from '@/lib/utils'
import { createFieldFromTemplate } from '@/lib/fieldTemplates'
import { DndWrapper } from './DndWrapper'
import { DndErrorBoundary } from './DndErrorBoundary'
import { Button } from '@/components/ui/Button'

// Inner component that uses the form history context
function FormBuilderInner() {
  const {
    form,
    canUndo,
    canRedo,
    undo,
    redo,
    updateForm,
    addField,
    updateField,
    deleteField,
    duplicateField
  } = useFormHistory()

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(form.steps[0]?.id || null)
  const [draggedField, setDraggedField] = useState<any>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setDraggedField(active.data.current)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedField(null)

    if (!over) return

    // Handle dropping a new field from palette
    if (active.data.current?.isTemplate && over.id === 'form-canvas') {
      const newField = createFieldFromTemplate(active.data.current.type)

      // If in multi-step mode, add the field to the current step
      if (form.isMultiStep && selectedStepId) {
        const currentStep = form.steps.find(step => step.id === selectedStepId)
        if (currentStep) {
          const updatedSteps = form.steps.map(step =>
            step.id === selectedStepId
              ? { ...step, fields: [...step.fields, newField.id] }
              : step
          )
          updateForm({ steps: updatedSteps })
        }
      }

      addField(newField)
      setSelectedField(newField)
      return
    }

    // Handle reordering existing fields
    if (active.data.current?.isField && over.data.current?.isField) {
      const activeIndex = form.fields.findIndex(f => f.id === active.id)
      const overIndex = form.fields.findIndex(f => f.id === over.id)

      if (activeIndex !== overIndex) {
        const newFields = [...form.fields]
        const [movedField] = newFields.splice(activeIndex, 1)
        newFields.splice(overIndex, 0, movedField)

        // Update all fields at once
        newFields.forEach((field, index) => {
          updateField(field.id, { ...field })
        })
      }
    }
  }

  // Update selected field when a field is updated
  useEffect(() => {
    if (selectedField) {
      const updatedField = form.fields.find(f => f.id === selectedField.id)
      if (updatedField && JSON.stringify(updatedField) !== JSON.stringify(selectedField)) {
        setSelectedField(updatedField)
      }
    }
  }, [form.fields, selectedField])

  const updateFormSettings = (updates: Partial<Form>) => {
    updateForm(updates)

    // Also save to localStorage for persistence
    const updated = { ...form, ...updates, updatedAt: new Date() }
    const savedForms = JSON.parse(localStorage.getItem('formify_forms') || '[]')
    const existingIndex = savedForms.findIndex((f: Form) => f.id === form.id)
    if (existingIndex >= 0) {
      savedForms[existingIndex] = updated
    } else {
      savedForms.push(updated)
    }
    localStorage.setItem('formify_forms', JSON.stringify(savedForms))
  }

  const handleAIGenerateForm = (fields: FormField[]) => {
    fields.forEach(field => addField(field))
  }

  const handleAITitleUpdate = (title: string, description: string) => {
    updateForm({ title, description })
  }

  const handleTemplateSelect = (template: any) => {
    const newForm = createFormFromTemplate(template)

    // Clear current form and replace with template
    updateForm({
      title: newForm.title,
      description: newForm.description,
      steps: newForm.steps,
      isMultiStep: newForm.isMultiStep,
      settings: { ...form.settings, ...newForm.settings }
    })

    // Add all template fields
    newForm.fields.forEach(field => addField(field))

    // Set the first step as selected if multi-step
    if (newForm.isMultiStep && newForm.steps.length > 0) {
      setSelectedStepId(newForm.steps[0].id)
    }
  }

  return (
    <DndErrorBoundary>
      <div className="h-screen bg-background">
      <FormHeader
        form={form}
        onFormUpdate={updateFormSettings}
        previewMode={previewMode}
        onPreviewToggle={() => setPreviewMode(!previewMode)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      
      <DndWrapper>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="min-h-screen lg:h-[calc(100vh-4rem)] form-builder-mobile lg:form-builder-mobile">
          {/* Mobile Layout - Stack vertically on small screens */}
          <div className="block lg:hidden">
            {!previewMode && (
              <div className="border-b border-border bg-card">
                <FieldPalette onOpenAIAssistant={() => setShowAIAssistant(true)} />
              </div>
            )}

            <div className="flex-1">
              <SortableContext
                items={form.fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <FormCanvas
                  form={form}
                  selectedField={selectedField}
                  selectedStepId={selectedStepId}
                  onFieldSelect={setSelectedField}
                  onFieldUpdate={updateField}
                  onFieldDelete={deleteField}
                  onFieldDuplicate={duplicateField}
                  previewMode={previewMode}
                  onTemplateSelect={handleTemplateSelect}
                />
              </SortableContext>
            </div>

            {!previewMode && selectedField && (
              <div className="border-t border-border bg-card fixed bottom-0 left-0 right-0 z-40 max-h-[60vh] overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Field Properties</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedField(null)}
                      className="min-h-[44px] touch-manipulation"
                    >
                      ✕
                    </Button>
                  </div>
                  <PropertiesPanel
                    selectedField={selectedField}
                    onFieldUpdate={updateField}
                    form={form}
                    onFormUpdate={updateFormSettings}
                    selectedStepId={selectedStepId}
                    onStepSelect={setSelectedStepId}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout - Grid system on large screens */}
          <div className="hidden lg:grid lg:form-builder-grid lg:h-[calc(100vh-4rem)]">
            {!previewMode && (
              <FieldPalette onOpenAIAssistant={() => setShowAIAssistant(true)} />
            )}

            <div className={previewMode ? "col-span-12" : "col-span-6"}>
              <SortableContext
                items={form.fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <FormCanvas
                  form={form}
                  selectedField={selectedField}
                  selectedStepId={selectedStepId}
                  onFieldSelect={setSelectedField}
                  onFieldUpdate={updateField}
                  onFieldDelete={deleteField}
                  onFieldDuplicate={duplicateField}
                  previewMode={previewMode}
                  onTemplateSelect={handleTemplateSelect}
                />
              </SortableContext>
            </div>

            {!previewMode && (
              <PropertiesPanel
                selectedField={selectedField}
                onFieldUpdate={updateField}
                form={form}
                onFormUpdate={updateFormSettings}
                selectedStepId={selectedStepId}
                onStepSelect={setSelectedStepId}
              />
            )}
          </div>
        </div>

        <DragOverlay>
          {draggedField ? (
            <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="text-sm font-medium">{draggedField.label}</div>
              <div className="text-xs text-muted-foreground">{draggedField.description}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      </DndWrapper>

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onFormGenerated={handleAIGenerateForm}
        onTitleUpdate={handleAITitleUpdate}
      />
      </div>
    </DndErrorBoundary>
  )
}

// Main FormBuilder component with history provider
export function FormBuilder() {
  const initialForm: Form = {
    id: generateId(),
    title: 'Untitled Form',
    description: '',
    fields: [],
    steps: [
      {
        id: generateId(),
        title: 'Step 1',
        description: '',
        fields: [],
        order: 0
      }
    ],
    isMultiStep: false,
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      allowMultipleSubmissions: true,
      collectEmail: false,
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        borderRadius: 'md',
        spacing: 'normal'
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return (
    <FormHistoryProvider initialForm={initialForm}>
      <FormBuilderInner />
    </FormHistoryProvider>
  )
}
