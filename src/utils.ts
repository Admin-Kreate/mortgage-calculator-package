export interface MortgageData {
  purchasePrice: number;
  downPaymentAmount: number;
  downPaymentPercentage: number;
  interestRate: number;
  amortizationPeriod: number;
  paymentFrequency: string;
  rateType: string;
  termLength: number;
  propertyTaxes: number;
  heatingCosts: number;
  condoFees: number;
  extraPaymentType: string;
  extraPaymentAmount: number;
  extraPaymentFrequency: string;
}

export const defaultMortgageData: MortgageData = {
  purchasePrice: 500000,
  downPaymentAmount: 100000,
  downPaymentPercentage: 20,
  interestRate: 4.75,
  amortizationPeriod: 25,
  paymentFrequency: 'monthly',
  rateType: 'fixed',
  termLength: 5,
  propertyTaxes: 3600,
  heatingCosts: 1200,
  condoFees: 0,
  extraPaymentType: 'none',
  extraPaymentAmount: 0,
  extraPaymentFrequency: 'monthly',
};

// Calculate mortgage payment and other values
export function calculateMortgage(data: MortgageData) {
  // Calculate mortgage amount (purchase price - down payment)
  const mortgageAmount = data.purchasePrice - data.downPaymentAmount;
  
  // Calculate CMHC mortgage insurance if down payment is less than 20%
  let mortgageInsurance = 0;
  if (data.downPaymentPercentage < 20) {
    // CMHC insurance rates (simplified)
    let rate = 0;
    if (data.downPaymentPercentage >= 15) {
      rate = 0.028;
    } else if (data.downPaymentPercentage >= 10) {
      rate = 0.031;
    } else if (data.downPaymentPercentage >= 5) {
      rate = 0.04;
    }
    
    mortgageInsurance = mortgageAmount * rate;
  }
  
  // Total mortgage including insurance
  const totalMortgage = mortgageAmount + mortgageInsurance;
  
  // Canadian mortgages use semi-annual compounding
  // Calculate the semi-annual interest rate
  const semiAnnualRate = data.interestRate / 100 / 2;
  
  // Convert to effective monthly rate using the formula: (1 + r/m)^(m/n) - 1
  // where r is annual rate, m is compounding periods per year (2 for semi-annual),
  // and n is payments per year (12 for monthly)
  const effectiveMonthlyRate = Math.pow(1 + semiAnnualRate, 2 / 12) - 1;
  
  // Number of monthly payments for amortization period
  const totalNumberOfPayments = data.amortizationPeriod * 12;
  
  // Number of monthly payments for term
  const termNumberOfPayments = data.termLength * 12;
  
  // Calculate monthly payment using the mortgage formula with effective rate
  const monthlyPayment = totalMortgage * 
    (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, totalNumberOfPayments)) / 
    (Math.pow(1 + effectiveMonthlyRate, totalNumberOfPayments) - 1);
  
  // Calculate total payments over amortization period
  const totalPayments = monthlyPayment * totalNumberOfPayments;
  
  // Calculate total interest over amortization period
  const totalInterestPaid = totalPayments - totalMortgage;
  
  // Calculate principal and interest for first payment
  const firstPaymentInterest = totalMortgage * effectiveMonthlyRate;
  const firstPaymentPrincipal = monthlyPayment - firstPaymentInterest;
  
  // Calculate interest to principal ratio
  const interestPrincipalRatio = Math.round((totalInterestPaid / totalMortgage) * 100);
  
  // Calculate Term Payments (for the mortgage term, typically 5 years)
  const termPayments = monthlyPayment * termNumberOfPayments;
  
  // To calculate term interest and principal accurately, we need to simulate the amortization
  // For simplicity, we'll use an estimate based on the term length relative to amortization
  const remainingPrincipalAtEndOfTerm = calculateRemainingPrincipal(
    totalMortgage, 
    effectiveMonthlyRate, 
    monthlyPayment, 
    termNumberOfPayments
  );
  
  const termPrincipalPaid = totalMortgage - remainingPrincipalAtEndOfTerm;
  const termInterestPaid = termPayments - termPrincipalPaid;
  
  return {
    monthlyPayment: Math.round(monthlyPayment),
    mortgageAmount: Math.round(mortgageAmount),
    mortgageInsurance: Math.round(mortgageInsurance),
    principal: Math.round(firstPaymentPrincipal),
    interest: Math.round(firstPaymentInterest),
    totalMortgagePlusInterest: Math.round(totalPayments),
    totalInterestPaid: Math.round(totalInterestPaid),
    interestPrincipalRatio,
    // Term-related calculations
    termPayments: Math.round(termPayments),
    termPrincipalPaid: Math.round(termPrincipalPaid),
    termInterestPaid: Math.round(termInterestPaid),
    remainingPrincipalAtEndOfTerm: Math.round(remainingPrincipalAtEndOfTerm)
  };
}

