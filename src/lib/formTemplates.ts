import { Form, FormField, FormStep } from '@/types/form'
import { generateId } from './utils'

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  estimatedTime: string
  fields: Omit<FormField, 'id'>[]
  steps?: Omit<FormStep, 'id' | 'order'>[]
  isMultiStep?: boolean
  settings?: Partial<Form['settings']>
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'A simple contact form for your website',
    category: 'Business',
    icon: 'Mail',
    estimatedTime: '2 min',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        name: 'fullName',
        placeholder: 'Enter your full name',
        required: true,
        properties: {},
        validation: [
          {
            type: 'minLength',
            value: 2,
            message: 'Name must be at least 2 characters long',
            aiGenerated: true
          }
        ]
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      },
      {
        type: 'textarea',
        label: 'Message',
        name: 'message',
        placeholder: 'Tell us how we can help you...',
        required: true,
        properties: { rows: 4 },
        validation: [
          {
            type: 'minLength',
            value: 10,
            message: 'Please provide a detailed message',
            aiGenerated: true
          }
        ]
      }
    ],
    settings: {
      submitButtonText: 'Send Message',
      successMessage: 'Thank you for your message! We\'ll get back to you soon.'
    }
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Complete job application form with resume upload',
    category: 'HR',
    icon: 'Briefcase',
    estimatedTime: '5 min',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        name: 'fullName',
        placeholder: 'Enter your full name',
        required: true,
        properties: {}
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      },
      {
        type: 'phone',
        label: 'Phone Number',
        name: 'phone',
        placeholder: 'Enter your phone number',
        required: true,
        properties: {}
      },
      {
        type: 'text',
        label: 'Position Applied For',
        name: 'position',
        placeholder: 'e.g., Software Developer',
        required: true,
        properties: {}
      },
      {
        type: 'textarea',
        label: 'Cover Letter',
        name: 'coverLetter',
        placeholder: 'Tell us why you\'re interested in this position...',
        properties: { rows: 5 },
        required: true
      },
      {
        type: 'file',
        label: 'Resume/CV',
        name: 'resume',
        properties: { accept: '.pdf,.doc,.docx', multiple: false },
        required: true
      }
    ],
    settings: {
      submitButtonText: 'Submit Application',
      successMessage: 'Thank you for your application! We\'ll review it and get back to you soon.'
    }
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Registration form for events and workshops',
    category: 'Events',
    icon: 'Calendar',
    estimatedTime: '4 min',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        name: 'fullName',
        placeholder: 'Enter your full name',
        required: true,
        properties: {}
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      },
      {
        type: 'phone',
        label: 'Phone Number',
        name: 'phone',
        placeholder: 'Enter your phone number',
        required: true,
        properties: {}
      },
      {
        type: 'select',
        label: 'Ticket Type',
        name: 'ticketType',
        placeholder: 'Select ticket type',
        required: true,
        properties: {},
        options: [
          { id: 'general', label: 'General Admission', value: 'general' },
          { id: 'vip', label: 'VIP', value: 'vip' },
          { id: 'student', label: 'Student', value: 'student' }
        ]
      },
      {
        type: 'textarea',
        label: 'Special Requirements',
        name: 'requirements',
        placeholder: 'Any dietary restrictions, accessibility needs, etc.',
        required: false,
        properties: { rows: 3 }
      }
    ],
    settings: {
      submitButtonText: 'Register Now',
      successMessage: 'Registration successful! Check your email for confirmation details.'
    }
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Collect feedback from your customers',
    category: 'Business',
    icon: 'MessageCircle',
    estimatedTime: '3 min',
    fields: [
      {
        type: 'text',
        label: 'Name',
        name: 'name',
        placeholder: 'Enter your name',
        required: true,
        properties: {}
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      },
      {
        type: 'select',
        label: 'How satisfied are you?',
        name: 'satisfaction',
        placeholder: 'Select your satisfaction level',
        required: true,
        properties: {},
        options: [
          { id: 'very_satisfied', label: 'Very Satisfied', value: 'very_satisfied' },
          { id: 'satisfied', label: 'Satisfied', value: 'satisfied' },
          { id: 'neutral', label: 'Neutral', value: 'neutral' },
          { id: 'dissatisfied', label: 'Dissatisfied', value: 'dissatisfied' },
          { id: 'very_dissatisfied', label: 'Very Dissatisfied', value: 'very_dissatisfied' }
        ]
      },
      {
        type: 'textarea',
        label: 'Comments',
        name: 'comments',
        placeholder: 'Please share your feedback...',
        properties: { rows: 4 },
        required: true
      }
    ],
    settings: {
      submitButtonText: 'Submit Feedback',
      successMessage: 'Thank you for your feedback! We appreciate your input.'
    }
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Simple newsletter subscription form',
    category: 'Marketing',
    icon: 'Mail',
    estimatedTime: '1 min',
    fields: [
      {
        type: 'text',
        label: 'First Name',
        name: 'firstName',
        placeholder: 'Enter your first name',
        required: true,
        properties: {}
      },
      {
        type: 'text',
        label: 'Last Name',
        name: 'lastName',
        placeholder: 'Enter your last name',
        required: true,
        properties: {}
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      }
    ],
    settings: {
      submitButtonText: 'Subscribe',
      successMessage: 'Welcome to our newsletter! Check your email for confirmation.'
    }
  },
  {
    id: 'survey-form',
    name: 'Customer Survey',
    description: 'Multi-step survey with various question types',
    category: 'Research',
    icon: 'BarChart3',
    estimatedTime: '8 min',
    isMultiStep: true,
    steps: [
      {
        title: 'Personal Information',
        description: 'Tell us about yourself',
        fields: ['firstName', 'lastName', 'email', 'age', 'gender']
      },
      {
        title: 'Product Usage',
        description: 'How do you use our product?',
        fields: ['usageFrequency', 'featuresUsed', 'satisfaction']
      },
      {
        title: 'Feedback',
        description: 'Share your thoughts and suggestions',
        fields: ['improvements', 'comments']
      }
    ],
    fields: [
      {
        type: 'text',
        label: 'First Name',
        name: 'firstName',
        placeholder: 'Enter your first name',
        required: true,
        properties: {}
      },
      {
        type: 'text',
        label: 'Last Name',
        name: 'lastName',
        placeholder: 'Enter your last name',
        required: true,
        properties: {}
      },
      {
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'Enter your email address',
        required: true,
        properties: {}
      },
      {
        type: 'select',
        label: 'Age Group',
        name: 'age',
        placeholder: 'Select your age group',
        required: true,
        properties: {},
        options: [
          { id: '18-24', label: '18-24', value: '18-24' },
          { id: '25-34', label: '25-34', value: '25-34' },
          { id: '35-44', label: '35-44', value: '35-44' },
          { id: '45-54', label: '45-54', value: '45-54' },
          { id: '55-64', label: '55-64', value: '55-64' },
          { id: '65+', label: '65+', value: '65+' }
        ]
      },
      {
        type: 'radio',
        label: 'Gender',
        name: 'gender',
        required: true,
        properties: {},
        options: [
          { id: 'male', label: 'Male', value: 'male' },
          { id: 'female', label: 'Female', value: 'female' },
          { id: 'other', label: 'Other', value: 'other' },
          { id: 'prefer_not_to_say', label: 'Prefer not to say', value: 'prefer_not_to_say' }
        ]
      },
      {
        type: 'select',
        label: 'How often do you use our product?',
        name: 'usageFrequency',
        placeholder: 'Select frequency',
        required: true,
        properties: {},
        options: [
          { id: 'daily', label: 'Daily', value: 'daily' },
          { id: 'weekly', label: 'Weekly', value: 'weekly' },
          { id: 'monthly', label: 'Monthly', value: 'monthly' },
          { id: 'rarely', label: 'Rarely', value: 'rarely' }
        ]
      },
      {
        type: 'checkbox',
        label: 'Which features do you use? (Select all that apply)',
        name: 'featuresUsed',
        required: true,
        properties: {},
        options: [
          { id: 'dashboard', label: 'Dashboard', value: 'dashboard' },
          { id: 'reports', label: 'Reports', value: 'reports' },
          { id: 'analytics', label: 'Analytics', value: 'analytics' },
          { id: 'settings', label: 'Settings', value: 'settings' },
          { id: 'help', label: 'Help & Support', value: 'help' }
        ]
      },
      {
        type: 'select',
        label: 'Overall satisfaction',
        name: 'satisfaction',
        placeholder: 'Rate your satisfaction',
        required: true,
        properties: {},
        options: [
          { id: 'very_satisfied', label: 'Very Satisfied', value: 'very_satisfied' },
          { id: 'satisfied', label: 'Satisfied', value: 'satisfied' },
          { id: 'neutral', label: 'Neutral', value: 'neutral' },
          { id: 'dissatisfied', label: 'Dissatisfied', value: 'dissatisfied' },
          { id: 'very_dissatisfied', label: 'Very Dissatisfied', value: 'very_dissatisfied' }
        ]
      },
      {
        type: 'textarea',
        label: 'What improvements would you like to see?',
        name: 'improvements',
        placeholder: 'Share your suggestions...',
        properties: { rows: 3 },
        required: true
      },
      {
        type: 'textarea',
        label: 'Additional comments',
        name: 'comments',
        placeholder: 'Any other thoughts or feedback...',
        required: false,
        properties: { rows: 3 }
      }
    ],
    settings: {
      submitButtonText: 'Complete Survey',
      successMessage: 'Thank you for completing our survey! Your feedback is valuable to us.'
    }
  }
]

