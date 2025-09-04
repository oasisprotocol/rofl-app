import { useState } from 'react'
import { useValidateRofl } from '../../backend/api'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'

type ValidationState = {
  isValidating: boolean
  logs: string | null
}

type RoflValidateApiResponse = {
  valid: boolean
  logs?: string
}

function parseLogs(logs: string | undefined) {
  const parsed = logs?.split('\n')
  const newArray = parsed?.slice(3)
  return newArray?.join('. ')
}

export function useComposeValidation() {
  const { token } = useRoflAppBackendAuthContext()
  const { mutateAsync: validateRofl } = useValidateRofl(token)

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    logs: null,
  })

  const validateCompose = async (compose: string): Promise<boolean> => {
    setValidationState({
      isValidating: true,
      logs: null,
    })

    try {
      const response = (await validateRofl({ compose })) as RoflValidateApiResponse

      if (!response.valid) {
        setValidationState({
          isValidating: false,
          logs: response.logs || null,
        })
        return false
      }

      setValidationState({
        isValidating: false,
        logs: parseLogs(response.logs) || null,
      })
      return true
    } catch {
      setValidationState({
        isValidating: false,
        logs: null,
      })

      return false
    }
  }

  const clearValidation = () => {
    setValidationState({
      isValidating: false,
      logs: null,
    })
  }

  return {
    ...validationState,
    validateCompose,
    clearValidation,
  }
}
