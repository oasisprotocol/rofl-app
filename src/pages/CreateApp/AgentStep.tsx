import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { TgbotAgentForm } from './TgbotAgentForm'
import { XAgentForm } from './XAgentForm'
import { type AgentFormData, type XAgentFormData } from './types'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: AgentFormData | XAgentFormData
  setAppDataForm: (data: { agent: AgentFormData | XAgentFormData }) => void
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
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
      selectedTemplateName={selectedTemplateName}
    >
      <CreateFormHeader
        title="Agent Config"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />
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
    </CreateLayout>
  )
}
