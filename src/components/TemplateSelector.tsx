'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import {
  FORM_TEMPLATES,
  TEMPLATE_CATEGORIES,
  FormTemplate,
  createFormFromTemplate,
  getTemplatesByCategory,
  searchTemplates
} from '@/lib/formTemplates'
import {
  Mail,
  Briefcase,
  Calendar,
  MessageCircle,
  BarChart3,
  Search,
  Clock,
  Wand2,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  onTemplateSelect: (template: FormTemplate) => void
  trigger?: React.ReactNode
}

const iconMap = {
  Mail,
  Briefcase,
  Calendar,
  MessageCircle,
  BarChart3
}

export function TemplateSelector({ onTemplateSelect, trigger }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : getTemplatesByCategory(selectedCategory)

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template)
  }

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate)
      setIsDialogOpen(false)
      setSelectedTemplate(null)
      setSearchQuery('')
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <Wand2 className="w-4 h-4 mr-2" />
      Start with Template
    </Button>
  )

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>Choose a Template</span>
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built template and customize it to your needs
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {TEMPLATE_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-96">
                {filteredTemplates.map((template) => {
                  const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Mail
                  const isSelected = selectedTemplate?.id === template.id

                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{template.fields.length} fields</span>
                            {template.isMultiStep && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                Multi-step
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    No templates found
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search or category filter
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <span>Selected Template:</span>
                  <span className="font-medium">{selectedTemplate.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span>{selectedTemplate.fields.length} fields</span>
                      <span>{selectedTemplate.estimatedTime} setup</span>
                      {selectedTemplate.isMultiStep && (
                        <Badge variant="outline" className="text-xs">Multi-step form</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedTemplate}
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
