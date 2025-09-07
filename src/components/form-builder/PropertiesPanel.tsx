'use client'

import React, { useState } from 'react'
import { Form, FormField, FieldType, FormStep } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { StepNavigation } from './StepNavigation'
import { AdvancedValidationBuilder } from '../AdvancedValidationBuilder'
import { Plus, X, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { AIValidationService } from '@/lib/ai-service'

interface PropertiesPanelProps {
  selectedField: FormField | null
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  form: Form
  onFormUpdate: (updates: Partial<Form>) => void
  selectedStepId: string | null
  onStepSelect: (stepId: string | null) => void
}

export function PropertiesPanel({
  selectedField,
  onFieldUpdate,
  form,
  onFormUpdate,
  selectedStepId,
  onStepSelect
}: PropertiesPanelProps) {
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [isRequestingAI, setIsRequestingAI] = useState(false)

  const handleFieldPropertyUpdate = (property: keyof FormField, value: any) => {
    if (!selectedField) return
    onFieldUpdate(selectedField.id, { [property]: value })
  }

  const handleFieldPropertiesUpdate = (properties: Partial<FormField['properties']>) => {
    if (!selectedField) return
    onFieldUpdate(selectedField.id, {
      properties: { ...selectedField.properties, ...properties }
    })
  }

  const addFieldOption = () => {
    if (!selectedField || !newOptionLabel.trim()) return

    const newOption = {
      id: generateId(),
      label: newOptionLabel.trim(),
      value: newOptionLabel.trim().toLowerCase().replace(/\s+/g, '_')
    }

    const updatedOptions = [...(selectedField.options || []), newOption]
    onFieldUpdate(selectedField.id, { options: updatedOptions })
    setNewOptionLabel('')
  }

  const removeFieldOption = (optionId: string) => {
    if (!selectedField) return
    const updatedOptions = selectedField.options?.filter(opt => opt.id !== optionId) || []
    onFieldUpdate(selectedField.id, { options: updatedOptions })
  }

  const updateFieldOption = (optionId: string, updates: { label?: string; value?: string }) => {
    if (!selectedField) return
    const updatedOptions = selectedField.options?.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    ) || []
    onFieldUpdate(selectedField.id, { options: updatedOptions })
  }

  const requestAIValidation = async () => {
    if (!selectedField) return

    setIsRequestingAI(true)
    try {
      const suggestions = await AIValidationService.suggestValidationForField(selectedField)
      setAiSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to get AI validation suggestions:', error)
      setAiSuggestions(null)
    } finally {
      setIsRequestingAI(false)
    }
  }

  const applyAISuggestions = () => {
    if (!selectedField || !aiSuggestions?.suggestions) return

    const updates: Partial<FormField> = {}

    // Apply validation rules
    if (aiSuggestions.suggestions.validationRules?.length > 0) {
      updates.validation = [
        ...(selectedField.validation || []),
        ...aiSuggestions.suggestions.validationRules
      ]
    }

    // Apply label improvement
    if (aiSuggestions.suggestions.improvedLabel) {
      updates.label = aiSuggestions.suggestions.improvedLabel
    }

    // Apply placeholder improvement
    if (aiSuggestions.suggestions.improvedPlaceholder) {
      updates.placeholder = aiSuggestions.suggestions.improvedPlaceholder
    }

    if (Object.keys(updates).length > 0) {
      onFieldUpdate(selectedField.id, updates)
    }

    setAiSuggestions(null)
  }

  const handleStepsUpdate = (steps: FormStep[]) => {
    onFormUpdate({ steps })
  }

  const handleMultiStepToggle = (isMultiStep: boolean) => {
    onFormUpdate({ isMultiStep })
  }

  const handleStepReorder = (fromIndex: number, toIndex: number) => {
    const newSteps = [...form.steps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)

    // Update order numbers
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }))

    handleStepsUpdate(updatedSteps)
  }

  return (
    <div className="properties-panel overflow-y-auto p-2 sm:p-4">
      <Tabs defaultValue="field" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
          <TabsTrigger value="field" className="text-xs sm:text-sm">Field</TabsTrigger>
          <TabsTrigger value="steps" className="text-xs sm:text-sm">Steps</TabsTrigger>
          <TabsTrigger value="form" className="text-xs sm:text-sm">Form</TabsTrigger>
        </TabsList>

        <TabsContent value="field" className="space-y-4">
          {!selectedField ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Select a field to edit
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on any field in the form to configure its properties
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Basic Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="field-label">Label</Label>
                    <Input
                      id="field-label"
                      value={selectedField.label}
                      onChange={(e) => handleFieldPropertyUpdate('label', e.target.value)}
                      placeholder="Enter field label"
                    />
                  </div>

                  <div>
                    <Label htmlFor="field-name">Name</Label>
                    <Input
                      id="field-name"
                      value={selectedField.name}
                      onChange={(e) => handleFieldPropertyUpdate('name', e.target.value)}
                      placeholder="Enter field name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="field-description">Description (optional)</Label>
                    <Textarea
                      id="field-description"
                      value={selectedField.description || ''}
                      onChange={(e) => handleFieldPropertyUpdate('description', e.target.value)}
                      placeholder="Enter field description"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
                    <Input
                      id="field-placeholder"
                      value={selectedField.placeholder || ''}
                      onChange={(e) => handleFieldPropertyUpdate('placeholder', e.target.value)}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="field-required"
                      checked={selectedField.required}
                      onCheckedChange={(checked) => handleFieldPropertyUpdate('required', checked)}
                    />
                    <Label htmlFor="field-required">Required field</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Field-specific Properties */}
              {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {selectedField.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Input
                            value={option.label}
                            onChange={(e) => updateFieldOption(option.id, { label: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFieldOption(option.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Input
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        placeholder="Add new option"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addFieldOption()
                          }
                        }}
                      />
                      <Button onClick={addFieldOption} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Text Field Properties */}
              {['text', 'email', 'password', 'url', 'phone'].includes(selectedField.type) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Text Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-length">Min Length</Label>
                        <Input
                          id="min-length"
                          type="number"
                          value={selectedField.properties.minLength || ''}
                          onChange={(e) => handleFieldPropertiesUpdate({
                            minLength: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-length">Max Length</Label>
                        <Input
                          id="max-length"
                          type="number"
                          value={selectedField.properties.maxLength || ''}
                          onChange={(e) => handleFieldPropertiesUpdate({
                            maxLength: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                          placeholder="255"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Number Field Properties */}
              {selectedField.type === 'number' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Number Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-value">Min Value</Label>
                        <Input
                          id="min-value"
                          type="number"
                          value={selectedField.properties.min || ''}
                          onChange={(e) => handleFieldPropertiesUpdate({
                            min: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-value">Max Value</Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={selectedField.properties.max || ''}
                          onChange={(e) => handleFieldPropertiesUpdate({
                            max: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="step">Step</Label>
                      <Input
                        id="step"
                        type="number"
                        value={selectedField.properties.step || ''}
                        onChange={(e) => handleFieldPropertiesUpdate({
                          step: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Field Properties */}
              {selectedField.type === 'file' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="accept">Accept Types</Label>
                      <Input
                        id="accept"
                        value={selectedField.properties.accept || ''}
                        onChange={(e) => handleFieldPropertiesUpdate({
                          accept: e.target.value || undefined
                        })}
                        placeholder="e.g., .pdf,.doc,.jpg"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multiple-files"
                        checked={selectedField.properties.multiple || false}
                        onCheckedChange={(checked) => handleFieldPropertiesUpdate({
                          multiple: checked
                        })}
                      />
                      <Label htmlFor="multiple-files">Allow multiple files</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advanced Validation */}
              <AdvancedValidationBuilder
                validationRules={selectedField?.validation || []}
                onRulesChange={(rules) => onFieldUpdate(selectedField!.id, { validation: rules })}
                availableFields={form.fields.map(f => ({ name: f.name, label: f.label, type: f.type }))}
                onAIValidation={requestAIValidation}
              />

              {/* AI Validation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Validation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!aiSuggestions ? (
                    <Button
                      onClick={requestAIValidation}
                      disabled={isRequestingAI}
                      className="w-full"
                      variant="outline"
                    >
                      {isRequestingAI ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isRequestingAI ? 'Getting suggestions...' : 'Suggest Smart Validation'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Suggestions Ready</span>
                      </div>

                      {aiSuggestions.suggestions?.validationRules?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Validation Rules:</h4>
                          <div className="space-y-1">
                            {aiSuggestions.suggestions.validationRules.map((rule: any, index: number) => (
                              <div key={index} className="text-xs bg-muted p-2 rounded">
                                <Badge variant="secondary" className="mr-2">{rule.type}</Badge>
                                {rule.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiSuggestions.suggestions?.improvedLabel && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggested Label:</h4>
                          <div className="text-xs bg-muted p-2 rounded">
                            &ldquo;{aiSuggestions.suggestions.improvedLabel}&rdquo;
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button onClick={applyAISuggestions} size="sm" className="flex-1">
                          Apply Suggestions
                        </Button>
                        <Button
                          onClick={() => setAiSuggestions(null)}
                          variant="outline"
                          size="sm"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Let AI suggest appropriate validation rules based on your field type and content
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          <StepNavigation
            steps={form.steps}
            isMultiStep={form.isMultiStep}
            selectedStepId={selectedStepId}
            onStepSelect={onStepSelect}
            onStepsUpdate={handleStepsUpdate}
            onMultiStepToggle={handleMultiStepToggle}
            onStepReorder={handleStepReorder}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={form.description || ''}
                  onChange={(e) => onFormUpdate({ description: e.target.value })}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="submit-button-text">Submit Button Text</Label>
                <Input
                  id="submit-button-text"
                  value={form.settings.submitButtonText}
                  onChange={(e) => onFormUpdate({
                    settings: { ...form.settings, submitButtonText: e.target.value }
                  })}
                  placeholder="Submit"
                />
              </div>

              <div>
                <Label htmlFor="success-message">Success Message</Label>
                <Textarea
                  id="success-message"
                  value={form.settings.successMessage}
                  onChange={(e) => onFormUpdate({
                    settings: { ...form.settings, successMessage: e.target.value }
                  })}
                  placeholder="Thank you for your submission!"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-multiple"
                  checked={form.settings.allowMultipleSubmissions}
                  onCheckedChange={(checked) => onFormUpdate({
                    settings: { ...form.settings, allowMultipleSubmissions: checked }
                  })}
                />
                <Label htmlFor="allow-multiple">Allow multiple submissions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="collect-email"
                  checked={form.settings.collectEmail}
                  onCheckedChange={(checked) => onFormUpdate({
                    settings: { ...form.settings, collectEmail: checked }
                  })}
                />
                <Label htmlFor="collect-email">Collect respondent email</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
