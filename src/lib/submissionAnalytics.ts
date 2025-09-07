import { FormSubmission, SubmissionAnalytics, Form } from '@/types/form'

// Utility functions for analyzing form submissions
export class SubmissionAnalyticsEngine {
  static calculateAnalytics(submissions: FormSubmission[], form: Form): SubmissionAnalytics {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Basic counts
    const totalSubmissions = submissions.length
    const submissionsToday = submissions.filter(s =>
      new Date(s.submittedAt) >= today
    ).length
    const submissionsThisWeek = submissions.filter(s =>
      new Date(s.submittedAt) >= weekAgo
    ).length
    const submissionsThisMonth = submissions.filter(s =>
      new Date(s.submittedAt) >= monthAgo
    ).length

    // Completion rate (assuming all submissions are complete for now)
    const completionRate = totalSubmissions > 0 ? 100 : 0

    // Field completion rates
    const fieldCompletionRates: Record<string, number> = {}
    form.fields.forEach(field => {
      const completedCount = submissions.filter(submission => {
        const value = submission.data[field.name]
        return value !== null && value !== undefined && value !== ''
      }).length
      fieldCompletionRates[field.name] = totalSubmissions > 0
        ? (completedCount / totalSubmissions) * 100
        : 0
    })

    // Device breakdown
    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    }

    submissions.forEach(submission => {
      const userAgent = submission.userAgent || ''
      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        deviceBreakdown.mobile++
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceBreakdown.tablet++
      } else {
        deviceBreakdown.desktop++
      }
    })

    // Browser breakdown
    const browserBreakdown: Record<string, number> = {}
    submissions.forEach(submission => {
      const userAgent = submission.userAgent || ''
      let browser = 'Unknown'

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome'
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox'
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari'
      } else if (userAgent.includes('Edg')) {
        browser = 'Edge'
      } else if (userAgent.includes('Opera')) {
        browser = 'Opera'
      }

      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1
    })

    return {
      totalSubmissions,
      submissionsToday,
      submissionsThisWeek,
      submissionsThisMonth,
      averageCompletionTime: 0, // This would need actual timing data
      completionRate,
      fieldCompletionRates,
      deviceBreakdown,
      browserBreakdown
    }
  }

  static filterSubmissions(
    submissions: FormSubmission[],
    filters: {
      dateRange?: { start: Date; end: Date }
      status?: string[]
      search?: string
      fieldFilters?: Record<string, any>
    }
  ): FormSubmission[] {
    return submissions.filter(submission => {
      // Date range filter
      if (filters.dateRange) {
        const submissionDate = new Date(submission.submittedAt)
        if (submissionDate < filters.dateRange.start || submissionDate > filters.dateRange.end) {
          return false
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(submission.status || 'new')) {
          return false
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const dataString = JSON.stringify(submission.data).toLowerCase()
        if (!dataString.includes(searchLower)) {
          return false
        }
      }

      // Field-specific filters
      if (filters.fieldFilters) {
        for (const [fieldName, filterValue] of Object.entries(filters.fieldFilters)) {
          if (filterValue && submission.data[fieldName] !== filterValue) {
            return false
          }
        }
      }

      return true
    })
  }

  static exportSubmissions(
    submissions: FormSubmission[],
    form: Form,
    format: 'csv' | 'json' = 'csv'
  ): string {
    if (format === 'json') {
      return JSON.stringify(submissions, null, 2)
    }

    // CSV export
    const headers = [
      'Submission ID',
      'Submitted At',
      'Status',
      'IP Address',
      ...form.fields.map(field => field.label)
    ]

    const rows = submissions.map(submission => [
      submission.id,
      new Date(submission.submittedAt).toLocaleString(),
      submission.status || 'new',
      submission.ipAddress || '',
      ...form.fields.map(field => {
        const value = submission.data[field.name]
        if (Array.isArray(value)) {
          return value.join('; ')
        }
        return value || ''
      })
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  static getSubmissionTrends(submissions: FormSubmission[], days: number = 30): Array<{
    date: string
    count: number
  }> {
    const trends: Record<string, number> = {}
    const now = new Date()

    // Initialize last N days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      trends[dateKey] = 0
    }

    // Count submissions per day
    submissions.forEach(submission => {
      const date = new Date(submission.submittedAt).toISOString().split('T')[0]
      if (trends[date] !== undefined) {
        trends[date]++
      }
    })

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  static detectSubmissionPatterns(submissions: FormSubmission[]): {
    peakHours: number[]
    commonValues: Record<string, Record<string, number>>
    completionTimes: number[]
  } {
    const peakHours: Record<number, number> = {}
    const commonValues: Record<string, Record<string, number>> = {}
    const completionTimes: number[] = []

    submissions.forEach(submission => {
      // Peak hours
      const hour = new Date(submission.submittedAt).getHours()
      peakHours[hour] = (peakHours[hour] || 0) + 1

      // Common values per field
      Object.entries(submission.data).forEach(([fieldName, value]) => {
        if (!commonValues[fieldName]) {
          commonValues[fieldName] = {}
        }

        const valueStr = Array.isArray(value) ? value.join('; ') : String(value || '')
        if (valueStr) {
          commonValues[fieldName][valueStr] = (commonValues[fieldName][valueStr] || 0) + 1
        }
      })
    })

    const topPeakHours = Object.entries(peakHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    return {
      peakHours: topPeakHours,
      commonValues,
      completionTimes
    }
  }
}
