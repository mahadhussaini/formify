import { DragFieldItem, FormField, FieldType } from '@/types/form'
import { generateId, formatFieldName } from './utils'

export const FIELD_TEMPLATES: DragFieldItem[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: 'Type',
    description: 'Single line text input'
  },
  {
    type: 'email',
    label: 'Email',
    icon: 'Mail',
    description: 'Email address input with validation'
  },
  {
    type: 'number',
    label: 'Number',
    icon: 'Hash',
    description: 'Numeric input with validation'
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: 'Phone',
    description: 'Phone number input'
  },
  {
    type: 'url',
    label: 'URL',
    icon: 'Link',
    description: 'Web address input'
  },
  {
    type: 'password',
    label: 'Password',
    icon: 'Lock',
    description: 'Password input field'
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: 'AlignLeft',
    description: 'Multi-line text input'
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: 'ChevronDown',
    description: 'Dropdown selection menu'
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: 'Circle',
    description: 'Single choice from multiple options'
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: 'CheckSquare',
    description: 'Multiple choice selection'
  },
  {
    type: 'date',
    label: 'Date',
    icon: 'Calendar',
    description: 'Date picker input'
  },
  {
    type: 'time',
    label: 'Time',
    icon: 'Clock',
    description: 'Time picker input'
  },
  {
    type: 'datetime-local',
    label: 'Date & Time',
    icon: 'CalendarClock',
    description: 'Date and time picker'
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: 'Upload',
    description: 'File upload input'
  },
  {
    type: 'range',
    label: 'Range Slider',
    icon: 'Minus',
    description: 'Numeric range slider'
  },
  {
    type: 'color',
    label: 'Color Picker',
    icon: 'Palette',
    description: 'Color selection input'
  }
]

export function createFieldFromTemplate(
  fieldType: FieldType,
  label?: string
): FormField {
  const template = FIELD_TEMPLATES.find(t => t.type === fieldType)
  const fieldLabel = label || template?.label || 'New Field'
  
  const baseField: FormField = {
    id: generateId(),
    type: fieldType,
    label: fieldLabel,
    name: formatFieldName(fieldLabel),
    required: false,
    validation: [],
    properties: {
      width: 'full'
    }
  }

  // Add field-specific properties
  switch (fieldType) {
    case 'textarea':
      baseField.properties.rows = 4
      break
    case 'select':
    case 'radio':
    case 'checkbox':
      baseField.options = [
        { id: generateId(), label: 'Option 1', value: 'option1' },
        { id: generateId(), label: 'Option 2', value: 'option2' }
      ]
      break
    case 'number':
    case 'range':
      baseField.properties.min = 0
      baseField.properties.max = 100
      if (fieldType === 'range') {
        baseField.properties.step = 1
        baseField.defaultValue = 50
      }
      break
    case 'file':
      baseField.properties.accept = '*'
      baseField.properties.multiple = false
      break
    case 'text':
    case 'email':
    case 'password':
    case 'url':
    case 'phone':
      baseField.properties.maxLength = 255
      break
    case 'color':
      baseField.defaultValue = '#000000'
      break
  }

  // Add default placeholders
  const placeholders: Record<FieldType, string> = {
    text: 'Enter text...',
    email: 'Enter your email address',
    number: 'Enter a number',
    phone: 'Enter your phone number',
    url: 'Enter a URL',
    password: 'Enter your password',
    textarea: 'Enter your message...',
    select: 'Select an option',
    radio: '',
    checkbox: '',
    date: '',
    time: '',
    'datetime-local': '',
    file: '',
    range: '',
    color: ''
  }

  if (placeholders[fieldType]) {
    baseField.placeholder = placeholders[fieldType]
  }

  return baseField
}
