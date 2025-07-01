import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { TgbotAgentForm } from './TgbotAgentForm'
import { XAgentForm } from './XAgentForm'
import { HlCopyTraderForm } from './HlCopyTraderForm'
import { type AgentFormData, type XAgentFormData, type HlCopyTraderFormData } from './types'
import { AgentStepHints } from './AgentStepHints'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: AgentFormData | XAgentFormData | HlCopyTraderFormData
  setAppDataForm: (data: { agent: AgentFormData | XAgentFormData | HlCopyTraderFormData }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
}

export const AgentStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  agent,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateId,
}) => {
  return (
    <CreateLayout
      currentStep={2}
      hints={[
        {
          title: 'kill it',
          description: <AgentStepHints selectedTemplateId={selectedTemplateId} />,
        },
      ]}
      selectedTemplateName={selectedTemplateName}
    >
      <CreateFormHeader title="Setup Agent" description="" />

      {selectedTemplateId === 'tgbot' && (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={agent as AgentFormData}
          setAppDataForm={setAppDataForm as (data: { agent: AgentFormData }) => void}
        />
      )}
      {selectedTemplateId === 'x-agent' && (
        <XAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={agent as XAgentFormData}
          setAppDataForm={setAppDataForm as (data: { agent: XAgentFormData }) => void}
        />
      )}
      {selectedTemplateId === 'hl-copy-trader' && (
        <HlCopyTraderForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={agent as HlCopyTraderFormData}
          setAppDataForm={setAppDataForm as (data: { agent: HlCopyTraderFormData }) => void}
        />
      )}
    </CreateLayout>
  )
}
