'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FormRenderer } from '@/components/FormRenderer'
import { Form } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, ExternalLink, Share, Download } from 'lucide-react'
import Link from 'next/link'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
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
    console.log('Form submitted:', data)

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

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    // In a real app, show a toast notification
    alert('Link copied to clipboard!')
  }

  const handleExport = () => {
    if (!form) return

    // Export form configuration as JSON
    const dataStr = JSON.stringify(form, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `${form.title.replace(/\s+/g, '_').toLowerCase()}_form.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
          <CardHeader>
            <CardTitle className="text-center">Form Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The form you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form Builder
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 gap-4 sm:gap-0 min-h-[4rem]">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Editor</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">Form Preview</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Test how your form will look and behave
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-initial">
                <Share className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-initial">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" asChild className="flex-1 sm:flex-initial">
                <a href={`/embed/${form.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Live View</span>
                  <span className="sm:hidden">Live</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <FormRenderer
          form={form}
          onSubmit={handleFormSubmit}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built with Formify - Smart Form Builder with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
