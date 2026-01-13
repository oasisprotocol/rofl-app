import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResourcesCpu, ResourcesMemory, ResourcesStorage, MachineResources } from './index'

describe('ResourcesCpu', () => {
  it('should return N/A for null value', () => {
    const { container } = render(<ResourcesCpu value={null} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for undefined value', () => {
    const { container } = render(<ResourcesCpu value={undefined} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for 0 value', () => {
    const { container } = render(<ResourcesCpu value={0} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return "1 CPU" for single CPU', () => {
    const { container } = render(<ResourcesCpu value={1} />)
    expect(screen.getByText('1 CPU')).toBeInTheDocument()
  })

  it('should return "2 CPUs" for multiple CPUs', () => {
    const { container } = render(<ResourcesCpu value={2} />)
    expect(screen.getByText('2 CPUs')).toBeInTheDocument()
  })

  it('should return "4 CPUs" for 4 CPUs', () => {
    const { container } = render(<ResourcesCpu value={4} />)
    expect(screen.getByText('4 CPUs')).toBeInTheDocument()
  })

  it('should return "8 CPUs" for 8 CPUs', () => {
    const { container } = render(<ResourcesCpu value={8} />)
    expect(screen.getByText('8 CPUs')).toBeInTheDocument()
  })

  it('should return "16 CPUs" for 16 CPUs', () => {
    const { container } = render(<ResourcesCpu value={16} />)
    expect(screen.getByText('16 CPUs')).toBeInTheDocument()
  })

  it('should handle string number values', () => {
    const { container } = render(<ResourcesCpu value={'2'} />)
    expect(screen.getByText('2 CPUs')).toBeInTheDocument()
  })

  it('should handle very large CPU counts', () => {
    const { container } = render(<ResourcesCpu value={128} />)
    expect(screen.getByText('128 CPUs')).toBeInTheDocument()
  })
})

describe('ResourcesMemory', () => {
  it('should return N/A for null value', () => {
    const { container } = render(<ResourcesMemory value={null} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for undefined value', () => {
    const { container } = render(<ResourcesMemory value={undefined} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for 0 value', () => {
    const { container } = render(<ResourcesMemory value={0} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should convert MB to GB correctly', () => {
    const { container } = render(<ResourcesMemory value={1024} />)
    expect(screen.getByText('1 GB')).toBeInTheDocument()
  })

  it('should handle 2048 MB', () => {
    const { container } = render(<ResourcesMemory value={2048} />)
    expect(screen.getByText('2 GB')).toBeInTheDocument()
  })

  it('should handle 4096 MB', () => {
    const { container } = render(<ResourcesMemory value={4096} />)
    expect(screen.getByText('4 GB')).toBeInTheDocument()
  })

  it('should handle 8192 MB', () => {
    const { container } = render(<ResourcesMemory value={8192} />)
    expect(screen.getByText('8 GB')).toBeInTheDocument()
  })

  it('should handle 16384 MB', () => {
    const { container } = render(<ResourcesMemory value={16384} />)
    expect(screen.getByText('16 GB')).toBeInTheDocument()
  })

  it('should handle fractional GB values', () => {
    const { container } = render(<ResourcesMemory value={1536} />)
    expect(screen.getByText('1.5 GB')).toBeInTheDocument()
  })

  it('should handle 512 MB', () => {
    const { container } = render(<ResourcesMemory value={512} />)
    expect(screen.getByText('0.5 GB')).toBeInTheDocument()
  })

  it('should handle 256 MB', () => {
    const { container } = render(<ResourcesMemory value={256} />)
    expect(screen.getByText('0.3 GB')).toBeInTheDocument()
  })

  it('should handle large memory values', () => {
    const { container } = render(<ResourcesMemory value={1048576} />)
    expect(screen.getByText('1,024 GB')).toBeInTheDocument()
  })

  it('should handle string number values', () => {
    const { container } = render(<ResourcesMemory value={'4096'} />)
    expect(screen.getByText('4 GB')).toBeInTheDocument()
  })

  it('should format numbers with commas for large values', () => {
    const { container } = render(<ResourcesMemory value={1048576} />)
    expect(screen.getByText('1,024 GB')).toBeInTheDocument()
  })
})

describe('ResourcesStorage', () => {
  it('should return N/A for null value', () => {
    const { container } = render(<ResourcesStorage value={null} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for undefined value', () => {
    const { container } = render(<ResourcesStorage value={undefined} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should return N/A for 0 value', () => {
    const { container } = render(<ResourcesStorage value={0} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should convert MB to GB correctly', () => {
    const { container } = render(<ResourcesStorage value={1024} />)
    expect(screen.getByText('1 GB Storage')).toBeInTheDocument()
  })

  it('should handle 2048 MB', () => {
    const { container } = render(<ResourcesStorage value={2048} />)
    expect(screen.getByText('2 GB Storage')).toBeInTheDocument()
  })

  it('should handle 10240 MB (10 GB)', () => {
    const { container } = render(<ResourcesStorage value={10240} />)
    expect(screen.getByText('10 GB Storage')).toBeInTheDocument()
  })

  it('should handle 51200 MB (50 GB)', () => {
    const { container } = render(<ResourcesStorage value={51200} />)
    expect(screen.getByText('50 GB Storage')).toBeInTheDocument()
  })

  it('should handle 102400 MB (100 GB)', () => {
    const { container } = render(<ResourcesStorage value={102400} />)
    expect(screen.getByText('100 GB Storage')).toBeInTheDocument()
  })

  it('should round to nearest GB', () => {
    const { container } = render(<ResourcesStorage value={1536} />)
    expect(screen.getByText('2 GB Storage')).toBeInTheDocument()
  })

  it('should round up correctly', () => {
    const { container } = render(<ResourcesStorage value={2000} />)
    expect(screen.getByText('2 GB Storage')).toBeInTheDocument()
  })

  it('should handle large storage values', () => {
    const { container } = render(<ResourcesStorage value={1024000} />)
    expect(screen.getByText('1,000 GB Storage')).toBeInTheDocument()
  })

  it('should handle string number values', () => {
    const { container } = render(<ResourcesStorage value={'2048'} />)
    expect(screen.getByText('2 GB Storage')).toBeInTheDocument()
  })

  it('should format numbers with commas for large values', () => {
    const { container } = render(<ResourcesStorage value={1024000} />)
    expect(screen.getByText('1,000 GB Storage')).toBeInTheDocument()
  })
})

describe('MachineResources', () => {
  it('should render all resources when all values are provided', () => {
    const { container } = render(<MachineResources cpus={4} memory={8192} storage={102400} />)

    expect(container.textContent).toContain('4 CPUs')
    expect(container.textContent).toContain('8 GB')
    expect(container.textContent).toContain('100 GB Storage')
  })

  it('should render N/A for all when no values are provided', () => {
    const { container } = render(<MachineResources />)

    expect(container.textContent).toContain('N/A')
  })

  it('should render partial resources when only some values are provided', () => {
    const { container } = render(<MachineResources cpus={2} />)

    expect(container.textContent).toContain('2 CPUs')
  })

  it('should render only memory when only memory is provided', () => {
    const { container } = render(<MachineResources memory={4096} />)

    expect(container.textContent).toContain('4 GB')
  })

  it('should render only storage when only storage is provided', () => {
    const { container } = render(<MachineResources storage={20480} />)

    expect(container.textContent).toContain('20 GB Storage')
  })

  it('should handle null values', () => {
    const { container } = render(<MachineResources cpus={null} memory={null} storage={null} />)

    expect(container.textContent).toContain('N/A')
  })

  it('should handle zero values', () => {
    const { container } = render(<MachineResources cpus={0} memory={0} storage={0} />)

    expect(container.textContent).toContain('N/A')
  })

  it('should apply correct CSS classes', () => {
    const { container } = render(<MachineResources cpus={4} memory={8192} storage={102400} />)

    const wrapper = container.querySelector('.flex.flex-col.gap-2')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render large machine resources', () => {
    const { container } = render(<MachineResources cpus={64} memory={131072} storage={1024000} />)

    expect(container.textContent).toContain('64 CPUs')
    expect(container.textContent).toContain('128 GB')
    expect(container.textContent).toContain('1,000 GB Storage')
  })

  it('should render small machine resources', () => {
    const { container } = render(<MachineResources cpus={1} memory={1024} storage={10240} />)

    expect(container.textContent).toContain('1 CPU')
    expect(container.textContent).toContain('1 GB')
    expect(container.textContent).toContain('10 GB Storage')
  })

  it('should handle string number values for all resources', () => {
    const { container } = render(<MachineResources cpus={'2'} memory={'2048'} storage={'10240'} />)

    expect(container.textContent).toContain('2 CPUs')
    expect(container.textContent).toContain('2 GB')
    expect(container.textContent).toContain('10 GB Storage')
  })
})
