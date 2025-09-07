'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField } from '@/types/form'
import { FormFieldRenderer } from './FormFieldRenderer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormRendererProps {
  form: Form
  onSubmit?: (data: any) => Promise<void>
  className?: string
}

export function FormRenderer({ form, onSubmit, className }: FormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Generate Zod schema from form fields
  const generateSchema = (fields: FormField[]) => {
    const schema: Record<string, z.ZodTypeAny> = {}

    fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Please enter a valid email address')
          break
        case 'number':
          fieldSchema = z.number({
            required_error: 'This field is required',
            invalid_type_error: 'Please enter a valid number'
          })
          break
        case 'url':
          fieldSchema = z.string().url('Please enter a valid URL')
          break
        case 'phone':
          fieldSchema = z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
          break
        case 'file':
          fieldSchema = z.any()
          break
        default:
          fieldSchema = z.string()
      }

      // Apply custom validation rules
      if (field.validation) {
        field.validation.forEach(rule => {
          if (fieldSchema instanceof z.ZodString) {
            switch (rule.type) {
              case 'minLength':
                fieldSchema = fieldSchema.min(rule.value as number, rule.message)
                break
              case 'maxLength':
                fieldSchema = fieldSchema.max(rule.value as number, rule.message)
                break
              case 'pattern':
                fieldSchema = fieldSchema.regex(new RegExp(rule.value as string), rule.message)
                break
            }
          }
        })
      }

      // Required validation
      if (field.required) {
        if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`)
        }
      } else {
        fieldSchema = fieldSchema.optional()
      }

      schema[field.name] = fieldSchema
    })

    return z.object(schema)
  }

  const schema = generateSchema(form.fields)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(schema)
  })

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default local storage handling
        await handleLocalSubmission(data)
      }

      setSubmitStatus('success')
      setSubmitMessage(form.settings.successMessage)
      reset()
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Failed to submit form. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocalSubmission = async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Store in localStorage for demo purposes
    const submissions = JSON.parse(localStorage.getItem('formify_submissions') || '[]')
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      formId: form.id,
      data,
      submittedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get from server
      userAgent: navigator.userAgent
    }

    submissions.push(submission)
    localStorage.setItem('formify_submissions', JSON.stringify(submissions))
  }

  const watchedValues = watch()

  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-safe", className)}>
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Form Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{form.description}</p>
            )}
          </div>

          {/* Success/Error Messages */}
          {submitStatus !== 'idle' && (
            <div className={cn(
              "mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border",
              submitStatus === 'success'
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center space-x-2">
                {submitStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-medium">{submitMessage}</p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
            {form.fields.map((field) => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                register={register}
                errors={errors}
                setValue={setValue}
                watchedValues={watchedValues}
              />
            ))}

            {/* Submit Button */}
            <div className="flex justify-center pt-6 sm:pt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium w-full sm:w-auto min-h-[48px] sm:min-h-[44px] touch-manipulation rounded-lg"
                style={{
                  backgroundColor: form.settings.theme.primaryColor,
                  borderColor: form.settings.theme.primaryColor
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                    <span className="sm:hidden">Sending...</span>
                  </>
                ) : (
                  form.settings.submitButtonText
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
