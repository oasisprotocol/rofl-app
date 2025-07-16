import { useSurveyPopup } from '../../hooks/useSurveyPopup.ts'
import type { FC, PropsWithChildren } from 'react'
import { SurveyPopup } from '../../components/SurveyPopup'

export const SurveyPopupProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isVisible, closePopup } = useSurveyPopup()

  return (
    <>
      {children}
      <SurveyPopup isVisible={isVisible} onClose={closePopup} />
    </>
  )
}
