
import { UserProfile, Goal, TimeHorizon, PlanResult, Allocation } from '../types';

export const calculateTaxEstimate = (salary: number, country: string, state: string): number => {
  if (country !== 'USA') {
    return salary * 0.25; // Basic flat fallback for non-US
  }

  // Simplified 2024 Federal Brackets (Single Filer)
  let federalTax = 0;
  if (salary > 609350) federalTax += (salary - 609350) * 0.37 + 183647;
  else if (salary > 243725) federalTax += (salary - 243725) * 0.35 + 55678;
  else if (salary > 191950) federalTax += (salary - 191950) * 0.32 + 39110;
  else if (salary > 100525) federalTax += (salary - 100525) * 0.24 + 17168;
  else if (salary > 47150) federalTax += (salary - 47150) * 0.22 + 5444;
  else if (salary > 11600) federalTax += (salary - 11600) * 0.12 + 1160;
  else federalTax += salary * 0.10;

  // State Tax Estimates
  const stateRates: Record<string, number> = {
    'GA': 0.0549,
    'CA': 0.093, // Weighted average simple
    'NY': 0.065,
    'TX': 0,
    'FL': 0,
    'WA': 0
  };

  const stateTax = salary * (stateRates[state] || 0.05);
  return federalTax + stateTax;
};

export const calculateRiskScore = (age: number, goals: Goal[]): number => {
  // Younger age = more risk tolerance
  const ageFactor = Math.max(0, 100 - age);
  
  // Longer horizon = more risk tolerance
  const horizons = goals.map(g => {
    if (g.horizon === TimeHorizon.LONG) return 100;
    if (g.horizon === TimeHorizon.MEDIUM) return 50;
    return 10;
  });
  
  const avgHorizonFactor = horizons.length > 0 
    ? horizons.reduce((a, b) => a + b, 0) / horizons.length 
    : 50;

  return Math.round((ageFactor * 0.6) + (avgHorizonFactor * 0.4));
};

export const generatePlan = (profile: UserProfile, goals: Goal[]): PlanResult => {
  const riskScore = calculateRiskScore(profile.age, goals);
  const tax = calculateTaxEstimate(profile.salary, profile.country, profile.state);
  
  const warnings: string[] = [];
  if (profile.monthlyInvestable <= 0) {
    warnings.push("Your monthly investable amount is zero or negative. Consider reviewing your budget.");
  }
  
  const targetEF = (profile.salary / 12) * 3;
  if (profile.emergencyFund < targetEF) {
    warnings.push(`Emergency fund is below 3 months of income (${targetEF.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}). Priority should be building this first.`);
  }

  const dti = (profile.debtPayments * 12) / profile.salary;
  if (dti > 0.36) {
    warnings.push("Your debt-to-income ratio is high (>36%). Focus on high-interest debt reduction.");
  }

  // Basic deterministic allocation based on risk score
  // Low Risk: 20% Stock, 60% Bonds, 20% Cash
  // High Risk: 85% Stock, 10% RE, 5% Cash
  
  const stockPct = Math.min(90, Math.max(10, riskScore * 0.9));
  const rePct = Math.min(15, Math.max(0, riskScore / 10));
  const bondPct = Math.max(0, (100 - stockPct - rePct) * 0.8);
  const cashPct = 100 - stockPct - rePct - bondPct;

  const totalInvestable = profile.savings + (profile.monthlyInvestable * 12); // Annualized view

  const allocations: Allocation[] = [
    {
      assetClass: 'Stocks (Domestic & International)',
      percentage: stockPct,
      amount: totalInvestable * (stockPct / 100),
      suggestedInstruments: ['VTI (Total US Stock)', 'VXUS (International Stock)', 'ITOT']
    },
    {
      assetClass: 'Bonds (Fixed Income)',
      percentage: bondPct,
      amount: totalInvestable * (bondPct / 100),
      suggestedInstruments: ['BND (Total Bond Market)', 'AGG', 'BNDX (Intl Bonds)']
    },
    {
      assetClass: 'Real Estate (REITs)',
      percentage: rePct,
      amount: totalInvestable * (rePct / 100),
      suggestedInstruments: ['VNQ (Vanguard Real Estate)', 'O (Realty Income)']
    },
    {
      assetClass: 'Cash / Money Market',
      percentage: cashPct,
      amount: totalInvestable * (cashPct / 100),
      suggestedInstruments: ['VMFXX (Money Market)', 'HYSA (High-Yield Savings)']
    }
  ];

  return {
    riskScore,
    allocations,
    totalInvestable,
    warnings,
    taxEstimate: tax
  };
};
