export function calculateMortgage(
    principal: number,
    interestRate: number,
    years: number,
    paymentFrequency: number
): number {
    const months = years * paymentFrequency;
    const monthlyInterestRate = interestRate / paymentFrequency / 100;
    return (
        (principal * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -months))
    );
}
