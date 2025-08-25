import { type FC } from 'react'
import { CodeDisplay } from '../../../components/CodeDisplay'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'

type AppArtifactsProps = {
  isFetched?: boolean
  roflYaml?: string
  composeYaml?: string
}

export const AppArtifacts: FC<AppArtifactsProps> = ({ isFetched, roflYaml, composeYaml }) => {
  return (
    <div className="space-y-6">
      {!isFetched && <Skeleton className="w-full h-[400px]" />}
      {isFetched && (
        <>
          {roflYaml && (
            <div>
              <h3 className="text-lg font-semibold mb-2">rofl.yaml</h3>
              <CodeDisplay data={roflYaml} />
            </div>
          )}
          {composeYaml && (
            <div>
              <h3 className="text-lg font-semibold mb-2">compose.yaml</h3>
              <CodeDisplay data={composeYaml} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
