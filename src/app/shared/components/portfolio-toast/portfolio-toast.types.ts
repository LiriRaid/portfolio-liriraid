export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';

export interface PortfolioToastData {
  type: PortfolioToastType;
  title: string;
  message: string;
  icon?: string;
  action?: PortfolioToastAction;
  duration?: number;
  context?: 'view' | 'edit' | 'create';
  persistent?: boolean;
  position?: ToastPosition;
}

export type PortfolioPrimeToastMessage = {
  severity?: string;
  summary?: string;
  detail?: string;
  data?: PortfolioToastData;
};

export interface PortfolioToastAction {
  label: string;
  execute: () => void;
  secondary?: {
    label: string;
    execute: () => void;
  };
  variant?: 'primary' | 'danger';
}

export enum PortfolioToastType {
  Success = 'success',
  Info = 'info',
  Warning = 'warn',
  Error = 'error',
  Secondary = 'secondary',
  Contrast = 'contrast',
  Loading = 'loading',
}
