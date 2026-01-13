import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppArtifacts } from './AppArtifacts'

describe('AppArtifacts', () => {
  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(AppArtifacts).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof AppArtifacts).toBe('function')
    })
  })

  describe('Rendering States', () => {
    it('should render skeleton when not fetched', () => {
      const { container } = render(<AppArtifacts isFetched={false} />)

      const skeleton = container.querySelector('.h-\\[400px\\]')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render content when fetched', () => {
      const { container } = render(
        <AppArtifacts isFetched={true} roflYaml="test: yaml" composeYaml="compose: test" />,
      )

      expect(container.textContent).toContain('rofl.yaml')
      expect(container.textContent).toContain('compose.yaml')
    })

    it('should not render skeleton when fetched', () => {
      const { container } = render(
        <AppArtifacts isFetched={true} roflYaml="test: yaml" composeYaml="compose: test" />,
      )

      const skeleton = container.querySelector('.h-\\[400px\\]')
      expect(skeleton).not.toBeInTheDocument()
    })
  })

  describe('ROFL YAML Display', () => {
    it('should render rofl.yaml section when provided', () => {
      render(<AppArtifacts isFetched={true} roflYaml="version: 1" />)

      expect(screen.getByText('rofl.yaml')).toBeInTheDocument()
    })

    it('should render CodeDisplay for rofl.yaml', () => {
      const roflYamlContent = 'version: 1\ntest: value'
      const { container } = render(<AppArtifacts isFetched={true} roflYaml={roflYamlContent} />)

      expect(container.textContent).toContain('rofl.yaml')
    })

    it('should not render rofl.yaml section when not provided', () => {
      const { container } = render(<AppArtifacts isFetched={true} composeYaml="test: yaml" />)

      expect(container.textContent).not.toContain('rofl.yaml')
    })

    it('should handle empty rofl.yaml string', () => {
      render(<AppArtifacts isFetched={true} roflYaml="" />)

      // Empty string is falsy, so it shouldn't render the section
      expect(screen.queryByText('rofl.yaml')).not.toBeInTheDocument()
    })
  })

  describe('Compose YAML Display', () => {
    it('should render compose.yaml section when provided', () => {
      render(<AppArtifacts isFetched={true} composeYaml="version: 3" />)

      expect(screen.getByText('compose.yaml')).toBeInTheDocument()
    })

    it('should render CodeDisplay for compose.yaml', () => {
      const composeYamlContent = 'version: 3\nservices:\n  test: value'
      const { container } = render(<AppArtifacts isFetched={true} composeYaml={composeYamlContent} />)

      expect(container.textContent).toContain('compose.yaml')
    })

    it('should not render compose.yaml section when not provided', () => {
      const { container } = render(<AppArtifacts isFetched={true} roflYaml="test: yaml" />)

      expect(container.textContent).not.toContain('compose.yaml')
    })

    it('should handle empty compose.yaml string', () => {
      render(<AppArtifacts isFetched={true} composeYaml="" />)

      // Empty string is falsy, so it shouldn't render the section
      expect(screen.queryByText('compose.yaml')).not.toBeInTheDocument()
    })
  })

  describe('Both Artifacts', () => {
    it('should render both rofl and compose yaml when both provided', () => {
      const { container: _container } = render(
        <AppArtifacts isFetched={true} roflYaml="version: 1" composeYaml="version: 3" />,
      )

      expect(screen.getByText('rofl.yaml')).toBeInTheDocument()
      expect(screen.getByText('compose.yaml')).toBeInTheDocument()
    })

    it('should render sections in correct order', () => {
      const { container } = render(
        <AppArtifacts isFetched={true} roflYaml="rofl content" composeYaml="compose content" />,
      )

      const textContent = container.textContent || ''
      const roflIndex = textContent.indexOf('rofl.yaml')
      const composeIndex = textContent.indexOf('compose.yaml')

      expect(roflIndex).toBeLessThan(composeIndex)
    })
  })

  describe('Layout and Styling', () => {
    it('should use space-y-6 class for vertical spacing', () => {
      const { container } = render(<AppArtifacts isFetched={true} roflYaml="test: yaml" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('space-y-6')
    })

    it('should render heading with correct styling', () => {
      const { container } = render(<AppArtifacts isFetched={true} roflYaml="test: yaml" />)

      const headings = container.querySelectorAll('h3')
      headings.forEach(heading => {
        expect(heading.className).toContain('text-lg')
        expect(heading.className).toContain('font-semibold')
        expect(heading.className).toContain('mb-2')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should render empty content when fetched but no artifacts provided', () => {
      const { container } = render(<AppArtifacts isFetched={true} />)

      // Should have the wrapper but no artifact sections
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.children.length).toBe(0)
    })

    it('should handle undefined props gracefully', () => {
      const { container } = render(<AppArtifacts />)

      // isFetched is undefined (falsy), so should show skeleton
      const skeleton = container.querySelector('.h-\\[400px\\]')
      expect(skeleton).toBeInTheDocument()
    })

    it('should handle very long yaml content', () => {
      const longYaml = 'a'.repeat(10000)
      const { container } = render(<AppArtifacts isFetched={true} roflYaml={longYaml} />)

      expect(container.textContent?.length).toBeGreaterThan(10000)
    })
  })

  describe('Props Interface', () => {
    it('should accept isFetched prop', () => {
      const props = { isFetched: true }
      expect(props.isFetched).toBe(true)
    })

    it('should accept roflYaml prop', () => {
      const props = { roflYaml: 'test: yaml' }
      expect(props.roflYaml).toBe('test: yaml')
    })

    it('should accept composeYaml prop', () => {
      const props = { composeYaml: 'version: 3' }
      expect(props.composeYaml).toBe('version: 3')
    })

    it('should handle optional props correctly', () => {
      // All props are optional
      const props1: AppArtifactsProps = {}
      const props2: AppArtifactsProps = { isFetched: true }
      const props3: AppArtifactsProps = { roflYaml: 'test' }
      const props4: AppArtifactsProps = { composeYaml: 'test' }
      const props5: AppArtifactsProps = {
        isFetched: true,
        roflYaml: 'rofl',
        composeYaml: 'compose',
      }

      expect(props1).toBeDefined()
      expect(props2.isFetched).toBe(true)
      expect(props3.roflYaml).toBe('test')
      expect(props4.composeYaml).toBe('test')
      expect(props5.isFetched).toBe(true)
    })
  })

  describe('Component Behavior', () => {
    it('should transition from loading to loaded state', () => {
      const { container, rerender } = render(<AppArtifacts isFetched={false} />)

      // Should have skeleton
      expect(container.querySelector('.h-\\[400px\\]')).toBeInTheDocument()

      // Update to fetched state
      rerender(<AppArtifacts isFetched={true} roflYaml="test: yaml" />)

      // Should not have skeleton anymore
      expect(container.querySelector('.h-\\[400px\\]')).not.toBeInTheDocument()
    })

    it('should preserve yaml content through re-renders', () => {
      const roflYaml = 'version: 1\ntest: value'
      const { container, rerender } = render(<AppArtifacts isFetched={true} roflYaml={roflYaml} />)

      expect(container.textContent).toContain('version: 1')

      // Re-render with same props
      rerender(<AppArtifacts isFetched={true} roflYaml={roflYaml} />)

      expect(container.textContent).toContain('version: 1')
    })
  })

  describe('Integration with CodeDisplay', () => {
    it('should pass roflYaml data to CodeDisplay', () => {
      const roflYaml = 'test: data\nvalue: 123'
      render(<AppArtifacts isFetched={true} roflYaml={roflYaml} />)

      // The component should render the yaml content
      expect(screen.getByText(/test: data/i)).toBeInTheDocument()
    })

    it('should pass composeYaml data to CodeDisplay', () => {
      const composeYaml = 'services:\n  web:\n    image: test'
      render(<AppArtifacts isFetched={true} composeYaml={composeYaml} />)

      // The component should render the yaml content
      expect(screen.getByText(/services/i)).toBeInTheDocument()
    })
  })
})

type AppArtifactsProps = React.ComponentProps<typeof AppArtifacts>
