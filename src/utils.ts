export function calculateMortgage(
  principal: number,
  interestRate: number,
  amortizationYears: number,
  paymentFrequency: string
): number {
  const annualRate = interestRate / 100;
  const semiAnnualRate = annualRate / 2;
  const equivalentRate = Math.pow(1 + semiAnnualRate, 2 / 12) - 1;
  const totalMonthlyPayments = amortizationYears * 12;

  const monthlyPayment = principal * (equivalentRate * Math.pow(1 + equivalentRate, totalMonthlyPayments)) / (Math.pow(1 + equivalentRate, totalMonthlyPayments) - 1);

  let payment;
  switch (paymentFrequency) {
    case "weekly":
      payment = (monthlyPayment * 12) / 52;
      break;
    case "biweekly":
      payment = (monthlyPayment * 12) / 26;
      break;
    case "monthly":
    default:
      payment = monthlyPayment;
  }

  return payment;
}
