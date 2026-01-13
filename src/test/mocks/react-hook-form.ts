import * as React from 'react'

// Store form instances to allow Controller to access form state
export const formInstances = new Map<any, any>()

// Helper to safely get React hooks
const getReact = () => {
  if (typeof React.useState === 'function') {
    return React
  }
  // Fallback for when React isn't fully initialized
  return {
    useState: (initial: any) => {
      let value = initial
      const setValue = (newValue: any) => {
        value = typeof newValue === 'function' ? newValue(value) : newValue
      }
      return [value, setValue]
    },
    useRef: (initial: any) => ({ current: initial }),
    useEffect: () => { },
    useMemo: (fn: any) => fn(),
    useContext: () => null,
    createContext: () => ({
      Provider: ({ children }: any) => children,
      Consumer: ({ children }: any) => children,
    }),
    createElement: React.createElement || (() => null),
    Fragment: React.Fragment || Symbol('Fragment'),
  }
}

// Mock useForm hook
export const useForm = (props: any = {}) => {
  const R = getReact()
  const useState = R.useState
  const useRef = R.useRef
  const useEffect = R.useEffect

  const defaultValues = props.defaultValues || {}
  const [formValues, setFormValues] = useState(defaultValues)
  const formRef = useRef(Math.random())

  // Use a ref to store the current formValues so methods can access the latest value
  // without creating new function references
  const formValuesRef = useRef(formValues)
  formValuesRef.current = formValues

  const formState = {
    errors: {},
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {},
    dirtyFields: {},
    validatingFields: {},
  }

  // Store this form instance so Controller can access it
  useEffect(() => {
    formInstances.set(formRef.current, {
      getValues: () => formValuesRef.current,
      setValue: (name: string, value: any) => {
        setFormValues((prev: any) => ({
          ...prev,
          [name]: value,
        }))
      },
    })
    return () => {
      formInstances.delete(formRef.current)
    }
  }, [])

  // Create stable function references using refs
  const stableFormRef = useRef({
    register: () => ({}),
    unregister: () => { },
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.()
      return fn(formValuesRef.current)
    },
    watch: (name?: string | string[]) => {
      const currentValues = formValuesRef.current
      if (typeof name === 'string') {
        const keys = name.split('.')
        let value: any = currentValues
        for (const key of keys) {
          value = value?.[key]
        }
        return value || ''
      }
      if (Array.isArray(name)) {
        return name.map(n => {
          const keys = n.split('.')
          let value: any = currentValues
          for (const key of keys) {
            value = value?.[key]
          }
          return value || ''
        })
      }
      return currentValues
    },
    setValue: (name: string, value: any) => {
      setFormValues((prev: any) => ({
        ...prev,
        [name]: value,
      }))
    },
    getValues: () => formValuesRef.current,
    trigger: () => Promise.resolve(true),
    formState,
    reset: (newValues?: any) => {
      setFormValues(newValues ?? defaultValues)
    },
    clearErrors: () => { },
    setError: () => { },
    control: { _formRef: formRef.current },
  })

  return stableFormRef.current
}

// Mock Controller component
export const Controller: React.FC<any> = ({ name, control, render, defaultValue = '' }) => {
  const R = getReact()
  const useState = R.useState
  const useEffect = R.useEffect
  const useRef = R.useRef
  const createElement = R.createElement

  const [value, setValue] = useState(defaultValue)
  const initializedRef = useRef(false)

  // Get initial value from form on mount only (not on every render)
  useEffect(() => {
    if (!initializedRef.current && control?._formRef) {
      const formInstance = formInstances.get(control._formRef)
      if (formInstance) {
        const formValue = formInstance.getValues()[name]
        if (formValue !== undefined) {
          setValue(formValue)
        }
      }
      initializedRef.current = true
    }
  }, [control, name, defaultValue])

  const mockField = {
    name,
    value,
    onChange: (newValue: any) => {
      const actualValue =
        typeof newValue === 'object' && 'target' in newValue ? newValue.target.value : newValue
      setValue(actualValue)

      // Update the form value
      if (control?._formRef) {
        const formInstance = formInstances.get(control._formRef)
        if (formInstance) {
          formInstance.setValue(name, actualValue)
        }
      }
    },
    onBlur: () => { },
    ref: () => { },
  }
  const mockFieldState = {
    invalid: false,
    isTouched: false,
    isDirty: false,
    error: undefined,
  }
  return createElement(R.Fragment, null, render({ field: mockField, fieldState: mockFieldState }))
}

// Mock FormProvider component
export const FormProvider: React.FC<any> = ({ children, ...props }) => {
  const R = getReact()
  const createContext = R.createContext
  const useContext = R.useContext

  // Create context on first use
  const FormContext = createContext(null)

  // Get existing context or create new one
  const context = useContext(FormContext)

  const Provider = (FormContext as any).Provider || (({ children }: any) => children)

  return createElement(Provider, { value: props }, children)
}

// Mock useFormContext hook
export const useFormContext = () => {
  const R = getReact()
  const useContext = R.useContext

  const context = useContext(
    (R as any).createContext?.(null) || { Provider: ({ children }: any) => children },
  )
  if (!context) {
    return useForm()
  }
  return context
}

// Mock useFieldArray hook
export const useFieldArray = () => ({
  fields: [],
  append: () => { },
  prepend: () => { },
  insert: () => { },
  swap: () => { },
  move: () => { },
  update: () => { },
  replace: () => { },
  remove: () => { },
})

// Re-export types
export type { FieldValues, UseFormRegister, UseFormReturn, Control } from 'react-hook-form'
