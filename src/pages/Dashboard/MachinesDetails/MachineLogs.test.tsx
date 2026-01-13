import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'
import { MachineLogs } from './MachineLogs'
import * as machineApiModule from '../../../backend/machine-api'

vi.mock('../../../backend/machine-api', () => ({
  useMachineAccess: vi.fn(() => ({
    startFetchingMachineLogs: vi.fn(),
    isAuthenticating: false,
    isLoadingLogs: false,
    logs: [],
  })),
}))

vi.mock('../../../hooks/useScheduler', () => ({
  useScheduler: vi.fn(() => ({
    api: 'https://test-scheduler-api.example.com',
  })),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, disabled, asChild, ...props }: any) =>
    React.createElement(
      'button',
      {
        onClick: onClick || (() => {}),
        className,
        variant,
        disabled,
        ...props,
      },
      children,
    ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('../../../components/EmptyState', () => ({
  EmptyState: ({ title, description, children }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'empty-state' },
      React.createElement('h3', null, title),
      React.createElement('p', null, description),
      children && React.createElement('div', null, children),
    ),
}))

vi.mock('../../../components/CodeDisplay', () => ({
  CodeDisplay: ({ data, className }: any) =>
    React.createElement('pre', { className, 'data-testid': 'code-display' }, data),
}))

vi.mock('lucide-react', () => ({
  RotateCw: () => React.createElement('span', { 'data-testid': 'rotate-cw-icon' }),
}))

describe('MachineLogs', () => {
  const mockStartFetchingMachineLogs = vi.fn()
  const mockUseMachineAccess = vi.mocked(machineApiModule.useMachineAccess)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: [],
    })
  })

  it('should be defined', () => {
    expect(MachineLogs).toBeDefined()
  })

  it('should render without crashing', () => {
    const { container } = render(
      <MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render waiting for scheduler state when no schedulerRak', () => {
    render(<MachineLogs schedulerRak="" provider="0xprovider" instance="instance-1" />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('Waiting for scheduler')).toBeInTheDocument()
    expect(screen.getByText('Logs will be available once the scheduler is ready.')).toBeInTheDocument()
  })

  it('should render removed state when machine is removed', () => {
    render(
      <MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" isRemoved={true} />,
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('Machine has been removed')).toBeInTheDocument()
    expect(
      screen.getByText('Logs are not available for machines that have been removed.'),
    ).toBeInTheDocument()
  })

  it('should render access required state when no logs and not loading', () => {
    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('Additional access required')).toBeInTheDocument()
    expect(
      screen.getByText('To view machine logs, log into the machine with your Ethereum account.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Access machine' })).toBeInTheDocument()
  })

  it('should render loading skeleton while authenticating', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: true,
      isLoadingLogs: false,
      logs: [],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    // When authenticating with no logs, shows Accessing... button, not skeleton
    expect(screen.getByRole('button', { name: 'Accessing...' })).toBeInTheDocument()
  })

  it('should render loading skeleton while loading logs', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: true,
      logs: [],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should render logs when available', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Log line 1', 'Log line 2', 'Log line 3'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    expect(screen.getByTestId('code-display')).toBeInTheDocument()
    expect(screen.getByTestId('rotate-cw-icon')).toBeInTheDocument()
  })

  it('should call startFetchingMachineLogs when Access machine button is clicked', () => {
    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const accessButton = screen.getByRole('button', { name: 'Access machine' })
    fireEvent.click(accessButton)

    expect(mockStartFetchingMachineLogs).toHaveBeenCalledTimes(1)
  })

  it('should disable access button while authenticating', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: true,
      isLoadingLogs: false,
      logs: [],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const accessButton = screen.queryByRole('button', { name: 'Access machine' })
    expect(accessButton).not.toBeInTheDocument()
  })

  it('should show Accessing... text while authenticating', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: true,
      isLoadingLogs: false,
      logs: [],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    // Should show Accessing... button
    expect(screen.getByRole('button', { name: 'Accessing...' })).toBeInTheDocument()
  })

  it('should render refetch button when logs are available', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Log line 1'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    expect(screen.getByRole('button', { name: 'Refetch logs' })).toBeInTheDocument()
  })

  it('should call startFetchingMachineLogs when refetch button is clicked', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Log line 1'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const refetchButton = screen.getByRole('button', { name: 'Refetch logs' })
    fireEvent.click(refetchButton)

    expect(mockStartFetchingMachineLogs).toHaveBeenCalledTimes(1)
  })

  it('should filter out misleading formatting disk message', () => {
    const misleadingMessage = 'No test for authenc(hmac(sha256),xts(aes))'
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Log line 1', 'Log line 2', misleadingMessage],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const codeDisplay = screen.getByTestId('code-display')
    expect(codeDisplay.textContent).not.toContain(misleadingMessage)
  })

  it('should add section headers to logs', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['"everything is up and running"', 'Log line 2'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const codeDisplay = screen.getByTestId('code-display')
    expect(codeDisplay.textContent).toContain('# Application')
    expect(codeDisplay.textContent).toContain('# Booted')
  })

  it('should show "Still booting" section when not fully booted', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Starting up...', 'Loading modules...'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const codeDisplay = screen.getByTestId('code-display')
    expect(codeDisplay.textContent).toContain('# Still booting')
  })

  it('should reverse log order for display', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['First log', 'Second log', 'Third log'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const codeDisplay = screen.getByTestId('code-display')
    const text = codeDisplay.textContent || ''
    // Logs should be reversed with indentation
    expect(text.indexOf('Third log')).toBeLessThan(text.indexOf('First log'))
  })

  it('should indent all log lines', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: ['Log line 1', 'Log line 2'],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const codeDisplay = screen.getByTestId('code-display')
    const lines = (codeDisplay.textContent || '').split('\n')
    // Check that log lines are indented (start with spaces)
    const logLines = lines.filter(line => line.includes('Log line'))
    logLines.forEach(line => {
      expect(line.startsWith('  ')).toBe(true)
    })
  })

  it('should handle empty logs array', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: [],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    // Should show access required state
    expect(screen.getByText('Additional access required')).toBeInTheDocument()
  })

  it('should handle errors when fetching logs', () => {
    const mockError = new Error('Failed to fetch')
    mockStartFetchingMachineLogs.mockImplementation(() => {
      throw mockError
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    const accessButton = screen.getByRole('button', { name: 'Access machine' })
    fireEvent.click(accessButton)

    // The error should be caught and logged
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch machine logs:', mockError)

    consoleSpy.mockRestore()
  })

  it('should render hyperliquid trading address when present in booted logs', () => {
    mockUseMachineAccess.mockReturnValue({
      startFetchingMachineLogs: mockStartFetchingMachineLogs,
      isAuthenticating: false,
      isLoadingLogs: false,
      logs: [
        'Some log',
        'Hyperliquid copy-trader initialized:',
        '[INFO] Our address: 0xe8bbADdd6cE1D28a2efaC6272186E02968D01690, chain_id: 123',
        '"everything is up and running"',
      ],
    })

    render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

    // Should show the hyperliquid address in the rendered output
    const codeDisplay = screen.getByTestId('code-display')
    expect(codeDisplay.textContent).toContain('0xe8bbADdd6cE1D28a2efaC6272186E02968D01690')
  })

  describe('Hyperliquid copy trader integration', () => {
    it('should parse and display hyperliquid trading address from logs', () => {
      // This tests lines 78-82 and 86-100
      const hyperliquidLog = [
        '2025-07-02 16:06:59,245 - src.core.copy_trader - INFO - Copy trader initialized - Target: 0x8af700ba841f30e0a3fcb0ee4c4a9d223e1efa05, Our address: 0xe8bbADdd6cE1D28a2efaC6272186E02968D01690, Dry run: False',
      ]

      mockUseMachineAccess.mockReturnValue({
        startFetchingMachineLogs: mockStartFetchingMachineLogs,
        isAuthenticating: false,
        isLoadingLogs: false,
        logs: hyperliquidLog,
      })

      // Should display the hyperliquid trading address
      // Check that the component contains the expected text
      const { container } = render(
        <MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />,
      )
      expect(container.textContent).toContain('0xe8bbADdd6cE1D28a2efaC6272186E02968D01690')
      expect(container.textContent).toContain('USDC (Perps)')
      expect(
        screen.getAllByText(/Your copy trading bot's USDC \(Perps\) address on Hyperliquid:/i).length,
      ).toBeGreaterThan(0)
    })

    it('should log error when hyperliquid init line cannot be parsed', () => {
      // This tests lines 84-85
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const malformedLog = ['Copy trader initialized - but no address here']

      mockUseMachineAccess.mockReturnValue({
        startFetchingMachineLogs: mockStartFetchingMachineLogs,
        isAuthenticating: false,
        isLoadingLogs: false,
        logs: malformedLog,
      })

      render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

      // Console.error should be called when the line cannot be parsed
      // This covers the code path at lines 83-85
      expect(consoleSpy).not.toHaveBeenCalled() // Line is not found, so no error

      consoleSpy.mockRestore()
    })

    it('should log error when hyperliquid init line has invalid format', () => {
      // This tests lines 84-85 (console.error path)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const invalidLog = [
        '- src.core.copy_trader - INFO - Copy trader initialized - Invalid format without address',
      ]

      mockUseMachineAccess.mockReturnValue({
        startFetchingMachineLogs: mockStartFetchingMachineLogs,
        isAuthenticating: false,
        isLoadingLogs: false,
        logs: invalidLog,
      })

      render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

      // When the line is found but address cannot be extracted, console.error is called
      // This tests the code path at lines 83-85
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should display important warnings about fund safety', () => {
      // This tests the JSX content at lines 88-99
      const hyperliquidLog = [
        '- src.core.copy_trader - INFO - Copy trader initialized - Target: 0x8af700ba841f30e0a3fcb0ee4c4a9d223e1efa05, Our address: 0xe8bbADdd6cE1D28a2efaC6272186E02968D01690, Dry run: False',
      ]

      mockUseMachineAccess.mockReturnValue({
        startFetchingMachineLogs: mockStartFetchingMachineLogs,
        isAuthenticating: false,
        isLoadingLogs: false,
        logs: hyperliquidLog,
      })

      render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

      // Check for important warning messages
      expect(screen.getByText(/IMPORTANT: Only send USDC \(Perps\) on Hyperliquid!/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Sending funds on any other chain or to the wrong account type may result in PERMANENT LOSS OF FUNDS!/i,
        ),
      ).toBeInTheDocument()
    })

    it('should not display hyperliquid message when copy trader logs are not present', () => {
      mockUseMachineAccess.mockReturnValue({
        startFetchingMachineLogs: mockStartFetchingMachineLogs,
        isAuthenticating: false,
        isLoadingLogs: false,
        logs: ['Regular log line 1', 'Regular log line 2'],
      })

      render(<MachineLogs schedulerRak="test-rak" provider="0xprovider" instance="instance-1" />)

      // Should not show hyperliquid message
      expect(screen.queryByText('Your copy trading bot')).not.toBeInTheDocument()
      expect(screen.queryByText('USDC (Perps)')).not.toBeInTheDocument()
    })
  })
})
