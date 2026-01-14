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
  const [enableERC8004, setEnableERC8004] = useState(false)

  const form = useForm<ERC8004FormData>({
    resolver: enableERC8004 ? zodResolver(erc8004Schema) : undefined,
    defaultValues: {
      secrets: {
        ERC8004_CHAIN_SELECTION: '11155111',
        ERC8004_RPC_URL: inputs?.secrets?.ERC8004_RPC_URL ?? '',
        ERC8004_PINATA_JWT: '',
        ERC8004_SIGNING_KEY: '',
        ERC8004_AGENT_NAME: metadata?.name ?? '',
        ERC8004_AGENT_DESCRIPTION: metadata?.description ?? '',
        ERC8004_AGENT_VERSION: metadata?.version ?? '',
        ERC8004_AGENT_CATEGORY: '',
        ERC8004_AGENT_IMAGE: '',
        ERC8004_AGENT_MCP: '',
        ERC8004_AGENT_A2A: '',
        ERC8004_AGENT_ENS: '',
        ...inputs?.secrets,
      },
    },
  })

  const chainSelection = form.watch('secrets.ERC8004_CHAIN_SELECTION')
  const isCustomChain = chainSelection === 'custom'

  const chainOptions = [
    ...Object.entries(ROFL_8004_SUPPORTED_CHAINS).map(([key, config]) => ({
      value: key,
      label: config.chain.name,
    })),
    { value: 'custom', label: 'Custom RPC URL' },
  ]

  function onSubmit(values: ERC8004FormData) {
    if (!enableERC8004) {
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
          ERC8004_VALIDATOR_ADDRESS:
            values.secrets.ERC8004_CHAIN_SELECTION !== 'custom'
              ? ROFL_8004_SUPPORTED_CHAINS[
                  values.secrets.ERC8004_CHAIN_SELECTION as keyof typeof ROFL_8004_SUPPORTED_CHAINS
                ]?.validatorAddress
              : values.secrets.ERC8004_VALIDATOR_ADDRESS,
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
      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          id="enable-erc-8004"
          checked={enableERC8004}
          onCheckedChange={checked => setEnableERC8004(checked === true)}
        />
        <Label htmlFor="enable-erc-8004">Enable ERC-8004 Identity Registration</Label>
      </div>

      {enableERC8004 && (
        <>
          <hr />

          <SelectFormField
            control={form.control}
            name="secrets.ERC8004_CHAIN_SELECTION"
            label="Chain for trustless agent registration"
            placeholder="Select chain"
            options={chainOptions}
          />

          {isCustomChain && (
            <>
              <InputFormField
                control={form.control}
                type="input"
                name="secrets.ERC8004_RPC_URL"
                label="Custom RPC URL"
                placeholder="https://your-rpc-url.com"
                info="Enter the full RPC URL for trustless agent registration"
              />

              <InputFormField
                control={form.control}
                type="input"
                name="secrets.ERC8004_VALIDATOR_ADDRESS"
                label="Validator address (Optional)"
                placeholder="0x1234567890abcde1234567890abcde1234567890"
              />
            </>
          )}

          <InputFormField
            control={form.control}
            type="textarea"
            name="secrets.ERC8004_PINATA_JWT"
            label="Pinata JWT Token"
            placeholder="1234567890abcde..."
            info="Your Pinata JWT token is used to pin agent metadata to IPFS. Get it from pinata.cloud"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_NAME"
            label="Agent Name (Optional)"
            placeholder="rofl-agent"
          />

          <InputFormField
            control={form.control}
            type="textarea"
            name="secrets.ERC8004_AGENT_DESCRIPTION"
            label="Agent Description (Optional)"
            placeholder="Oasis ROFL-powered trustless agent"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_IMAGE"
            label="Agent Image URL (Optional)"
            placeholder="https://example.com/logo.png"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_VERSION"
            label="Agent Version (Optional)"
            placeholder="0.1.0"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_CATEGORY"
            label="Agent Category (Optional)"
            placeholder="rofl"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_MCP"
            label="Agent MCP (Optonal)"
            placeholder="https://mcp.agent.com"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_A2A"
            label="Agent A2A (Optonal)"
            placeholder="https://agent.example/.well-known/agent-card.json"
          />

          <InputFormField
            control={form.control}
            type="input"
            name="secrets.ERC8004_AGENT_ENS"
            label="Agent ENS (Optonal)"
            placeholder="agent.eth"
          />

          <InputFormField
            control={form.control}
            type="password"
            name="secrets.ERC8004_SIGNING_KEY"
            label="Private key for trustless agent registration (Optional)"
            placeholder="1234567890abcde1234567890abcde1234567890abcde1234567890abcde123"
            info="Optional private key used to sign and submit your agent to the ERC-8004 registry. If not provided, a fresh keypair will be generated inside ROFL and its address reported in the erc8004_signing_key replica metadata field."
          />
        </>
      )}

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
