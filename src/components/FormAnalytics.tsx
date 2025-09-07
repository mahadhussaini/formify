'use client'

import React, { useMemo } from 'react'
import { FormSubmission, Form, SubmissionAnalytics } from '@/types/form'
import { SubmissionAnalyticsEngine } from '@/lib/submissionAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Chrome
} from 'lucide-react'

interface FormAnalyticsProps {
  form: Form
  submissions: FormSubmission[]
  analytics: SubmissionAnalytics
}

const browserIcons: Record<string, React.ComponentType<any>> = {
  Chrome,
  Firefox: Monitor, // Use Monitor as fallback for Firefox
  Safari: Monitor, // Use Monitor as fallback for Safari
  Edge: Monitor,
  Opera: Monitor,
  Unknown: Monitor
}

export function FormAnalytics({ form, submissions, analytics }: FormAnalyticsProps) {
  const trends = useMemo(() =>
    SubmissionAnalyticsEngine.getSubmissionTrends(submissions, 7),
    [submissions]
  )

  const patterns = useMemo(() =>
    SubmissionAnalyticsEngine.detectSubmissionPatterns(submissions),
    [submissions]
  )

  const maxTrendValue = Math.max(...trends.map(t => t.count))

  return (
    <div className="space-y-6">
      {/* Submission Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Submission Trends (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2 h-32">
            {trends.map((trend, index) => (
              <div key={trend.date} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className="w-8 bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                    style={{
                      height: maxTrendValue > 0 ? `${(trend.count / maxTrendValue) * 100}%` : '4px',
                      minHeight: '4px'
                    }}
                    title={`${trend.date}: ${trend.count} submissions`}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  <div>{new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="font-medium">{trend.count}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>Device Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Desktop</span>
              </div>
              <div className="flex items-center space-x-4">
                <Progress
                  value={(analytics.deviceBreakdown.desktop / Math.max(analytics.totalSubmissions, 1)) * 100}
                  className="w-20"
                />
                <span className="text-sm font-medium w-8 text-right">
                  {analytics.deviceBreakdown.desktop}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Mobile</span>
              </div>
              <div className="flex items-center space-x-4">
                <Progress
                  value={(analytics.deviceBreakdown.mobile / Math.max(analytics.totalSubmissions, 1)) * 100}
                  className="w-20"
                />
                <span className="text-sm font-medium w-8 text-right">
                  {analytics.deviceBreakdown.mobile}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tablet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Tablet</span>
              </div>
              <div className="flex items-center space-x-4">
                <Progress
                  value={(analytics.deviceBreakdown.tablet / Math.max(analytics.totalSubmissions, 1)) * 100}
                  className="w-20"
                />
                <span className="text-sm font-medium w-8 text-right">
                  {analytics.deviceBreakdown.tablet}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Browser Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Chrome className="w-5 h-5" />
              <span>Browser Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.browserBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]) => {
                  const BrowserIcon = browserIcons[browser] || browserIcons.Unknown
                  const percentage = (count / Math.max(analytics.totalSubmissions, 1)) * 100

                  return (
                    <div key={browser} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BrowserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{browser}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-16" />
                        <span className="text-sm font-medium w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Field Completion Rates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.fieldCompletionRates)
              .sort(([,a], [,b]) => b - a)
              .map(([fieldName, rate]) => {
                const field = form.fields.find(f => f.name === fieldName)
                const isRequired = field?.required

                return (
                  <div key={fieldName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {field?.label || fieldName}
                        </span>
                        {isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {field?.type}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {rate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      {patterns.peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Peak Submission Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {patterns.peakHours.slice(0, 3).map((hour, index) => (
                <div key={hour} className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {index === 0 ? 'Most Active' : index === 1 ? '2nd Most' : '3rd Most'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Values */}
      {Object.keys(patterns.commonValues).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Most Common Responses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(patterns.commonValues).slice(0, 6).map(([fieldName, values]) => {
                const field = form.fields.find(f => f.name === fieldName)
                const topValues = Object.entries(values)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)

                if (topValues.length === 0) return null

                return (
                  <div key={fieldName} className="space-y-2">
                    <h4 className="text-sm font-medium">
                      {field?.label || fieldName}
                    </h4>
                    <div className="space-y-1">
                      {topValues.map(([value, count], index) => (
                        <div key={value} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2" title={value}>
                            {value || <em className="text-muted-foreground">Empty</em>}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {count}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
