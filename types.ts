
export enum TimeHorizon {
  SHORT = 'Short term (0-2 years)',
  MEDIUM = 'Medium term (2-7 years)',
  LONG = 'Long term (7+ years)'
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  horizon: TimeHorizon;
  priority: number; // 1-5
}

export interface UserProfile {
  age: number;
  salary: number;
  country: string;
  state: string;
  savings: number;
  monthlyInvestable: number;
  debtPayments: number;
  emergencyFund: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profile?: UserProfile;
  goals: Goal[];
}

export interface Allocation {
  assetClass: string;
  percentage: number;
  amount: number;
  suggestedInstruments: string[];
}

export interface PlanResult {
  riskScore: number;
  allocations: Allocation[];
  totalInvestable: number;
  warnings: string[];
  taxEstimate: number;
}
