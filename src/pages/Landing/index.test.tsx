import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Landing } from './index'

// Mock dependencies
vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ children, headerContent, footerContent }: any) => (
    <div data-testid="layout">
      {headerContent}
      <main data-testid="layout-main">{children}</main>
      {footerContent}
    </div>
  ),
}))

vi.mock('../../components/Layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../../components/Layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

vi.mock('./Cards', () => ({
  Cards: () => <div data-testid="cards">Cards</div>,
}))

vi.mock('./Hero', () => ({
  Hero: () => <div data-testid="hero">Hero</div>,
}))

describe('Landing Page', () => {
  it('should render without crashing', () => {
    const { container } = render(<Landing />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render Layout component', () => {
    render(<Landing />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render Header component', () => {
    render(<Landing />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should render Footer component', () => {
    render(<Landing />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render Hero component', () => {
    render(<Landing />)
    expect(screen.getByTestId('hero')).toBeInTheDocument()
  })

  it('should render Cards component', () => {
    render(<Landing />)
    expect(screen.getByTestId('cards')).toBeInTheDocument()
  })

  it('should have correct structure with Layout children', () => {
    const { container } = render(<Landing />)
    const layoutMain = screen.getByTestId('layout-main')
    expect(layoutMain).toContainElement(screen.getByTestId('hero'))
    expect(layoutMain).toContainElement(screen.getByTestId('cards'))
  })

  it('should apply custom className for responsive heights', () => {
    const { container } = render(<Landing />)
    // The className is applied directly to the wrapper div
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper?.className).toContain('[&>*]:md:max-h-none')
    expect(wrapper?.className).toContain('[&>*]:md:h-auto')
  })

  it('should be exported as named export', () => {
    expect(Landing).toBeDefined()
    expect(typeof Landing).toBe('function')
  })

  it('should have correct component composition', () => {
    const { container } = render(<Landing />)

    // Verify all main components are present
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('layout-main')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('cards')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render Hero before Cards', () => {
    const { container } = render(<Landing />)
    const layoutMain = screen.getByTestId('layout-main')
    const children = layoutMain?.children

    if (children && children.length >= 2) {
      expect(children[0]).toBe(screen.getByTestId('hero'))
      expect(children[1]).toBe(screen.getByTestId('cards'))
    }
  })
})
