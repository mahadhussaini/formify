'use client'

import React, { useState } from 'react'
import { ValidationRule } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdvancedValidationEngine } from '@/lib/advancedValidation'

interface AdvancedValidationBuilderProps {
  validationRules: ValidationRule[]
  onRulesChange: (rules: ValidationRule[]) => void
  availableFields?: Array<{ name: string; label: string; type: string }>
  onAIValidation?: () => void
}

interface ValidationRuleFormData {
  type: ValidationRule['type']
  value?: any
  message: string
  condition?: ValidationRule['condition']
  compareWith?: ValidationRule['compareWith']
  range?: ValidationRule['range']
  customFunction?: string
  customParams?: Record<string, any>
}

export function AdvancedValidationBuilder({
  validationRules,
  onRulesChange,
  availableFields = [],
  onAIValidation
}: AdvancedValidationBuilderProps) {
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null)
  const [ruleFormData, setRuleFormData] = useState<ValidationRuleFormData>({
    type: 'required',
    message: ''
  })

  const validationTypes = [
    { value: 'required', label: 'Required', description: 'Field must have a value' },
    { value: 'minLength', label: 'Minimum Length', description: 'Text must be at least X characters' },
    { value: 'maxLength', label: 'Maximum Length', description: 'Text must be at most X characters' },
    { value: 'pattern', label: 'Pattern (Regex)', description: 'Text must match a pattern' },
    { value: 'conditional', label: 'Conditional', description: 'Required only when condition is met' },
    { value: 'comparison', label: 'Compare with Field', description: 'Compare value with another field' },
    { value: 'range', label: 'Range', description: 'Value must be within a range' },
    { value: 'customFunction', label: 'Custom Function', description: 'Use a predefined validation function' }
  ]

  const customValidators = AdvancedValidationEngine.getAvailableValidators()

  const handleAddRule = () => {
    setIsAddingRule(true)
    setRuleFormData({
      type: 'required',
      message: ''
    })
  }

  const handleSaveRule = () => {
    const newRule: ValidationRule = {
      type: ruleFormData.type,
      value: ruleFormData.value,
      message: ruleFormData.message,
      condition: ruleFormData.condition,
      compareWith: ruleFormData.compareWith,
      range: ruleFormData.range,
      customFunction: ruleFormData.customFunction,
      customParams: ruleFormData.customParams
    }

    if (editingRuleIndex !== null) {
      // Edit existing rule
      const updatedRules = [...validationRules]
      updatedRules[editingRuleIndex] = newRule
      onRulesChange(updatedRules)
      setEditingRuleIndex(null)
    } else {
      // Add new rule
      onRulesChange([...validationRules, newRule])
      setIsAddingRule(false)
    }

    setRuleFormData({
      type: 'required',
      message: ''
    })
  }

  const handleEditRule = (index: number) => {
    const rule = validationRules[index]
    setRuleFormData({
      type: rule.type,
      value: rule.value,
      message: rule.message,
      condition: rule.condition,
      compareWith: rule.compareWith,
      range: rule.range,
      customFunction: rule.customFunction,
      customParams: rule.customParams
    })
    setEditingRuleIndex(index)
    setIsAddingRule(true)
  }

  const handleDeleteRule = (index: number) => {
    const updatedRules = validationRules.filter((_, i) => i !== index)
    onRulesChange(updatedRules)
  }

  const handleCancel = () => {
    setIsAddingRule(false)
    setEditingRuleIndex(null)
    setRuleFormData({
      type: 'required',
      message: ''
    })
  }

  const updateFormData = (field: keyof ValidationRuleFormData, value: any) => {
    setRuleFormData(prev => ({ ...prev, [field]: value }))
  }

  const getValidationTypeDescription = (type: ValidationRule['type']) => {
    return validationTypes.find(t => t.value === type)?.description || ''
  }

  const renderRuleConfiguration = () => {
    switch (ruleFormData.type) {
      case 'minLength':
      case 'maxLength':
        return (
          <div>
            <Label htmlFor="value">Length</Label>
            <Input
              id="value"
              type="number"
              value={ruleFormData.value || ''}
              onChange={(e) => updateFormData('value', parseInt(e.target.value))}
              placeholder="Enter length"
              min="1"
            />
          </div>
        )

      case 'pattern':
        return (
          <div>
            <Label htmlFor="value">Regular Expression</Label>
            <Input
              id="value"
              value={ruleFormData.value || ''}
              onChange={(e) => updateFormData('value', e.target.value)}
              placeholder="Enter regex pattern (e.g., ^\d{3}-\d{3}-\d{4}$)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use JavaScript regex syntax
            </p>
          </div>
        )

      case 'conditional':
        return (
          <div className="space-y-3">
            <div>
              <Label>Condition</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={ruleFormData.condition?.field || ''}
                  onValueChange={(value) =>
                    updateFormData('condition', {
                      ...ruleFormData.condition,
                      field: value,
                      operator: ruleFormData.condition?.operator || 'equals',
                      value: ruleFormData.condition?.value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={ruleFormData.condition?.operator || 'equals'}
                  onValueChange={(value) =>
                    updateFormData('condition', {
                      ...ruleFormData.condition,
                      operator: value as any,
                      field: ruleFormData.condition?.field,
                      value: ruleFormData.condition?.value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="notEquals">Not Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="isEmpty">Is Empty</SelectItem>
                    <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={ruleFormData.condition?.value || ''}
                  onChange={(e) =>
                    updateFormData('condition', {
                      ...ruleFormData.condition,
                      value: e.target.value,
                      field: ruleFormData.condition?.field,
                      operator: ruleFormData.condition?.operator
                    })
                  }
                  placeholder="Value"
                />
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-sm">
                This field will be required when the above condition is met.
              </p>
            </div>
          </div>
        )

      case 'comparison':
        return (
          <div className="space-y-3">
            <div>
              <Label>Compare with Field</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={ruleFormData.compareWith?.field || ''}
                  onValueChange={(value) =>
                    updateFormData('compareWith', {
                      ...ruleFormData.compareWith,
                      field: value,
                      operator: ruleFormData.compareWith?.operator || 'equals'
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={ruleFormData.compareWith?.operator || 'equals'}
                  onValueChange={(value) =>
                    updateFormData('compareWith', {
                      ...ruleFormData.compareWith,
                      operator: value as any,
                      field: ruleFormData.compareWith?.field
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="notEquals">Not Equals</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                    <SelectItem value="greaterThanEqual">Greater Than or Equal</SelectItem>
                    <SelectItem value="lessThanEqual">Less Than or Equal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'range':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min">Minimum Value</Label>
                <Input
                  id="min"
                  value={ruleFormData.range?.min instanceof Date
                    ? ruleFormData.range.min.toISOString().split('T')[0]
                    : ruleFormData.range?.min || ''}
                  onChange={(e) =>
                    updateFormData('range', {
                      ...ruleFormData.range,
                      min: e.target.value
                    })
                  }
                  placeholder="Min value"
                />
              </div>
              <div>
                <Label htmlFor="max">Maximum Value</Label>
                <Input
                  id="max"
                  value={ruleFormData.range?.max instanceof Date
                    ? ruleFormData.range.max.toISOString().split('T')[0]
                    : ruleFormData.range?.max || ''}
                  onChange={(e) =>
                    updateFormData('range', {
                      ...ruleFormData.range,
                      max: e.target.value
                    })
                  }
                  placeholder="Max value"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="inclusive"
                checked={ruleFormData.range?.inclusive ?? true}
                onCheckedChange={(checked) =>
                  updateFormData('range', {
                    ...ruleFormData.range,
                    inclusive: checked
                  })
                }
              />
              <Label htmlFor="inclusive">Inclusive range</Label>
            </div>
          </div>
        )

      case 'customFunction':
        return (
          <div className="space-y-3">
            <div>
              <Label>Validation Function</Label>
              <Select
                value={ruleFormData.customFunction || ''}
                onValueChange={(value) => updateFormData('customFunction', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select validation function" />
                </SelectTrigger>
                <SelectContent>
                  {customValidators.map(validator => (
                    <SelectItem key={validator} value={validator}>
                      {validator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ruleFormData.customFunction && (
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-sm">
                  This will use the {ruleFormData.customFunction} validation function.
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Advanced Validation Rules</CardTitle>
          <div className="flex items-center space-x-2">
            {onAIValidation && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAIValidation}
                className="flex items-center space-x-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Suggest</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRule}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rule</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Rules */}
        {validationRules.length > 0 && (
          <div className="space-y-2">
            <Label>Current Rules ({validationRules.length})</Label>
            {validationRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {rule.type}
                    </Badge>
                    {rule.aiGenerated && (
                      <Badge variant="outline" className="text-xs">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.message}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRule(index)}
                    className="p-1 h-6 w-6"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(index)}
                    className="p-1 h-6 w-6 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Rule Form */}
        {isAddingRule && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">
                {editingRuleIndex !== null ? 'Edit Validation Rule' : 'Add Validation Rule'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select
                  value={ruleFormData.type}
                  onValueChange={(value) => updateFormData('type', value as ValidationRule['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getValidationTypeDescription(ruleFormData.type)}
                </p>
              </div>

              {renderRuleConfiguration()}

              <div>
                <Label htmlFor="message">Error Message</Label>
                <Textarea
                  id="message"
                  value={ruleFormData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  placeholder="Enter custom error message"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={handleSaveRule} size="sm">
                  <Check className="w-4 h-4 mr-1" />
                  {editingRuleIndex !== null ? 'Update Rule' : 'Add Rule'}
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {validationRules.length === 0 && !isAddingRule && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              No validation rules
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add validation rules to ensure data quality and user experience.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
