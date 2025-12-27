import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { AppDataInputs, type MetadataFormData } from './types'
import { ERC8004Form } from './ERC8004Form.tsx'
import { ERC_8004_ETHEREUM_EIP_URL } from '../../constants/rofl-8004.ts'

type CustomInputsStepProps = {
  handleNext: () => void
  handleBack: () => void
  metadata?: MetadataFormData
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  customStepTitle: string
}

export const ERC8004Step: FC<CustomInputsStepProps> = ({
  handleNext,
  handleBack,
  metadata,
  inputs,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateId,
  customStepTitle,
}) => (
  <CreateLayout
    currentStep={3}
    selectedTemplateName={selectedTemplateName}
    selectedTemplateId={selectedTemplateId}
    customStepTitle={customStepTitle}
  >
    <CreateFormHeader
      title="Trustless agents registration"
      description={
        <>
          <a
            href={ERC_8004_ETHEREUM_EIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            ERC-8004
          </a>
          &nbsp; introduces a blockchain-based framework for discovering and trusting agents across
          organizations without prior relationships. It defines identity, reputation, and validation
          registries to enable secure, transparent agent economies where trust is established through
          feedback, cryptographic proofs, or validator checks.
        </>
      }
    />
    <ERC8004Form
      handleNext={handleNext}
      handleBack={handleBack}
      metadata={metadata}
      inputs={inputs}
      setAppDataForm={erc8004Inputs => {
        setAppDataForm({
          inputs: {
            ...inputs,
            secrets: {
              ...inputs!.secrets,
              ...erc8004Inputs.inputs.secrets,
            },
          } as AppDataInputs,
        })
      }}
    />
  </CreateLayout>
)
