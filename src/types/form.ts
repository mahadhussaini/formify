export interface FormField {
  id: string
  type: FieldType
  label: string
  name: string
  placeholder?: string
  required: boolean
  description?: string
  validation?: ValidationRule[]
  options?: FieldOption[]
  defaultValue?: any
  properties: FieldProperties
}

export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'phone'
  | 'url'
  | 'password'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'file'
  | 'range'
  | 'color'

export interface FieldOption {
  id: string
  label: string
  value: string
}

export interface FieldProperties {
  width?: 'full' | 'half' | 'third' | 'quarter'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  accept?: string // for file inputs
  multiple?: boolean
  rows?: number // for textarea
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'conditional' | 'comparison' | 'range' | 'customFunction'
  value?: any
  message: string
  aiGenerated?: boolean
  // For conditional validation
  condition?: {
    field: string // Field name to check
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty'
    value: any
  }
  // For comparison validation
  compareWith?: {
    field: string // Field name to compare with
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanEqual' | 'lessThanEqual'
  }
  // For range validation
  range?: {
    min?: number | string | Date
    max?: number | string | Date
    inclusive?: boolean
  }
  // For custom validation function
  customFunction?: string // Name of validation function
  customParams?: Record<string, any> // Parameters for custom function
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[] // Array of field IDs
  order: number
}

export interface Form {
  id: string
  title: string
  description?: string
  fields: FormField[]
  steps: FormStep[]
  isMultiStep: boolean
  settings: FormSettings
  createdAt: Date
  updatedAt: Date
}

export interface FormSettings {
  submitButtonText: string
  successMessage: string
  redirectUrl?: string
  allowMultipleSubmissions: boolean
  collectEmail: boolean
  theme: FormTheme
}

export interface FormTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  spacing: 'tight' | 'normal' | 'relaxed'
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: Date
  ipAddress?: string
  userAgent?: string
  status?: 'new' | 'read' | 'archived'
  notes?: string
}

export interface SubmissionAnalytics {
  totalSubmissions: number
  submissionsToday: number
  submissionsThisWeek: number
  submissionsThisMonth: number
  averageCompletionTime: number
  completionRate: number
  fieldCompletionRates: Record<string, number>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  browserBreakdown: Record<string, number>
}

export interface AIValidationSuggestion {
  fieldId: string
  suggestions: {
    validationRules: ValidationRule[]
    improvedLabel?: string
    improvedPlaceholder?: string
    fieldTypeRecommendation?: FieldType
    reasoning: string
  }
}

export interface DragFieldItem {
  type: FieldType
  label: string
  icon: string
  description: string
}
