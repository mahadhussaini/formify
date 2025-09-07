'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { FIELD_TEMPLATES } from '@/lib/fieldTemplates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Type, Mail, Hash, Phone, Link, Lock, AlignLeft, ChevronDown,
  Circle, CheckSquare, Calendar, Clock, CalendarClock, Upload,
  Minus, Palette
} from 'lucide-react'

const iconMap = {
  Type, Mail, Hash, Phone, Link, Lock, AlignLeft, ChevronDown,
  Circle, CheckSquare, Calendar, Clock, CalendarClock, Upload,
  Minus, Palette
}

interface DraggableFieldProps {
  template: typeof FIELD_TEMPLATES[0]
}

function DraggableField({ template }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.type}`,
    data: {
      isTemplate: true,
      type: template.type,
      label: template.label,
      description: template.description
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Type

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        draggable-field p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent
        transition-all duration-200 cursor-move select-none touch-manipulation
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}
      `}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-md flex items-center justify-center">
          <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-medium text-foreground truncate">
            {template.label}
          </div>
          <div className="text-xs text-muted-foreground truncate hidden sm:block">
            {template.description}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldPaletteProps {
  onOpenAIAssistant?: () => void
}

export function FieldPalette({ onOpenAIAssistant }: FieldPaletteProps) {
  const basicFields = FIELD_TEMPLATES.slice(0, 8)
  const advancedFields = FIELD_TEMPLATES.slice(8)

  return (
    <div className="field-palette overflow-y-auto p-2 sm:p-4">
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Basic Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {basicFields.map((template) => (
              <DraggableField key={template.type} template={template} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Advanced Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {advancedFields.map((template) => (
              <DraggableField key={template.type} template={template} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm font-medium text-primary mb-2">
                🤖 Describe your form
              </div>
              <div className="text-xs text-muted-foreground">
                Tell the AI what kind of form you want to create, and it will automatically generate the fields for you.
              </div>
              <button
                onClick={onOpenAIAssistant}
                className="mt-3 text-xs text-primary hover:text-primary/80 font-medium touch-manipulation"
              >
                Try AI Assistant →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
