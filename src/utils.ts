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
  
  // Calculate CMHC mortgage insurance if down payment is less than 20%.
  // Down payments below 5% aren't legal for an insured mortgage in Canada;
  // the UI (calculator.ts) is expected to enforce that 5% floor on input.
  // As a defensive fallback here, anything under 10% (including, in error,
  // under 5%) is still charged the highest premium tier below rather than
  // silently falling through with a 0% rate/no premium.
  let mortgageInsurance = 0;
  if (data.downPaymentPercentage < 20) {
    let rate: number;
    if (data.downPaymentPercentage >= 15) {
      rate = 0.028;
    } else if (data.downPaymentPercentage >= 10) {
      rate = 0.031;
    } else {
      // 5%-9.99% down, and a defensive fallback for anything lower.
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
  
  // Number of monthly payments for term. The term can never be longer than
  // the amortization period itself (you can't have a 10-year term on a
  // 5-year amortization), so it's capped here.
  const termNumberOfPayments = Math.min(data.termLength, data.amortizationPeriod) * 12;
  
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
  
  // Share of the total amount paid (principal + interest) that is interest,
  // expressed as a percentage. This is always within 0-100 by construction
  // (unlike a raw interest/principal ratio, which can exceed 100% at
  // ordinary rates), so it's safe to drive a 0-100 progress bar directly.
  const interestPrincipalRatio = Math.max(0, Math.min(100,
    Math.round((totalInterestPaid / totalPayments) * 100)
  ));

  // Simulate the real amortization schedule over the term (capped above at
  // the amortization period) instead of relying purely on the closed-form
  // remaining-balance formula, which can go negative once the number of
  // payments simulated exceeds the point the loan is actually paid off.
  const termSchedule = simulateAmortizationSchedule(
    totalMortgage,
    effectiveMonthlyRate,
    monthlyPayment,
    termNumberOfPayments
  );

  const termPrincipalPaid = termSchedule.totalPrincipal;
  const termInterestPaid = termSchedule.totalInterest;
  const remainingPrincipalAtEndOfTerm = termSchedule.endingBalance;
  const termPayments = termSchedule.totalPrincipal + termSchedule.totalInterest;

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
    remainingPrincipalAtEndOfTerm: Math.round(remainingPrincipalAtEndOfTerm),
    // Exposed (unrounded, where noted) so calculator.ts can compute the
    // Principal Paid during Term progress bar against the actual insured
    // principal, and so calculateAdvancedResults can reuse the exact same
    // insured principal/rate/payment for the extra-payment simulation
    // instead of recomputing them from scratch.
    totalMortgage,
    effectiveMonthlyRate,
    totalNumberOfPayments,
    monthlyPaymentExact: monthlyPayment,
  };
}

// Simulate a monthly amortization schedule - optionally with extra
// principal payments applied - and report what actually happens, rather
// than using closed-form formulas that can go negative once the number of
// payments simulated exceeds the point the loan is fully paid off.
function simulateAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  numberOfPayments: number,
  extraPaymentForMonth?: (monthIndex: number) => number
): { months: number; totalInterest: number; totalPrincipal: number; endingBalance: number } {
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let months = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    if (balance <= 0.005) {
      break;
    }

    const interestPortion = balance * monthlyRate;
    let principalPortion = monthlyPayment - interestPortion;

    if (extraPaymentForMonth) {
      principalPortion += extraPaymentForMonth(month);
    }

    // Never pay down more principal than remains outstanding, and never
    // let a payment reduce principal by a negative amount.
    if (principalPortion > balance) {
      principalPortion = balance;
    }
    if (principalPortion < 0) {
      principalPortion = 0;
    }

    balance -= principalPortion;
    totalInterest += interestPortion;
    totalPrincipal += principalPortion;
    months = month;
  }

  return {
    months,
    totalInterest,
    totalPrincipal,
    endingBalance: Math.max(0, balance),
  };
}

// Build a per-month extra-payment function based on the selected extra
// payment type/frequency. Handles monthly, yearly, bi-weekly, weekly, and
// one-time lump sums; anything unrecognized falls back to a monthly
// recurring extra payment.
function buildExtraPaymentSchedule(data: MortgageData): (monthIndex: number) => number {
  const amount = data.extraPaymentAmount;

  if (data.extraPaymentType === 'one-time') {
    return (monthIndex: number) => (monthIndex === 1 ? amount : 0);
  }

  switch (data.extraPaymentFrequency) {
    case 'yearly':
      return (monthIndex: number) => (monthIndex % 12 === 0 ? amount : 0);
    case 'bi-weekly':
      // ~26 bi-weekly payments/year, smoothed to a monthly equivalent since
      // the simulation steps in whole months.
      return () => (amount * 26) / 12;
    case 'weekly':
      // ~52 weekly payments/year, smoothed to a monthly equivalent.
      return () => (amount * 52) / 12;
    case 'one-time':
      return (monthIndex: number) => (monthIndex === 1 ? amount : 0);
    case 'monthly':
    default:
      return () => amount;
  }
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
  
  // Calculate impact of extra payments by simulating the real amortization
  // schedule with the extra payments applied and comparing it against the
  // baseline schedule (same principal/rate/payment, no extra payments).
  let yearsSaved = 0;
  let interestSaved = 0;

  if (data.extraPaymentType !== 'none' && data.extraPaymentAmount > 0) {
    const extraPaymentForMonth = buildExtraPaymentSchedule(data);

    const withExtra = simulateAmortizationSchedule(
      mortgageResults.totalMortgage,
      mortgageResults.effectiveMonthlyRate,
      mortgageResults.monthlyPaymentExact,
      mortgageResults.totalNumberOfPayments,
      extraPaymentForMonth
    );

    const monthsSaved = mortgageResults.totalNumberOfPayments - withExtra.months;
    yearsSaved = Math.max(0, Math.round(monthsSaved / 12));
    interestSaved = Math.max(0, Math.round(mortgageResults.totalInterestPaid - withExtra.totalInterest));
  }
  
  // Calculate stress test values
  // The qualifying rate is typically 2% higher than the contract rate or the Bank of Canada benchmark rate, whichever is higher
  const qualifyingRate = Math.max(data.interestRate + 2, 5.25);
  
  // Calculate stress test payment using the qualifying rate with semi-annual compounding
  const stressTestSemiAnnualRate = qualifyingRate / 100 / 2;
  const stressTestEffectiveMonthlyRate = Math.pow(1 + stressTestSemiAnnualRate, 2 / 12) - 1;
  const numberOfPayments = data.amortizationPeriod * 12;

  // Use the same insured principal (mortgage amount + CMHC premium, when
  // applicable) as the actual payment calculation above - otherwise the
  // stress test/income-required figures are understated for exactly the
  // buyers (under 20% down) who most need them to be correct.
  const insuredMortgageAmount = mortgageResults.totalMortgage;

  const stressTestPayment = insuredMortgageAmount *
    (stressTestEffectiveMonthlyRate * Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments)) /
    (Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments) - 1);

  // Calculate income required (using a 32% GDS ratio).
  // Lenders count only 50% of condo fees towards GDS/TDS, not 100%.
  // NOTE: this is a GDS (Gross Debt Service) figure only. A proper TDS
  // (Total Debt Service) check would also need the applicant's other debt
  // payments (car loans, credit cards, lines of credit, etc.), which this
  // calculator does not currently collect as an input - so no TDS-based
  // income requirement is produced, and this number can still understate
  // what a lender would actually require if the buyer carries other debt.
  const annualPayment = stressTestPayment * 12 + data.propertyTaxes + data.heatingCosts + (data.condoFees * 12 * 0.5);
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
