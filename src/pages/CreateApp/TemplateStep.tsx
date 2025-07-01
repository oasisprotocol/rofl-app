import { type FC } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import { type AppData } from './types'
import { templates } from './templates'
import { TemplatesList } from '../../components/TemplatesList'

type TemplateStepProps = {
  handleNext: () => void
  setAppDataForm: (data: Partial<AppData>) => void
}

export const TemplateStep: FC<TemplateStepProps> = ({ handleNext, setAppDataForm }) => {
  const handleTemplateSelect = (id: string) => {
    const template = templates.find(template => template.id === id)
    setAppDataForm({
      template: id,
      ...template?.initialValues,
    })
    handleNext()
  }

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      <Layout headerContent={<Header />} footerContent={<Footer />}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-2xl font-white font-bold mb-2 ">Create app from template</h1>
          </div>
          <TemplatesList handleTemplateSelect={handleTemplateSelect} />
        </div>
      </Layout>
    </div>
  )
}
