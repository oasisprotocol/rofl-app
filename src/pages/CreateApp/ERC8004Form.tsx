import { type FC, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { erc8004Schema, type ERC8004FormData, type AppDataInputs, type MetadataFormData } from './types'
import { InputFormField } from '../../components/InputFormField'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { Checkbox } from '@oasisprotocol/ui-library/src/components/ui/checkbox'
import { ROFL_8004_SUPPORTED_CHAINS } from '../../constants/rofl-8004.ts'
import { SelectFormField } from '../../components/SelectFormField'

type Props = {
  handleNext: () => void
  handleBack: () => void
  metadata?: MetadataFormData
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
}

export const ERC8004Form: FC<Props> = ({ handleNext, handleBack, inputs, metadata, setAppDataForm }) => {
  const [skipERC8004, setSkipERC8004] = useState(false)

  const form = useForm<ERC8004FormData>({
    resolver: skipERC8004 ? undefined : zodResolver(erc8004Schema),
    defaultValues: {
      secrets: {
        ERC8004_CHAIN_SELECTION: 'custom',
        ERC8004_RPC_URL: (inputs as ERC8004FormData | undefined)?.secrets?.ERC8004_RPC_URL ?? '',
        ERC8004_PINATA_JWT: '',
        ERC8004_SIGNING_KEY: '',
        ERC8004_AGENT_NAME: metadata?.name ?? '',
        ERC8004_AGENT_DESCRIPTION: metadata?.description ?? '',
        ERC8004_AGENT_VERSION: metadata?.version ?? '',
        ERC8004_AGENT_CATEGORY: '',
        ERC8004_AGENT_IMAGE: '',
        ...(inputs as ERC8004FormData | undefined)?.secrets,
      },
    },
  })

  const chainSelection = form.watch('secrets.ERC8004_CHAIN_SELECTION')
  const isCustomChain = chainSelection === 'custom'

  // Prepare chain options
  const chainOptions = [
    ...Object.entries(ROFL_8004_SUPPORTED_CHAINS).map(([key, config]) => ({
      value: key,
      label: config.chain.name,
    })),
    { value: 'custom', label: 'Custom RPC URL' },
  ]

  function onSubmit(values: ERC8004FormData) {
    if (skipERC8004) {
      setAppDataForm({
        inputs: {
          secrets: {},
        } as AppDataInputs,
      })
    } else {
      const nonEmptySecrets = Object.fromEntries(
        Object.entries({
          ...values.secrets,
          ERC8004_RPC_URL:
            values.secrets.ERC8004_CHAIN_SELECTION !== 'custom'
              ? ROFL_8004_SUPPORTED_CHAINS[
                  values.secrets.ERC8004_CHAIN_SELECTION as keyof typeof ROFL_8004_SUPPORTED_CHAINS
                ]?.rpcUrl
              : values.secrets.ERC8004_RPC_URL,
        }).filter(
          ([key, value]) =>
            !['ERC8004_CHAIN_SELECTION'].includes(key) &&
            value !== '' &&
            value !== null &&
            value !== undefined,
        ),
      ) as ERC8004FormData['secrets']

      setAppDataForm({
        inputs: {
          ...values,
          secrets: nonEmptySecrets,
        } as AppDataInputs,
      })
    }
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <SelectFormField
        control={form.control}
        name="secrets.ERC8004_CHAIN_SELECTION"
        label="Chain for token registration"
        placeholder="Select chain"
        options={chainOptions}
        disabled={skipERC8004}
      />

      {isCustomChain && (
        <InputFormField
          control={form.control}
          type="input"
          name="secrets.ERC8004_RPC_URL"
          label="Custom RPC URL"
          placeholder="https://your-rpc-url.com"
          disabled={skipERC8004}
          info="Enter the full RPC URL for your chain"
        />
      )}

      <InputFormField
        control={form.control}
        type="textarea"
        name="secrets.ERC8004_PINATA_JWT"
        label="Pinata JWT Token"
        placeholder="1234567890abcde..."
        disabled={skipERC8004}
        info="Your Pinata JWT token is used to pin agent metadata to IPFS. Get it from pinata.cloud"
      />

      <InputFormField
        control={form.control}
        type="input"
        name="secrets.ERC8004_AGENT_NAME"
        label="Agent Name (Optional)"
        placeholder="rofl-agent"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="textarea"
        name="secrets.ERC8004_AGENT_DESCRIPTION"
        label="Agent Description (Optional)"
        placeholder="Oasis ROFL-powered trustless agent"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="input"
        name="secrets.ERC8004_AGENT_IMAGE"
        label="Agent Image URL (Optional)"
        placeholder="https://example.com/logo.png"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="input"
        name="secrets.ERC8004_AGENT_VERSION"
        label="Agent Version (Optional)"
        placeholder="0.1.0"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="input"
        name="secrets.ERC8004_AGENT_CATEGORY"
        label="Agent Category (Optional)"
        placeholder="rofl"
        disabled={skipERC8004}
      />

      <InputFormField
        control={form.control}
        type="password"
        name="secrets.ERC8004_SIGNING_KEY"
        label="Private key for agent submittion (Optional)"
        placeholder="1234567890abcde1234567890abcde1234567890abcde1234567890abcde123"
        disabled={skipERC8004}
        info="The private key used to sign and submit your agent to the ERC-8004 registry. Add some funds on selected network for token registration."
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
