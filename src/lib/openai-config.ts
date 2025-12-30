import OpenAI from 'openai'

// Custom error class for OpenAI configuration issues
export class OpenAIConfigError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message)
    this.name = 'OpenAIConfigError'
  }
}

// OpenAI configuration and client management
export class OpenAIConfig {
  private static instance: OpenAI | null = null
  private static isInitialized = false

  /**
   * Get the OpenAI API key from environment variables
   * @throws {OpenAIConfigError} If API key is missing or invalid
   */
  private static getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new OpenAIConfigError(
        'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.',
        'MISSING_API_KEY'
      )
    }

    if (apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
      throw new OpenAIConfigError(
        'OpenAI API key appears to be a placeholder. Please set a valid API key.',
        'INVALID_API_KEY'
      )
    }

    // Basic validation - OpenAI keys start with 'sk-'
    if (!apiKey.startsWith('sk-')) {
      throw new OpenAIConfigError(
        'OpenAI API key format is invalid. API keys should start with "sk-".',
        'INVALID_API_KEY_FORMAT'
      )
    }

    return apiKey.trim()
  }

  /**
   * Initialize and return the OpenAI client instance
   * @throws {OpenAIConfigError} If configuration fails
   */
  public static getClient(): OpenAI {
    // Prevent client-side usage
    if (typeof window !== 'undefined') {
      throw new OpenAIConfigError(
        'OpenAI client cannot be used on the client side for security reasons.',
        'CLIENT_SIDE_USAGE'
      )
    }

    if (!this.isInitialized) {
      try {
        const apiKey = this.getApiKey()
        this.instance = new OpenAI({
          apiKey,
          // No dangerouslyAllowBrowser option needed for server-side usage
        })
        this.isInitialized = true
      } catch (error) {
        if (error instanceof OpenAIConfigError) {
          throw error
        }
        throw new OpenAIConfigError(
          `Failed to initialize OpenAI client: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'INITIALIZATION_FAILED'
        )
      }
    }

    return this.instance!
  }

  /**
   * Validate that OpenAI is properly configured
   * This can be called during app startup or health checks
   */
  public static async validateConfiguration(): Promise<{
    isValid: boolean
    error?: string
    details?: any
  }> {
    try {
      const client = this.getClient()

      // Test the API key with a minimal request
      const testResponse = await client.models.list()
      if (!testResponse.data || testResponse.data.length === 0) {
        throw new Error('No models available')
      }

      return { isValid: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        isValid: false,
        error: `OpenAI configuration validation failed: ${errorMessage}`,
        details: error
      }
    }
  }

  /**
   * Reset the client instance (useful for testing or re-initialization)
   */
  public static reset(): void {
    this.instance = null
    this.isInitialized = false
  }

  /**
   * Check if OpenAI features should be enabled
   * Returns false if API key is not configured or invalid
   */
  public static isEnabled(): boolean {
    try {
      this.getApiKey()
      return true
    } catch {
      return false
    }
  }
}

// Export a convenience function for getting the client
export const getOpenAIClient = () => OpenAIConfig.getClient()

// Export validation function
export const validateOpenAIConfig = () => OpenAIConfig.validateConfiguration()

// Export utility functions
export const isOpenAIEnabled = () => OpenAIConfig.isEnabled()
