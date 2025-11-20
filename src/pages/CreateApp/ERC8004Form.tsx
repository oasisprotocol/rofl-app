import { type FC, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { erc8004Schema, type ERC8004FormData, type AppDataInputs } from './types'
import { InputFormField } from '../../components/InputFormField'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { Checkbox } from '@oasisprotocol/ui-library/src/components/ui/checkbox'
import { addROFL8004RpcPrefix, stripROFL8004RpcPrefix } from '../../utils/rofl-8004.ts'

type Props = {
  handleNext: () => void
  handleBack: () => void
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
}

export const ERC8004Form: FC<Props> = ({ handleNext, handleBack, inputs, setAppDataForm }) => {
  const [skipERC8004, setSkipERC8004] = useState(false)

  const form = useForm<ERC8004FormData>({
    resolver: skipERC8004 ? undefined : zodResolver(erc8004Schema),
    defaultValues: {
      secrets: {
        ERC_8004_RPC_URL: stripROFL8004RpcPrefix(inputs?.secrets?.ERC_8004_RPC_URL),
        ERC_8004_PINATA_JWT: '',
        ERC_8004_PRIVATE_KEY: '',
        ...inputs?.secrets,
      },
    },
  })

  function onSubmit(values: ERC8004FormData) {
    if (skipERC8004) {
      setAppDataForm({
        inputs: {
          secrets: {},
        } as AppDataInputs,
      })
    } else {
      setAppDataForm({
        inputs: {
          ...values,
          secrets: {
            ...values.secrets,
            ERC_8004_RPC_URL: addROFL8004RpcPrefix(values.secrets.ERC_8004_RPC_URL || ''),
          },
        } as AppDataInputs,
      })
    }
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <InputFormField
        control={form.control}
        type="textarea"
        name="secrets.ERC_8004_PINATA_JWT"
        label="Pinata JWT Token"
        placeholder="1234567890abcde..."
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="password"
        name="secrets.ERC_8004_RPC_URL"
        label="Infura API Token"
        placeholder="1234567890abcde1234567890abcde12"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="password"
        name="secrets.ERC_8004_PRIVATE_KEY"
        label="Private key for agent submittion"
        placeholder="0x1234567890abcde1234567890abcde1234567890abcde1234567890abcde123"
        disabled={skipERC8004}
      />

      <div className="flex items-center gap-2 mt-12">
        <Checkbox
          id="skip-erc-8004"
          checked={skipERC8004}
          onCheckedChange={checked => setSkipERC8004(checked === true)}
        />
        <Label htmlFor="skip-erc-8004">I don't want to use ERC-8004 Identity Registration</Label>
      </div>

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
