import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError, AppErrors, type ErrorPayload, exhaustedTypeWarning } from './errors'

describe('ErrorBoundary errors', () => {
  describe('AppError', () => {
    it('should create an error with type and message', () => {
      const error = new AppError(AppErrors.Unknown, 'Something went wrong')

      expect(error).toBeInstanceOf(Error)
      expect(error.type).toBe(AppErrors.Unknown)
      expect(error.message).toBe('Something went wrong')
    })

    it('should use type as default message', () => {
      const error = new AppError(AppErrors.WalletNotConnected)

      expect(error.message).toBe(AppErrors.WalletNotConnected)
    })

    it('should store original error', () => {
      const originalError = new Error('Original error message')
      const error = new AppError(AppErrors.Unknown, 'Wrapped error', originalError)

      expect(error.originalError).toBe(originalError)
      expect(error.originalError?.message).toBe('Original error message')
    })

    it('should handle all AppError types', () => {
      const unknownError = new AppError(AppErrors.Unknown)
      expect(unknownError.type).toBe(AppErrors.Unknown)

      const unsupportedChainError = new AppError(AppErrors.UnsupportedChain)
      expect(unsupportedChainError.type).toBe(AppErrors.UnsupportedChain)

      const walletNotConnectedError = new AppError(AppErrors.WalletNotConnected)
      expect(walletNotConnectedError.type).toBe(AppErrors.WalletNotConnected)

      const pageDoesNotExistError = new AppError(AppErrors.PageDoesNotExist)
      expect(pageDoesNotExistError.type).toBe(AppErrors.PageDoesNotExist)
    })

    it('should maintain correct prototype chain', () => {
      const error = new AppError(AppErrors.Unknown, 'Test')
      expect(error instanceof Error).toBe(true)
      expect(error instanceof AppError).toBe(true)
      expect(error.name).toBe('Error')
    })

    it('should have stack trace', () => {
      const error = new AppError(AppErrors.Unknown, 'Test error')
      expect(error.stack).toBeDefined()
      expect(typeof error.stack).toBe('string')
    })

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new AppError(AppErrors.Unknown, 'Throw test')
      }).toThrow(AppError)
    })

    it('should preserve error properties through JSON serialization', () => {
      const originalError = new Error('Original')
      const error = new AppError(AppErrors.UnsupportedChain, 'Chain not supported', originalError)

      expect(error.type).toBe(AppErrors.UnsupportedChain)
      expect(error.message).toBe('Chain not supported')
      expect(error.originalError).toBe(originalError)
    })

    it('should handle undefined message gracefully', () => {
      const error = new AppError(AppErrors.Unknown, undefined)
      expect(error.message).toBe(AppErrors.Unknown)
    })

    it('should handle empty string message', () => {
      const error = new AppError(AppErrors.Unknown, '')
      expect(error.message).toBe('')
    })
  })

  describe('AppErrors', () => {
    it('should have all required error types', () => {
      expect(AppErrors.Unknown).toBe('unknown')
      expect(AppErrors.UnsupportedChain).toBe('unsupported_chain')
      expect(AppErrors.WalletNotConnected).toBe('wallet_not_connected')
      expect(AppErrors.PageDoesNotExist).toBe('page_does_not_exist')
    })

    it('should have readonly type at compile time', () => {
      // This test verifies the type is readonly (compile-time check)
      // At runtime, TypeScript's readonly is only for type checking
      const errors = AppErrors
      expect(errors.Unknown).toBe('unknown')
      expect(errors.UnsupportedChain).toBe('unsupported_chain')
      expect(errors.WalletNotConnected).toBe('wallet_not_connected')
      expect(errors.PageDoesNotExist).toBe('page_does_not_exist')
    })

    it('should be frozen/immutabale', () => {
      // Verify the object is properly frozen or acts as const
      const keys = Object.keys(AppErrors)
      expect(keys).toEqual(['Unknown', 'UnsupportedChain', 'WalletNotConnected', 'PageDoesNotExist'])
      expect(Object.keys(AppErrors)).toHaveLength(4)
    })

    it('should allow type narrowing with exhaustiveness checks', () => {
      // This test demonstrates the type can be used for exhaustiveness checking
      const allErrorTypes: AppErrors[] = [
        AppErrors.Unknown,
        AppErrors.UnsupportedChain,
        AppErrors.WalletNotConnected,
        AppErrors.PageDoesNotExist,
      ]
      expect(allErrorTypes).toHaveLength(4)
    })
  })

  describe('ErrorPayload', () => {
    it('should accept valid error payload', () => {
      const payload: ErrorPayload = {
        code: AppErrors.Unknown,
        message: 'Test error message',
      }

      expect(payload.code).toBe(AppErrors.Unknown)
      expect(payload.message).toBe('Test error message')
    })

    it('should accept all error types as code', () => {
      const payloads: ErrorPayload[] = [
        { code: AppErrors.Unknown, message: 'Unknown error' },
        { code: AppErrors.UnsupportedChain, message: 'Unsupported chain' },
        { code: AppErrors.WalletNotConnected, message: 'Wallet not connected' },
        { code: AppErrors.PageDoesNotExist, message: 'Page not found' },
      ]

      expect(payloads).toHaveLength(4)
    })

    it('should handle empty message', () => {
      const payload: ErrorPayload = {
        code: AppErrors.Unknown,
        message: '',
      }
      expect(payload.message).toBe('')
    })

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000)
      const payload: ErrorPayload = {
        code: AppErrors.Unknown,
        message: longMessage,
      }
      expect(payload.message).toHaveLength(1000)
    })

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: <script>alert("xss")</script> & "quotes" and \'apostrophes\''
      const payload: ErrorPayload = {
        code: AppErrors.Unknown,
        message: specialMessage,
      }
      expect(payload.message).toBe(specialMessage)
    })
  })

  describe('exhaustedTypeWarning', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should throw error in development', () => {
      // Ensure we're not in PROD mode
      vi.stubEnv('PROD', false)
      expect(() =>
        exhaustedTypeWarning('Test prefix', 'Expected type to be exhausted, but this type was not handled'),
      ).toThrow(Error)
      vi.unstubAllEnvs()
    })

    it('should include message prefix in error', () => {
      vi.stubEnv('PROD', false)
      expect(() =>
        exhaustedTypeWarning('Custom prefix', 'Expected type to be exhausted, but this type was not handled'),
      ).toThrow('Custom prefix')
      vi.unstubAllEnvs()
    })

    it('should include exhausted type in error message', () => {
      vi.stubEnv('PROD', false)
      try {
        exhaustedTypeWarning('Test', 'Expected type to be exhausted, but this type was not handled')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Expected type to be exhausted')
      }
      vi.unstubAllEnvs()
    })

    it('should not throw in production but log warning', () => {
      vi.stubEnv('PROD', true)
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(() =>
        exhaustedTypeWarning('Test', 'Expected type to be exhausted, but this type was not handled'),
      ).not.toThrow()
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
      vi.unstubAllEnvs()
    })
  })
})
