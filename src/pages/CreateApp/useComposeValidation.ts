import * as yaml from 'yaml'
import { useState } from 'react'
import { useValidateRofl } from '../../backend/api'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { ROFL_8004_SERVICE_NAME, ROFL_8004_VOLUME_NAME } from '../../constants/rofl-8004.ts'

type ValidationState = {
  isValidating: boolean
  validationError: string | null
}

type RoflValidateApiResponse = {
  valid: boolean
  stderr?: string
}

export function useComposeValidation() {
  const { token } = useRoflAppBackendAuthContext()
  const { mutateAsync: validateRofl } = useValidateRofl(token)

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    validationError: null,
  })

  const clearValidation = () => {
    setValidationState({
      isValidating: false,
      validationError: null,
    })
  }

  const validateCompose = async (compose: string): Promise<boolean> => {
    setValidationState({
      isValidating: true,
      validationError: null,
    })

    try {
      const parsed = yaml.parse(compose)
      if (parsed?.services?.[ROFL_8004_SERVICE_NAME]) {
        setValidationState({
          isValidating: false,
          validationError: `Service name "${ROFL_8004_SERVICE_NAME}" is reserved and cannot be used.`,
        })
        return false
      }

      if (parsed?.volumes?.[ROFL_8004_VOLUME_NAME]) {
        setValidationState({
          isValidating: false,
          validationError: `Volume name "${ROFL_8004_VOLUME_NAME}" is reserved and cannot be used.`,
        })
        return false
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore YAML parsing error
    } catch (_err) {
      // Let backend validation handle the error
    }

    try {
      const response = (await validateRofl({ compose })) as RoflValidateApiResponse

      if (!response.valid) {
        setValidationState({
          isValidating: false,
          validationError: response.stderr || null,
        })
        return false
      }

      clearValidation()
      return true
    } catch {
      clearValidation()

      return false
    }
  }

  return {
    ...validationState,
    validateCompose,
    clearValidation,
  }
}
