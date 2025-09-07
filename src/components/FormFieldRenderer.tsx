'use client'

import React from 'react'
import { UseFormRegister, FieldErrors, UseFormSetValue, Path } from 'react-hook-form'
import { FormField } from '@/types/form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

interface FormFieldRendererProps<T extends Record<string, any>> {
  field: FormField
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
  watchedValues: Record<string, any>
}

export function FormFieldRenderer<T extends Record<string, any>>({
  field,
  register,
  errors,
  setValue,
  watchedValues
}: FormFieldRendererProps<T>) {
  const fieldName = field.name as Path<T>
  const fieldError = errors[fieldName]?.message as string

  const renderFieldInput = () => {
    const baseProps = {
      ...register(fieldName),
      id: field.id,
      placeholder: field.placeholder,
      className: cn(
        "transition-colors",
        fieldError && "border-red-500 focus-visible:ring-red-500"
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
            maxLength={field.properties.maxLength}
          />
        )

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            min={field.properties.min}
            max={field.properties.max}
            step={field.properties.step}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={field.properties.rows || 4}
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
                  {...register(fieldName)}
                  type="radio"
                  value={option.value}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        if (field.options && field.options.length > 1) {
          // Multiple checkboxes
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register(`${fieldName}.${option.value}` as Path<T>)}
                    type="checkbox"
                    value={option.value}
                    className="w-4 h-4 text-primary border-border focus:ring-primary rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          )
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <input
                {...register(fieldName)}
                type="checkbox"
                className="w-4 h-4 text-primary border-border focus:ring-primary rounded"
              />
              <span className="text-sm">{field.label}</span>
            </div>
          )
        }

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
            accept={field.properties.accept}
            multiple={field.properties.multiple}
          />
        )

      case 'range':
        return (
          <div className="space-y-2">
            <Input
              {...baseProps}
              type="range"
              min={field.properties.min || 0}
              max={field.properties.max || 100}
              step={field.properties.step || 1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.properties.min || 0}</span>
              <span>{field.properties.max || 100}</span>
            </div>
            {watchedValues[field.name] && (
              <div className="text-center text-sm font-medium">
                Current value: {watchedValues[field.name]}
              </div>
            )}
          </div>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <Input
              {...baseProps}
              type="color"
              className="w-16 h-10 p-1 border rounded"
            />
            {watchedValues[field.name] && (
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: watchedValues[field.name] }}
                />
                <span className="text-sm text-muted-foreground">
                  {watchedValues[field.name]}
                </span>
              </div>
            )}
          </div>
        )

      default:
        return <Input {...baseProps} />
    }
  }

  // For single checkbox, don't show label separately
  if (field.type === 'checkbox' && (!field.options || field.options.length <= 1)) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {renderFieldInput()}
        </div>
        {fieldError && (
          <p className="text-sm text-red-600">{fieldError}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.description && (
        <p className="text-xs sm:text-sm text-muted-foreground">{field.description}</p>
      )}

      {renderFieldInput()}

      {fieldError && (
        <p className="text-xs sm:text-sm text-red-600">{fieldError}</p>
      )}
    </div>
  )
}
