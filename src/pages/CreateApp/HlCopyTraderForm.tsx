import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { hlCopyTraderFormSchema, type HlCopyTraderFormData, type ERC8004FormData } from './types'
import { InputFormField } from '../../components/InputFormField'

type HlCopyTraderFormProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: HlCopyTraderFormData & ERC8004FormData
  setAppDataForm: (data: { inputs: HlCopyTraderFormData & ERC8004FormData }) => void
}

export const HlCopyTraderForm: FC<HlCopyTraderFormProps> = ({
  handleNext,
  handleBack,
  inputs,
  setAppDataForm,
}) => {
  const form = useForm<HlCopyTraderFormData>({
    resolver: zodResolver(hlCopyTraderFormSchema),
    defaultValues: {
      secrets: {
        COPY_TRADE_ADDRESS: '',
        WITHDRAW_FUNDS_TO: '',
        WITHDRAW: 'false', // Hidden, not editable, prefilled WITHDRAW="false"
      },
      ...inputs,
    },
  })

  function onSubmit(values: HlCopyTraderFormData) {
    setAppDataForm({ inputs: values as HlCopyTraderFormData & ERC8004FormData })
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <InputFormField
        control={form.control}
        name="secrets.COPY_TRADE_ADDRESS"
        label="Trader Address to Copy"
        placeholder="0x..."
      />

      <InputFormField
        control={form.control}
        name="secrets.WITHDRAW_FUNDS_TO"
        label="Withdrawal Address"
        placeholder="0x..."
      />

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
