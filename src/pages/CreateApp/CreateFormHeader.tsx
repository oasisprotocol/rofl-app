import { type ReactNode, type FC } from 'react'

type CreateFormHeaderProps = {
  title: string
  description?: ReactNode
}

export const CreateFormHeader: FC<CreateFormHeaderProps> = ({ title, description }) => {
  return (
    <div>
      <h1 className="text-2xl font-white font-bold mb-2 text-center">{title}</h1>
      {description && <p className="text-muted-foreground text-sm text-center">{description}</p>}
    </div>
  )
}
