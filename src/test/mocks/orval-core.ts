/**
 * Mock for @orval/core
 * This is a build-time dependency, so we mock it for testing
 */

export const getOperationId = (operation: string, route: string, verb: string): string => {
  return `${operation}_${route}_${verb}`
}

export type OverrideOutput = {
  operationName?: (operation: string, route: string, verb: string) => string
}
