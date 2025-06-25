import { useEffect, useRef, useState } from 'react'
import { useUploadArtifact } from '../backend/api'

interface UseArtifactUploadsProps {
  token: string | null
  appId: string
  roflYaml: string
  composeYaml: string
  enabled?: boolean
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useArtifactUploads({
  token,
  appId,
  roflYaml,
  composeYaml,
  enabled = true,
  onSuccess,
  onError,
}: UseArtifactUploadsProps) {
  const [uploadsTriggered, setUploadsTriggered] = useState(false)
  const uploadKeyRef = useRef<string | null>(null)
  const roflUploadMutation = useUploadArtifact(token)
  const composeUploadMutation = useUploadArtifact(token)

  useEffect(() => {
    const currentUploadKey = `${token}-${appId}-${roflYaml.length}-${composeYaml.length}`

    if (
      !uploadsTriggered &&
      enabled &&
      token &&
      appId &&
      roflYaml &&
      composeYaml &&
      uploadKeyRef.current !== currentUploadKey
    ) {
      setUploadsTriggered(true)
      uploadKeyRef.current = currentUploadKey

      const roflBlob = new Blob([roflYaml])
      const composeBlob = new Blob([composeYaml])

      const roflId = `${appId}-rofl-yaml`
      const composeId = `${appId}-compose-yaml`

      roflUploadMutation.mutate({
        id: roflId,
        file: roflBlob,
      })

      composeUploadMutation.mutate({
        id: composeId,
        file: composeBlob,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, appId, roflYaml, composeYaml, uploadsTriggered, enabled])

  useEffect(() => {
    const isSuccess = roflUploadMutation.isSuccess && composeUploadMutation.isSuccess
    const isError = roflUploadMutation.isError || composeUploadMutation.isError

    if (uploadsTriggered && isSuccess && onSuccess) {
      onSuccess()
    } else if (uploadsTriggered && isError && onError) {
      const error = roflUploadMutation.error || composeUploadMutation.error
      onError(error)
    }
  }, [roflUploadMutation, composeUploadMutation, uploadsTriggered, onSuccess, onError])

  return {
    roflUpload: {
      isLoading: roflUploadMutation.isPending,
      isError: roflUploadMutation.isError,
      isSuccess: roflUploadMutation.isSuccess,
      error: roflUploadMutation.error,
    },
    composeUpload: {
      isLoading: composeUploadMutation.isPending,
      isError: composeUploadMutation.isError,
      isSuccess: composeUploadMutation.isSuccess,
      error: composeUploadMutation.error,
    },
    uploadsTriggered,
  }
}
