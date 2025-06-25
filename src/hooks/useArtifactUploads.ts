import { useEffect, useRef, useState } from 'react'
import { useUploadArtifact } from '../backend/api'

interface UseArtifactUploadsProps {
  token: string | null
  appId: string
  roflYaml: string
  composeYaml: string
}

export function useArtifactUploads({ token, appId, roflYaml, composeYaml }: UseArtifactUploadsProps) {
  const [uploadsTriggered, setUploadsTriggered] = useState(false)
  const uploadKeyRef = useRef<string | null>(null)
  const roflUploadMutation = useUploadArtifact(token)
  const composeUploadMutation = useUploadArtifact(token)

  useEffect(() => {
    const currentUploadKey = `${token}-${appId}-${roflYaml.length}-${composeYaml.length}`

    if (
      !uploadsTriggered &&
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
  }, [token, appId, roflYaml, composeYaml, uploadsTriggered])

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
