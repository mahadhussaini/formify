'use client'

import React from 'react'
import { FormField } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  GripVertical,
  Trash2,
  Copy,
  Settings,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldComponentProps {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
  onDuplicate: () => void
  previewMode: boolean
  dragHandleProps?: any
}

export function FormFieldComponent({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  previewMode,
  dragHandleProps
}: FormFieldComponentProps) {
  const handleFieldClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!previewMode) {
      onSelect()
    }
  }

  const renderFieldInput = () => {
    const baseProps = {
      id: field.id,
      name: field.name,
      placeholder: field.placeholder,
      defaultValue: field.defaultValue,
      required: field.required,
      className: cn(
        "transition-colors",
        previewMode ? "" : "focus:ring-2 focus:ring-primary/20"
      )
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'phone':
        return (
          <Input
            {...baseProps}
            type={field.type}
            maxLength={field.properties?.maxLength}
          />
        )

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            min={field.properties?.min}
            max={field.properties?.max}
            step={field.properties?.step}
          />
        )

      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={field.properties?.rows || 4}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        )

      case 'select':
        return (
          <select
            {...baseProps}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  required={field.required}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  required={field.required}
                  className="w-4 h-4 text-primary border-border focus:ring-primary rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            {...baseProps}
            type={field.type}
          />
        )

      case 'file':
        return (
          <Input
            {...baseProps}
            type="file"
            accept={field.properties?.accept}
            multiple={field.properties?.multiple}
          />
        )

      case 'range':
        return (
          <div className="space-y-2">
            <Input
              {...baseProps}
              type="range"
              min={field.properties?.min || 0}
              max={field.properties?.max || 100}
              step={field.properties?.step || 1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.properties?.min || 0}</span>
              <span>{field.properties?.max || 100}</span>
            </div>
          </div>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              {...baseProps}
              type="color"
              className="w-16 h-10 p-1 border rounded"
            />
            <span className="text-sm text-muted-foreground">
              {field.defaultValue || '#000000'}
            </span>
          </div>
        )

      default:
        return <Input {...baseProps} />
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        {renderFieldInput()}
        {field.validation && field.validation.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>This field has validation rules</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={handleFieldClick}
      className={cn(
        "group relative p-3 sm:p-4 border rounded-lg transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Field Actions - Mobile-friendly */}
      <div className={cn(
        "absolute -top-1 sm:-top-2 -right-1 sm:-right-2 flex items-center space-x-1",
        "opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-0",
        isSelected && "opacity-100",
        "sm:opacity-0 sm:group-hover:opacity-100"
      )}>
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="p-1.5 sm:p-1 bg-background border border-border rounded cursor-move hover:bg-accent touch-manipulation"
          >
            <GripVertical className="w-4 h-4 sm:w-4 sm:h-4 text-muted-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="p-1.5 sm:p-1 h-7 w-7 sm:h-6 sm:w-6 touch-manipulation"
        >
          <Copy className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 sm:p-1 h-7 w-7 sm:h-6 sm:w-6 text-destructive hover:text-destructive touch-manipulation"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
        </Button>
      </div>

      {/* Field Content */}
      <div className="space-y-2">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <Label className="text-sm font-medium flex-1 min-w-0">
            <span className="truncate block" title={field.label}>
              {field.label}
            </span>
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="text-xs text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
            {field.type}
          </div>
        </div>

        {field.description && (
          <p className="text-xs sm:text-sm text-muted-foreground">{field.description}</p>
        )}

        <div className="pl-0 sm:pl-4">
          {renderFieldInput()}
        </div>

        {isSelected && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Tap to edit properties
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
