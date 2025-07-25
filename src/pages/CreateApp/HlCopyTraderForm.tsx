import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { hlCopyTraderFormSchema, type HlCopyTraderFormData } from './types'
import { InputFormField } from '../../components/InputFormField'

type HlCopyTraderFormProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: HlCopyTraderFormData
  setAppDataForm: (data: { agent: HlCopyTraderFormData }) => void
}

export const HlCopyTraderForm: FC<HlCopyTraderFormProps> = ({
  handleNext,
  handleBack,
  agent,
  setAppDataForm,
}) => {
  const form = useForm<HlCopyTraderFormData>({
    resolver: zodResolver(hlCopyTraderFormSchema),
    defaultValues: { ...agent },
  })

  function onSubmit(values: HlCopyTraderFormData) {
    setAppDataForm({ agent: values })
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <InputFormField
        control={form.control}
        name="COPY_TRADE_ADDRESS"
        label="Trader Address to Copy"
        placeholder="0x..."
      />

      <InputFormField
        control={form.control}
        name="WITHDRAW_FUNDS_TO"
        label="Withdrawal Address"
        placeholder="0x..."
      />

      {/* Hidden prefilled WITHDRAW="false" */}

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
