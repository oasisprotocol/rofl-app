import { type FC, type ReactNode } from 'react';
import { isRouteErrorResponse } from 'react-router-dom';
import { EmptyState } from '../EmptyState';
import {
  AppError,
  AppErrors,
  type ErrorPayload,
} from '../ErrorBoundary/errors';

type FormattedError = { title: string; message: ReactNode };

const errorMap: Record<AppErrors, (error: ErrorPayload) => FormattedError> = {
  [AppErrors.Unknown]: (error) => ({
    title: 'Unknown error',
    message: error.message,
  }),
  [AppErrors.WalletNotConnected]: () => ({
    title: 'Wallet Not Connected',
    message: 'Please connect your wallet to use this feature.',
  }),
  [AppErrors.UnsupportedChain]: () => ({
    title: 'Unsupported Chain',
    message:
      'The chain ID you are trying to access is not supported. Please switch to a supported chain.',
  }),
  [AppErrors.PageDoesNotExist]: () => ({
    title: 'Page Not Found',
    message:
      'The page you are looking for does not exist. Please check the URL and try again.',
  }),
};

const errorFormatter = (error: ErrorPayload) => {
  return errorMap[error.code](error);
};

export const ErrorDisplay: FC<{
  error: unknown;
  className?: string;
}> = ({ error, className }) => {
  let errorPayload: ErrorPayload;
  if (isRouteErrorResponse(error)) {
    errorPayload = { code: AppErrors.Unknown, message: error.statusText };
  } else if (error instanceof AppError) {
    errorPayload = { code: error.type, message: error.message };
  } else if (error instanceof Error) {
    errorPayload = { code: AppErrors.Unknown, message: error.message };
  } else if (typeof error === 'string' && errorMap[error as AppErrors]) {
    errorPayload = { code: error as AppErrors, message: 'oops' };
  } else {
    errorPayload = { code: AppErrors.Unknown, message: error as string };
  }

  const { title, message } = errorFormatter(errorPayload);

  return (
    <EmptyState title={title} description={message} className={className} />
  );
};
