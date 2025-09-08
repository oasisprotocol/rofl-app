import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SURVEY_POPUP_STORAGE_KEY = 'survey-popup-dismissed'

const ALLOWED_ROUTES = ['/', '/dashboard', '/create', '/templates']

export const useSurveyPopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const isDismissed = localStorage.getItem(SURVEY_POPUP_STORAGE_KEY)
    const isAllowedRoute = ALLOWED_ROUTES.includes(location.pathname)

    if (!isDismissed && isAllowedRoute) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [location.pathname])

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
