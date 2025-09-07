'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Form, FormField } from '@/types/form'
import { FormFieldComponent } from './FormFieldComponent'
import { TemplateSelector } from '../TemplateSelector'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, Eye } from 'lucide-react'

interface FormCanvasProps {
  form: Form
  selectedField: FormField | null
  selectedStepId: string | null
  onFieldSelect: (field: FormField | null) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (field: FormField) => void
  previewMode: boolean
  onTemplateSelect?: (template: any) => void
}

interface SortableFieldProps {
  field: FormField
  selectedField: FormField | null
  onFieldSelect: (field: FormField) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (field: FormField) => void
  previewMode: boolean
}

function SortableField({
  field,
  selectedField,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
  previewMode
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { isField: true }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <FormFieldComponent
        field={field}
        isSelected={selectedField?.id === field.id}
        onSelect={() => onFieldSelect(field)}
        onUpdate={(updates) => onFieldUpdate(field.id, updates)}
        onDelete={() => onFieldDelete(field.id)}
        onDuplicate={() => onFieldDuplicate(field)}
        previewMode={previewMode}
        dragHandleProps={!previewMode ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  )
}

export function FormCanvas({
  form,
  selectedField,
  selectedStepId,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
  previewMode,
  onTemplateSelect
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas'
  })

  const handleCanvasClick = () => {
    onFieldSelect(null)
  }

  // Get fields for the current step or all fields if not multi-step
  const getFieldsForCurrentStep = () => {
    if (!form.isMultiStep || !selectedStepId) {
      return form.fields
    }

    const currentStep = form.steps.find(step => step.id === selectedStepId)
    if (!currentStep) return form.fields

    return form.fields.filter(field => currentStep.fields.includes(field.id))
  }

  const currentStep = form.isMultiStep && selectedStepId
    ? form.steps.find(step => step.id === selectedStepId)
    : null

  const currentFields = getFieldsForCurrentStep()

  return (
    <div className="form-canvas overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Form Title */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-sm sm:text-base text-muted-foreground">{form.description}</p>
              )}

              {/* Step Header */}
              {currentStep && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-primary">
                        {currentStep.title}
                      </h2>
                      {currentStep.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {currentStep.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                      Step {currentStep.order + 1} of {form.steps.length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div
              ref={setNodeRef}
              onClick={handleCanvasClick}
              className={`
                space-y-4 sm:space-y-6 min-h-[300px] sm:min-h-[400px] relative
                ${isOver ? 'drop-zone-active' : ''}
              `}
            >
              {currentFields.length === 0 ? (
                <div className="drop-zone flex items-center justify-center py-12 sm:py-16">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      {previewMode
                        ? 'No fields to preview'
                        : currentStep
                          ? `Add fields to "${currentStep.title}"`
                          : 'Start building your form'
                      }
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                      {previewMode
                        ? 'Add some fields to see the preview'
                        : 'Drag and drop fields from the palette to get started'
                      }
                    </p>
                    {!previewMode && onTemplateSelect && (
                      <div className="space-y-3">
                        <TemplateSelector
                          onTemplateSelect={onTemplateSelect}
                          trigger={
                            <Button variant="outline" className="w-full">
                              <Plus className="w-4 h-4 mr-2" />
                              Start with Template
                            </Button>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Or drag fields from the left panel
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {currentFields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      selectedField={selectedField}
                      onFieldSelect={onFieldSelect}
                      onFieldUpdate={onFieldUpdate}
                      onFieldDelete={onFieldDelete}
                      onFieldDuplicate={onFieldDuplicate}
                      previewMode={previewMode}
                    />
                  ))}

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6 sm:pt-8">
                    <Button
                      type="submit"
                      className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
                      style={{
                        backgroundColor: form.settings.theme.primaryColor
                      }}
                    >
                      {form.settings.submitButtonText}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Preview Mode Indicator */}
        {previewMode && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-lg">
              <Eye className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Preview Mode</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
