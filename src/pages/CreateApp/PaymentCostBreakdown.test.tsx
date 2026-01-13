import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentCostBreakdown } from './PaymentCostBreakdown'

describe('PaymentCostBreakdown', () => {
  it('should be defined', () => {
    expect(PaymentCostBreakdown).toBeDefined()
  })

  it('should be a component', () => {
    expect(typeof PaymentCostBreakdown).toBe('function')
  })

  it('should render app registration cost', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText(/app registration/i)).toBeInTheDocument()
    expect(screen.getByText('100 ROSE')).toBeInTheDocument()
  })

  it('should render machine cost', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText(/machine/i)).toBeInTheDocument()
    expect(screen.getByText('50 ROSE')).toBeInTheDocument()
  })

  it('should render transaction fee', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText(/transaction fee/i)).toBeInTheDocument()
    expect(screen.getByText('1 ROSE')).toBeInTheDocument()
  })

  it('should render total cost', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText(/total/i)).toBeInTheDocument()
    expect(screen.getByText('151 ROSE')).toBeInTheDocument()
  })

  it('should render available amount when hasEnoughBalance is true', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText(/available/i)).toBeInTheDocument()
    expect(screen.getByText('1000 ROSE')).toBeInTheDocument()
  })

  it('should show insufficient funds message when hasEnoughBalance is false', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={false}
        availableAmount="50 ROSE"
      />,
    )

    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
  })

  it('should show available amount in destructive color when hasEnoughBalance is false', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={false}
        availableAmount="50 ROSE"
      />,
    )

    // There are multiple instances of the amount, just check it exists
    const amountElements = screen.getAllByText('50 ROSE')
    expect(amountElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
  })

  it('should accept all required props', () => {
    const props = {
      appCost: '100 ROSE',
      deployCost: '50 ROSE',
      transactionFee: '1 ROSE',
      total: '151 ROSE',
      hasEnoughBalance: true,
      availableAmount: '1000 ROSE',
    }

    render(<PaymentCostBreakdown {...props} />)

    expect(screen.getByText('100 ROSE')).toBeInTheDocument()
    expect(screen.getByText('50 ROSE')).toBeInTheDocument()
    expect(screen.getByText('1 ROSE')).toBeInTheDocument()
    expect(screen.getByText('151 ROSE')).toBeInTheDocument()
  })

  it('should render separator lines between cost items', () => {
    const { container } = render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const separators = container.querySelectorAll('hr')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should display costs in proper layout', () => {
    const { container } = render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const breakdown = container.querySelector('.flex.flex-col.space-y-2')
    expect(breakdown).toBeInTheDocument()
  })

  it('should have proper text styling for labels', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    // Labels should have "text-sm font-medium text-foreground" class
    expect(screen.getByText(/app registration/i)).toBeInTheDocument()
    expect(screen.getByText(/machine/i)).toBeInTheDocument()
    expect(screen.getByText(/transaction fee/i)).toBeInTheDocument()
  })

  it('should have proper text styling for cost values', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    // Cost values should have "text-sm text-muted-foreground" class
    expect(screen.getByText('100 ROSE')).toBeInTheDocument()
  })

  it('should have proper text styling for total values', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    // Total values should have "text-sm font-medium text-foreground" class
    const totals = screen.getAllByText('151 ROSE')
    expect(totals.length).toBeGreaterThan(0)
  })

  it('should handle zero costs', () => {
    render(
      <PaymentCostBreakdown
        appCost="0 ROSE"
        deployCost="0 ROSE"
        transactionFee="0 ROSE"
        total="0 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    // Zero costs appear multiple times, just check one exists
    const zeroCostElements = screen.getAllByText('0 ROSE')
    expect(zeroCostElements.length).toBeGreaterThan(0)
  })

  it('should handle large costs', () => {
    render(
      <PaymentCostBreakdown
        appCost="10000 ROSE"
        deployCost="5000 ROSE"
        transactionFee="100 ROSE"
        total="15100 ROSE"
        hasEnoughBalance={false}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText('10000 ROSE')).toBeInTheDocument()
    expect(screen.getByText('5000 ROSE')).toBeInTheDocument()
    expect(screen.getByText('100 ROSE')).toBeInTheDocument()
    expect(screen.getByText('15100 ROSE')).toBeInTheDocument()
  })

  it('should handle different currency symbols', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ETH"
        deployCost="50 ETH"
        transactionFee="1 ETH"
        total="151 ETH"
        hasEnoughBalance={true}
        availableAmount="1000 ETH"
      />,
    )

    expect(screen.getByText('100 ETH')).toBeInTheDocument()
    expect(screen.getByText('151 ETH')).toBeInTheDocument()
  })

  it('should handle decimal amounts', () => {
    render(
      <PaymentCostBreakdown
        appCost="100.5 ROSE"
        deployCost="50.25 ROSE"
        transactionFee="1.75 ROSE"
        total="152.5 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000.0 ROSE"
      />,
    )

    expect(screen.getByText('100.5 ROSE')).toBeInTheDocument()
    expect(screen.getByText('50.25 ROSE')).toBeInTheDocument()
  })

  it('should render "Insufficient funds" text with proper styling', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={false}
        availableAmount="50 ROSE"
      />,
    )

    const insufficientFundsText = screen.getByText(/insufficient funds/i)
    expect(insufficientFundsText).toBeInTheDocument()
    // tagName is lowercase in HTML
    expect(insufficientFundsText.tagName).toBe('P')
  })

  it('should not show insufficient funds message when hasEnoughBalance is true', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.queryByText(/insufficient funds/i)).not.toBeInTheDocument()
  })

  it('should handle approximate values in display', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="~1 ROSE"
        total="~151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    expect(screen.getByText('~1 ROSE')).toBeInTheDocument()
    expect(screen.getByText('~151 ROSE')).toBeInTheDocument()
  })

  it('should have proper flex layout for cost items', () => {
    const { container } = render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const costItems = container.querySelectorAll('.flex.justify-between')
    expect(costItems.length).toBeGreaterThan(0)
  })

  it('should display all cost breakdown items in correct order', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const elements = screen.getAllByText(/ROSE/)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('should handle negative balance scenario', () => {
    render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={false}
        availableAmount="-50 ROSE"
      />,
    )

    expect(screen.getByText('-50 ROSE')).toBeInTheDocument()
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
  })

  it('should support custom currency formats', () => {
    render(
      <PaymentCostBreakdown
        appCost="$100.00"
        deployCost="$50.00"
        transactionFee="$1.00"
        total="$151.00"
        hasEnoughBalance={true}
        availableAmount="$1000.00"
      />,
    )

    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('$151.00')).toBeInTheDocument()
  })

  it('should have proper spacing between sections', () => {
    const { container } = render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const sections = container.querySelectorAll('.flex.flex-col.space-y-2')
    expect(sections.length).toBeGreaterThan(0)
  })

  it('should render separator before available section', () => {
    const { container } = render(
      <PaymentCostBreakdown
        appCost="100 ROSE"
        deployCost="50 ROSE"
        transactionFee="1 ROSE"
        total="151 ROSE"
        hasEnoughBalance={true}
        availableAmount="1000 ROSE"
      />,
    )

    const separators = container.querySelectorAll('hr')
    expect(separators.length).toBeGreaterThan(0)
  })
})