// Helper function to calculate remaining principal at the end of term
function calculateRemainingPrincipal(
  initialPrincipal: number, 
  monthlyRate: number, 
  monthlyPayment: number, 
  numberOfPayments: number
): number {
  // P = P0(1+r)^n - PMT*[(1+r)^n - 1]/r
  // where P is remaining principal, P0 is initial principal,
  // r is monthly rate, PMT is monthly payment, n is number of payments
  return initialPrincipal * Math.pow(1 + monthlyRate, numberOfPayments) - 
         monthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) / monthlyRate;
}

// Calculate advanced results including all costs and stress test
export function calculateAdvancedResults(data: MortgageData) {
  // Calculate base mortgage results
  const mortgageResults = calculateMortgage(data);
  
  // Calculate monthly costs for property taxes, heating, and condo fees
  const propertyTaxesMonthly = Math.round(data.propertyTaxes / 12);
  const heatingCostsMonthly = Math.round(data.heatingCosts / 12);
  const condoFeesMonthly = data.condoFees;
  
  // Calculate total monthly payment
  const totalMonthlyPayment = mortgageResults.monthlyPayment + 
    propertyTaxesMonthly + heatingCostsMonthly + condoFeesMonthly;
  
  // Calculate impact of extra payments
  let yearsSaved = 0;
  let interestSaved = 0;
  
  if (data.extraPaymentType !== 'none' && data.extraPaymentAmount > 0) {
    // This is a simplified calculation - in a real implementation, we would 
    // recalculate the amortization schedule with extra payments
    const extraPaymentYearly = data.extraPaymentFrequency === 'monthly' ? 
      data.extraPaymentAmount * 12 : data.extraPaymentAmount;
      
    // Rough estimate of years saved based on extra payments
    yearsSaved = Math.min(
      Math.round(extraPaymentYearly * data.amortizationPeriod / mortgageResults.mortgageAmount),
      data.amortizationPeriod - 1
    );
    
    // Rough estimate of interest saved
    interestSaved = Math.round(yearsSaved * 12 * mortgageResults.interest);
  }
  
  // Calculate stress test values
  // The qualifying rate is typically 2% higher than the contract rate or the Bank of Canada benchmark rate, whichever is higher
  const qualifyingRate = Math.max(data.interestRate + 2, 5.25);
  
  // Calculate stress test payment using the qualifying rate with semi-annual compounding
  const stressTestSemiAnnualRate = qualifyingRate / 100 / 2;
  const stressTestEffectiveMonthlyRate = Math.pow(1 + stressTestSemiAnnualRate, 2 / 12) - 1;
  const numberOfPayments = data.amortizationPeriod * 12;
  const mortgageAmount = data.purchasePrice - data.downPaymentAmount;
  
  const stressTestPayment = mortgageAmount * 
    (stressTestEffectiveMonthlyRate * Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments)) / 
    (Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments) - 1);
  
  // Calculate income required (using 32% GDS ratio)
  const annualPayment = stressTestPayment * 12 + data.propertyTaxes + data.heatingCosts + data.condoFees * 12;
  const incomeRequired = Math.round(annualPayment / 0.32);
  
  return {
    totalMonthlyPayment: Math.round(totalMonthlyPayment),
    mortgagePayment: mortgageResults.monthlyPayment,
    propertyTaxesMonthly,
    heatingCostsMonthly,
    condoFeesMonthly,
    yearsSaved,
    interestSaved,
    qualifyingRate,
    stressTestPayment: Math.round(stressTestPayment),
    incomeRequired,
  };
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return formattedDate;
}
