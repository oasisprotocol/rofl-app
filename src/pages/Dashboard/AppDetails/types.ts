import { type RoflAppSecrets } from '../../../nexus/api'
import { type MetadataFormData } from '../../CreateApp/types'

export type ViewMetadataState = {
  isDirty: boolean
  metadata: MetadataFormData
}

export type ViewSecretsState = {
  isDirty: boolean
  secrets: RoflAppSecrets
}
