import { useEffect, useState, type FC } from 'react'
import { RawCode } from '../../../components/CodeDisplay'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'

type AppArtifactsProps = {
  isFetched?: boolean
  roflYaml?: Blob
  composeYaml?: Blob
}

export const AppArtifacts: FC<AppArtifactsProps> = ({ isFetched, roflYaml, composeYaml }) => {
  const [roflContent, setRoflContent] = useState<string>('')
  const [composeContent, setComposeContent] = useState<string>('')

  useEffect(() => {
    if (roflYaml) {
      roflYaml.text().then(content => {
        setRoflContent(content)
      })
    }
  }, [roflYaml])

  useEffect(() => {
    if (composeYaml) {
      composeYaml.text().then(content => {
        setComposeContent(content)
      })
    }
  }, [composeYaml])

  return (
    <div className="space-y-6">
      {!isFetched && <Skeleton className="w-full h-[400px]" />}
      {isFetched && (
        <>
          {roflContent && (
            <div>
              <h3 className="text-lg font-semibold mb-2">rofl.yaml</h3>
              <RawCode data={roflContent} />
            </div>
          )}
          {composeContent && (
            <div>
              <h3 className="text-lg font-semibold mb-2">compose.yaml</h3>
              <RawCode data={composeContent} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
