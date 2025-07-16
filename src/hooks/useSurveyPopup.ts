import { useState, useEffect } from 'react'

const SURVEY_POPUP_STORAGE_KEY = 'survey-popup-dismissed'

export const useSurveyPopup = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem(SURVEY_POPUP_STORAGE_KEY)

    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const closePopup = () => {
    setIsVisible(false)
    localStorage.setItem(SURVEY_POPUP_STORAGE_KEY, 'true')
  }

  const resetPopup = () => {
    localStorage.removeItem(SURVEY_POPUP_STORAGE_KEY)
    setIsVisible(false)
  }

  return {
    isVisible,
    closePopup,
    resetPopup,
  }
}