export const TEMPLATE_CATEGORIES = [
  'All',
  'Business',
  'HR',
  'Events',
  'Marketing',
  'Research'
] as const

export function createFormFromTemplate(template: FormTemplate): Form {
  const fields: FormField[] = template.fields.map(field => ({
    ...field,
    id: generateId(),
    properties: field.properties || {} // Ensure properties exists
  }))

  const steps: FormStep[] = template.steps
    ? template.steps.map((step, index) => ({
        ...step,
        id: generateId(),
        order: index,
        fields: step.fields.map(fieldName =>
          fields.find(f => f.name === fieldName)?.id || ''
        ).filter(Boolean)
      }))
    : [
        {
          id: generateId(),
          title: 'Step 1',
          description: '',
          fields: fields.map(f => f.id),
          order: 0
        }
      ]

  return {
    id: generateId(),
    title: template.name,
    description: template.description,
    fields,
    steps,
    isMultiStep: template.isMultiStep || false,
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      allowMultipleSubmissions: true,
      collectEmail: false,
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        borderRadius: 'md',
        spacing: 'normal'
      },
      ...template.settings
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
  if (category === 'All') {
    return FORM_TEMPLATES
  }
  return FORM_TEMPLATES.filter(template => template.category === category)
}

export function searchTemplates(query: string): FormTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return FORM_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  )
}
