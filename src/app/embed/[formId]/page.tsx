'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { FormRenderer } from '@/components/FormRenderer'
import { Form } from '@/types/form'
import { Card, CardContent } from '@/components/ui/Card'

export default function EmbedPage() {
  const params = useParams()
  const formId = params.formId as string
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (formId) {
      // In a real app, fetch form from API
      // For demo, load from localStorage
      const savedForms = JSON.parse(localStorage.getItem('formify_forms') || '[]')
      const foundForm = savedForms.find((f: Form) => f.id === formId)
      if (foundForm) {
        setForm(foundForm)
      }
    }
    setIsLoading(false)
  }, [formId])

  const handleFormSubmit = async (data: any) => {
    console.log('Embedded form submitted:', data)

    // Store submission
    const submissions = JSON.parse(localStorage.getItem('formify_submissions') || '[]')
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      formId: form?.id,
      data,
      submittedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    }

    submissions.push(submission)
    localStorage.setItem('formify_submissions', JSON.stringify(submissions))

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">
              The form you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-2 sm:px-4 lg:px-6">
      <FormRenderer
        form={form}
        onSubmit={handleFormSubmit}
        className="px-2 sm:px-4"
      />
    </div>
  )
}
