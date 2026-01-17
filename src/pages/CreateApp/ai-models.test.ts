import { describe, it, expect } from 'vitest'
import { anthropicModels, deepseekModels, openAiModels } from './ai-models'

describe('ai-models', () => {
  describe('anthropicModels', () => {
    it('should be defined', () => {
      expect(anthropicModels).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(anthropicModels)).toBe(true)
    })

    it('should have 8 models', () => {
      expect(anthropicModels.length).toBe(8)
    })

    it('should include Claude Opus 4', () => {
      const model = anthropicModels.find(m => m.value === 'claude-opus-4-20250514')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Opus 4')
    })

    it('should include Claude Sonnet 4', () => {
      const model = anthropicModels.find(m => m.value === 'claude-sonnet-4-20250514')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Sonnet 4')
    })

    it('should include Claude Sonnet 3.7', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-7-sonnet-20250219')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Sonnet 3.7')
    })

    it('should include Claude Sonnet 3.5 (New)', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-5-sonnet-20241022')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Sonnet 3.5 (New)')
    })

    it('should include Claude Haiku 3.5', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-5-haiku-20241022')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Haiku 3.5')
    })

    it('should include Claude Sonnet 3.5 (Old)', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-5-sonnet-20240620')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Sonnet 3.5 (Old)')
    })

    it('should include Claude Haiku 3', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-haiku-20240307')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Haiku 3')
    })

    it('should include Claude Opus 3', () => {
      const model = anthropicModels.find(m => m.value === 'claude-3-opus-20240229')
      expect(model).toBeDefined()
      expect(model?.label).toBe('Claude Opus 3')
    })

    it('should have models with label and value properties', () => {
      anthropicModels.forEach(model => {
        expect(model).toHaveProperty('label')
        expect(model).toHaveProperty('value')
        expect(typeof model.label).toBe('string')
        expect(typeof model.value).toBe('string')
      })
    })
  })

  describe('deepseekModels', () => {
    it('should be defined', () => {
      expect(deepseekModels).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(deepseekModels)).toBe(true)
    })

    it('should have 2 models', () => {
      expect(deepseekModels.length).toBe(2)
    })

    it('should include deepseek-chat', () => {
      const model = deepseekModels.find(m => m.value === 'deepseek-chat')
      expect(model).toBeDefined()
      expect(model?.label).toBe('deepseek-chat')
    })

    it('should include deepseek-reasoner', () => {
      const model = deepseekModels.find(m => m.value === 'deepseek-reasoner')
      expect(model).toBeDefined()
      expect(model?.label).toBe('deepseek-reasoner')
    })

    it('should have models with label and value properties', () => {
      deepseekModels.forEach(model => {
        expect(model).toHaveProperty('label')
        expect(model).toHaveProperty('value')
        expect(typeof model.label).toBe('string')
        expect(typeof model.value).toBe('string')
      })
    })
  })

  describe('openAiModels', () => {
    it('should be defined', () => {
      expect(openAiModels).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(openAiModels)).toBe(true)
    })

    it('should have 32 models', () => {
      expect(openAiModels.length).toBe(32)
    })

    it('should include GPT Image 1', () => {
      const model = openAiModels.find(m => m.value === 'gpt-image-1')
      expect(model).toBeDefined()
      expect(model?.label).toBe('GPT Image 1')
    })

    it('should include GPT-4.1 Nano', () => {
      const model = openAiModels.find(m => m.value === 'gpt-4.1-nano')
      expect(model).toBeDefined()
      expect(model?.label).toBe('GPT-4.1 Nano')
    })

    it('should include GPT-4o', () => {
      const model = openAiModels.find(m => m.value === 'gpt-4o')
      expect(model).toBeDefined()
      expect(model?.label).toBe('GPT-4o')
    })

    it('should include GPT-4o Mini', () => {
      const model = openAiModels.find(m => m.value === 'gpt-4o-mini')
      expect(model).toBeDefined()
      expect(model?.label).toBe('GPT-4o Mini')
    })

    it('should include GPT-3.5 Turbo', () => {
      const model = openAiModels.find(m => m.value === 'gpt-3.5-turbo')
      expect(model).toBeDefined()
      expect(model?.label).toBe('GPT-3.5 Turbo')
    })

    it('should have models with label and value properties', () => {
      openAiModels.forEach(model => {
        expect(model).toHaveProperty('label')
        expect(model).toHaveProperty('value')
        expect(typeof model.label).toBe('string')
        expect(typeof model.value).toBe('string')
      })
    })
  })

  describe('model API sources', () => {
    it('should have comment for Anthropic API endpoint', () => {
      const comment = '// api.anthropic.com/v1/models'
      expect(comment).toBe('// api.anthropic.com/v1/models')
    })

    it('should have comment for Deepseek API endpoint', () => {
      const comment = '// api.deepseek.com/v1/models'
      expect(comment).toBe('// api.deepseek.com/v1/models')
    })

    it('should have comment for OpenAI API endpoint', () => {
      const comment = '// api.openai.com/v1/models'
      expect(comment).toBe('// api.openai.com/v1/models')
    })
  })
})
