import { ValidationRule } from '@/types/form'

// Custom validation functions registry
const customValidators: Record<string, (value: any, params?: Record<string, any>) => boolean> = {
  isValidPhone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s|-|\(|\)/g, ''))
  },
  isValidCreditCard: (value: string) => {
    const cleaned = value.replace(/\s+/g, '')
    const cardRegex = /^(\d{13,19})$/
    return cardRegex.test(cleaned) && luhnCheck(cleaned)
  },
  isValidURL: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  isValidPostalCode: (value: string, params?: { country?: string }) => {
    const country = params?.country || 'US'
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/
    }
    return patterns[country]?.test(value) || false
  },
  isStrongPassword: (value: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongPasswordRegex.test(value)
  },
  isValidDateRange: (value: string, params?: { min?: string; max?: string }) => {
    if (!params?.min && !params?.max) return true

    const date = new Date(value)
    if (isNaN(date.getTime())) return false

    if (params.min) {
      const minDate = new Date(params.min)
      if (date < minDate) return false
    }

    if (params.max) {
      const maxDate = new Date(params.max)
      if (date > maxDate) return false
    }

    return true
  }
}

// Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0
  let shouldDouble = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10)

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export class AdvancedValidationEngine {
  static validateField(
    value: any,
    rule: ValidationRule,
    formData?: Record<string, any>
  ): { isValid: boolean; message?: string } {
    try {
      switch (rule.type) {
        case 'required':
          return this.validateRequired(value, rule)

        case 'minLength':
          return this.validateMinLength(value, rule)

        case 'maxLength':
          return this.validateMaxLength(value, rule)

        case 'pattern':
          return this.validatePattern(value, rule)

        case 'conditional':
          return this.validateConditional(value, rule, formData)

        case 'comparison':
          return this.validateComparison(value, rule, formData)

        case 'range':
          return this.validateRange(value, rule)

        case 'customFunction':
          return this.validateCustomFunction(value, rule)

        default:
          return { isValid: true }
      }
    } catch (error) {
      console.error('Validation error:', error)
      return { isValid: false, message: 'Validation error occurred' }
    }
  }

  private static validateRequired(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    const isEmpty = value === null || value === undefined ||
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0)

    if (isEmpty) {
      return { isValid: false, message: rule.message || 'This field is required' }
    }

    return { isValid: true }
  }

  private static validateMinLength(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    if (typeof value !== 'string') return { isValid: true }

    const minLength = rule.value as number
    if (value.length < minLength) {
      return {
        isValid: false,
        message: rule.message || `Must be at least ${minLength} characters long`
      }
    }

    return { isValid: true }
  }

  private static validateMaxLength(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    if (typeof value !== 'string') return { isValid: true }

    const maxLength = rule.value as number
    if (value.length > maxLength) {
      return {
        isValid: false,
        message: rule.message || `Must be no more than ${maxLength} characters long`
      }
    }

    return { isValid: true }
  }

  private static validatePattern(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    if (typeof value !== 'string') return { isValid: true }

    const pattern = new RegExp(rule.value as string)
    if (!pattern.test(value)) {
      return { isValid: false, message: rule.message || 'Invalid format' }
    }

    return { isValid: true }
  }

  private static validateConditional(
    value: any,
    rule: ValidationRule,
    formData?: Record<string, any>
  ): { isValid: boolean; message?: string } {
    if (!rule.condition || !formData) return { isValid: true }

    const { field, operator, value: conditionValue } = rule.condition
    const fieldValue = formData[field]

    const conditionMet = this.evaluateCondition(fieldValue, operator, conditionValue)

    if (!conditionMet) return { isValid: true } // Condition not met, skip validation

    // Condition is met, apply the validation
    return this.validateField(value, { ...rule, type: rule.type === 'conditional' ? 'required' : rule.type }, formData)
  }

  private static validateComparison(
    value: any,
    rule: ValidationRule,
    formData?: Record<string, any>
  ): { isValid: boolean; message?: string } {
    if (!rule.compareWith || !formData) return { isValid: true }

    const { field, operator } = rule.compareWith
    const compareValue = formData[field]

    const comparisonResult = this.compareValues(value, compareValue, operator)

    if (!comparisonResult) {
      const operatorText = this.getOperatorText(operator)
      return {
        isValid: false,
        message: rule.message || `Must be ${operatorText} ${field}`
      }
    }

    return { isValid: true }
  }

  private static validateRange(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    if (!rule.range) return { isValid: true }

    const { min, max, inclusive = true } = rule.range

    if (min !== undefined) {
      if (inclusive ? value < min : value <= min) {
        return {
          isValid: false,
          message: rule.message || `Must be ${inclusive ? 'at least' : 'greater than'} ${min}`
        }
      }
    }

    if (max !== undefined) {
      if (inclusive ? value > max : value >= max) {
        return {
          isValid: false,
          message: rule.message || `Must be ${inclusive ? 'at most' : 'less than'} ${max}`
        }
      }
    }

    return { isValid: true }
  }

  private static validateCustomFunction(value: any, rule: ValidationRule): { isValid: boolean; message?: string } {
    if (!rule.customFunction) return { isValid: true }

    const validator = customValidators[rule.customFunction]
    if (!validator) {
      return { isValid: false, message: `Unknown validation function: ${rule.customFunction}` }
    }

    const isValid = validator(value, rule.customParams)
    if (!isValid) {
      return { isValid: false, message: rule.message || 'Validation failed' }
    }

    return { isValid: true }
  }

  private static evaluateCondition(value: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === compareValue
      case 'notEquals':
        return value !== compareValue
      case 'contains':
        return typeof value === 'string' && value.includes(compareValue)
      case 'greaterThan':
        return typeof value === 'number' && typeof compareValue === 'number' && value > compareValue
      case 'lessThan':
        return typeof value === 'number' && typeof compareValue === 'number' && value < compareValue
      case 'isEmpty':
        return value === null || value === undefined || value === ''
      case 'isNotEmpty':
        return value !== null && value !== undefined && value !== ''
      default:
        return false
    }
  }

  private static compareValues(value1: any, value2: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return value1 === value2
      case 'notEquals':
        return value1 !== value2
      case 'greaterThan':
        return typeof value1 === 'number' && typeof value2 === 'number' && value1 > value2
      case 'lessThan':
        return typeof value1 === 'number' && typeof value2 === 'number' && value1 < value2
      case 'greaterThanEqual':
        return typeof value1 === 'number' && typeof value2 === 'number' && value1 >= value2
      case 'lessThanEqual':
        return typeof value1 === 'number' && typeof value2 === 'number' && value1 <= value2
      default:
        return false
    }
  }

  private static getOperatorText(operator: string): string {
    const operatorMap: Record<string, string> = {
      'equals': 'equal to',
      'notEquals': 'not equal to',
      'greaterThan': 'greater than',
      'lessThan': 'less than',
      'greaterThanEqual': 'greater than or equal to',
      'lessThanEqual': 'less than or equal to'
    }
    return operatorMap[operator] || operator
  }

  // Utility method to validate all fields with advanced rules
  static validateForm(formData: Record<string, any>, fields: Array<{ name: string; validation?: ValidationRule[] }>) {
    const errors: Record<string, string> = {}

    fields.forEach(field => {
      if (field.validation) {
        field.validation.forEach(rule => {
          const result = this.validateField(formData[field.name], rule, formData)
          if (!result.isValid && result.message) {
            errors[field.name] = result.message
          }
        })
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Register custom validation functions
  static registerValidator(name: string, validator: (value: any, params?: Record<string, any>) => boolean) {
    customValidators[name] = validator
  }

  // Get available custom validators
  static getAvailableValidators(): string[] {
    return Object.keys(customValidators)
  }
}
