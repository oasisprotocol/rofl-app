import { describe, it, expect } from 'vitest'
import { isMachineRemoved } from './isMachineRemoved'
import * as oasisRT from '@oasisprotocol/client-rt'

describe('isMachineRemoved', () => {
  it('returns true when machine.removed is true', () => {
    const machine = {
      removed: true,
      status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
    } as any

    expect(isMachineRemoved(machine)).toBe(true)
  })

  it('returns true when status is CANCELLED', () => {
    const machine = {
      removed: false,
      status: oasisRT.types.RoflmarketInstanceStatus.CANCELLED,
    } as any

    expect(isMachineRemoved(machine)).toBe(true)
  })

  it('returns false when machine is not removed and status is not CANCELLED', () => {
    const machine = {
      removed: false,
      status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
    } as any

    expect(isMachineRemoved(machine)).toBe(false)
  })

  it('returns false when machine is not removed and status is CREATED', () => {
    const machine = {
      removed: false,
      status: oasisRT.types.RoflmarketInstanceStatus.CREATED,
    } as any

    expect(isMachineRemoved(machine)).toBe(false)
  })

  it('returns true when both removed is true and status is CANCELLED', () => {
    const machine = {
      removed: true,
      status: oasisRT.types.RoflmarketInstanceStatus.CANCELLED,
    } as any

    expect(isMachineRemoved(machine)).toBe(true)
  })
})
