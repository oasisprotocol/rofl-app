export class AppError extends Error {
  public readonly type: AppErrors;
  public readonly originalError?: Error;
  constructor(type: AppErrors, message?: string, originalError?: Error) {
    super(message ?? type);
    this.type = type;
    this.originalError = originalError;
  }
}

export const AppErrors = {
  Unknown: 'unknown',
  UnsupportedChain: 'unsupported_chain',
  WalletNotConnected: 'wallet_not_connected',
  PageDoesNotExist: 'page_does_not_exist',
} as const;

export type AppErrors = (typeof AppErrors)[keyof typeof AppErrors];

export interface ErrorPayload {
  code: AppErrors;
  message: string;
}

// Adds strict type-check that a type was exhausted
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
// https://stackoverflow.com/questions/41102060/typescript-extending-error-class
export function exhaustedTypeWarning(
  messagePrefix: string,
  exhaustedType: 'Expected type to be exhausted, but this type was not handled'
) {
  const message = `${messagePrefix}: Expected type to be exhausted, but this type was not handled: ${JSON.stringify(
    exhaustedType
  )}`;
  if (import.meta.env.PROD) {
    console.warn(message);
  } else {
    throw new Error(message);
  }
}
