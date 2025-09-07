'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FormSubmission, Form, SubmissionAnalytics } from '@/types/form'
import { SubmissionAnalyticsEngine } from '@/lib/submissionAnalytics'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import {
  BarChart3,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Archive,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormAnalytics } from '@/components/FormAnalytics'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const formId = searchParams.get('formId')

  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [analytics, setAnalytics] = useState<SubmissionAnalytics | null>(null)
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const itemsPerPage = 10

  const loadData = useCallback(async () => {
    try {
      // Load form data
      const savedForms = JSON.parse(localStorage.getItem('formify_forms') || '[]')
      const foundForm = savedForms.find((f: Form) => f.id === formId)
      if (foundForm) {
        setForm(foundForm)
      }

      // Load submissions
      const savedSubmissions = JSON.parse(localStorage.getItem('formify_submissions') || '[]')
      const formSubmissions = savedSubmissions.filter((s: FormSubmission) => s.formId === formId)
      setSubmissions(formSubmissions)

      // Calculate analytics
      if (foundForm) {
        const analyticsData = SubmissionAnalyticsEngine.calculateAnalytics(formSubmissions, foundForm)
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [formId])

  const filterSubmissions = useCallback(() => {
    let filtered = [...submissions]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(submission =>
        JSON.stringify(submission.data).toLowerCase().includes(query) ||
        submission.id.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => (submission.status || 'new') === statusFilter)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(submission => new Date(submission.submittedAt) >= startDate)
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    setFilteredSubmissions(filtered)
    setCurrentPage(1)
  }, [submissions, searchQuery, statusFilter, dateRange])

  useEffect(() => {
    if (!formId) {
      router.push('/')
      return
    }

    loadData()
  }, [formId, router, loadData]) // Added loadData to dependencies

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchQuery, statusFilter, dateRange, filterSubmissions]) // Added filterSubmissions to dependencies

  const updateSubmissionStatus = (submissionId: string, status: 'new' | 'read' | 'archived') => {
    const updatedSubmissions = submissions.map(sub =>
      sub.id === submissionId ? { ...sub, status } : sub
    )
    setSubmissions(updatedSubmissions)
    localStorage.setItem('formify_submissions', JSON.stringify(updatedSubmissions))
  }

  const exportSubmissions = (format: 'csv' | 'json') => {
    if (!form) return

    const data = SubmissionAnalyticsEngine.exportSubmissions(filteredSubmissions, form, format)
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${form.title}_submissions.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'read': return 'secondary'
      case 'archived': return 'outline'
      default: return 'default'
    }
  }

  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <Button onClick={() => router.push('/')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="min-h-[44px] touch-manipulation">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Editor</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">{form.title}</h1>
                <p className="text-sm text-muted-foreground">Submission Dashboard</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSubmissions('csv')}
                className="flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSubmissions('json')}
                className="flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Export JSON</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
            <TabsTrigger value="overview" className="text-xs sm:text-sm min-h-[44px] touch-manipulation">Overview</TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs sm:text-sm min-h-[44px] touch-manipulation">Submissions</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm min-h-[44px] touch-manipulation">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalSubmissions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.submissionsToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.submissionsThisWeek || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.submissionsThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.completionRate.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Form completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.averageCompletionTime ? `${Math.round(analytics.averageCompletionTime)}s` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average completion time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">
                          Submission #{submission.id.slice(-6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(submission.status)}>
                        {submission.status || 'new'}
                      </Badge>
                    </div>
                  ))}

                  {submissions.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        No submissions yet
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Submissions will appear here once people start filling out your form.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search submissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 min-h-[44px] touch-manipulation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="min-h-[44px] touch-manipulation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="min-h-[44px] touch-manipulation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Submissions ({filteredSubmissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {paginatedSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer touch-manipulation"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                          <span className="font-medium text-sm truncate">
                            Submission #{submission.id.slice(-6)}
                          </span>
                          <Badge variant={getStatusBadgeVariant(submission.status)} className="w-fit">
                            {submission.status || 'new'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {Object.entries(submission.data).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="block sm:inline">
                              {key}: {Array.isArray(value) ? value.join(', ') : String(value || '').slice(0, 30)}
                            </span>
                          )).reduce((prev, curr, index) => (
                            <>{prev}{index > 0 && <span className="hidden sm:inline"> • </span>}{curr}</>
                          ), <></>)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateSubmissionStatus(submission.id, 'read')
                          }}
                          className="min-h-[44px] touch-manipulation"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Mark Read</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateSubmissionStatus(submission.id, 'archived')
                          }}
                          className="min-h-[44px] touch-manipulation"
                        >
                          <Archive className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Archive</span>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredSubmissions.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        No submissions found
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your filters or check back later.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSubmissions.length)} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of{' '}
                      {filteredSubmissions.length} submissions
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {form && submissions && analytics && (
              <FormAnalytics
                form={form}
                submissions={submissions}
                analytics={analytics}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Submission Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Submission Details</DialogTitle>
            <DialogDescription className="text-sm">
              Submitted on {selectedSubmission ? new Date(selectedSubmission.submittedAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Badge variant={getStatusBadgeVariant(selectedSubmission.status)} className="w-fit">
                  {selectedSubmission.status || 'new'}
                </Badge>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'read')}
                    className="min-h-[44px] touch-manipulation"
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'archived')}
                    className="min-h-[44px] touch-manipulation"
                  >
                    Archive
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {form.fields.map(field => {
                  const value = selectedSubmission.data[field.name]
                  return (
                    <div key={field.name} className="p-3 sm:p-4 border rounded-lg">
                      <div className="font-medium text-sm sm:text-base mb-2">{field.label}</div>
                      <div className="text-sm sm:text-base text-muted-foreground break-words">
                        {Array.isArray(value)
                          ? value.join(', ')
                          : value || <em className="text-muted-foreground">Not provided</em>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
                <div className="break-all">IP Address: {selectedSubmission.ipAddress || 'N/A'}</div>
                <div className="break-all">User Agent: {selectedSubmission.userAgent || 'N/A'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
