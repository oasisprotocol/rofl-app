import { useState } from 'react'
import { useValidateRofl } from '../../backend/api'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'

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
