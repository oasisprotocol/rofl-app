import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { TgbotAgentForm } from './TgbotAgentForm'
import { type AgentFormData } from './types'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: AgentFormData
  setAppDataForm: (data: { agent: AgentFormData }) => void
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

      {selectedTemplateId === 'tgbot' ? (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={agent}
          setAppDataForm={setAppDataForm}
        />
      ) : (
        <>
          <div className="space-y-6 mb-6 w-full">
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">TODO: X-Agent configuration form</p>
            </div>
            <CreateFormNavigation handleNext={handleNext} handleBack={handleBack} disabled={false} />
          </div>
        </>
      )}
    </CreateLayout>
  )
}
