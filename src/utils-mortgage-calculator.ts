export interface MortgageData {
    loanAmount: number;
    interestRate: number;
    rateTerm: number; // in years
    amortization: number;
    paymentFrequency: 'monthly' | 'biweekly' | 'weekly';
    loanType: 'regular' | 'interest only';
    compounding: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annual';
    paymentIncrease: number; // dollar amount or percentage
    paymentIncreaseType: 'dollar' | 'percentage';
    oneTimePrePayment: number;
    annualPrePayment: number;
}

export interface MortgageResults {
    mortgagePayment: number;
    principal: number;
    interest: number;
    totalInterest: number;
    totalCost: number;
    loanAmount: number;
    balanceEndOfTerm: number;
    fiveYearBreakdown: {
        totalPaid: number;
        interestPaid: number;
        principalPaid: number;
        balanceRemaining: number;
    };
    acceleratedResults?: {
        adjustedPayment: number;
        payoffYears: number;
        totalInterestSaved: number;
        timeSaved: string;
        balanceComparison: Array<{
            year: number;
            regularBalance: number;
            acceleratedBalance: number;
        }>;
    };
}

export interface AmortizationPayment {
    year: number;
    balanceRemaining: number;
    annualInterestPaid: number;
    annualPrincipalPaid: number;
    annualTotalPaid: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    totalPaid: number;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatCurrencyDecimal(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-CA').format(num);
}

export function parseCurrency(value: string): number {
    return parseFloat(value.replace(/[,$]/g, '')) || 0;
}

// M-1: periods per year for each supported payment frequency.
function getPeriodsPerYear(frequency: MortgageData['paymentFrequency']): number {
    switch (frequency) {
        case 'biweekly':
            return 26;
        case 'weekly':
            return 52;
        case 'monthly':
        default:
            return 12;
    }
}

// M-1: the periodic-rate conversion from a nominal annual rate compounded `compounding`-many
// times/year to an equivalent rate per payment period, generalised over the chosen payment
// frequency's periodsPerYear - instead of always assuming monthly (m/12) payments regardless
// of data.paymentFrequency.
function getPeriodicRate(annualRate: number, compounding: MortgageData['compounding'], periodsPerYear: number): number {
    switch (compounding) {
        case 'semi-annual':
            return Math.pow(1 + annualRate / 2, 2 / periodsPerYear) - 1;
        case 'monthly':
            return Math.pow(1 + annualRate / 12, 12 / periodsPerYear) - 1;
        case 'quarterly':
            return Math.pow(1 + annualRate / 4, 4 / periodsPerYear) - 1;
        case 'daily':
            return Math.pow(1 + annualRate / 365, 365 / periodsPerYear) - 1;
        case 'weekly':
            return Math.pow(1 + annualRate / 52, 52 / periodsPerYear) - 1;
        case 'bi-weekly':
            return Math.pow(1 + annualRate / 26, 26 / periodsPerYear) - 1;
        default:
            return Math.pow(1 + annualRate / 2, 2 / periodsPerYear) - 1;
    }
}

export function calculateMortgage(data: MortgageData): MortgageResults {
    const principal = data.loanAmount;

    const annualRate = data.interestRate / 100;
    const periodsPerYear = getPeriodsPerYear(data.paymentFrequency);

    // M-1: the periodic interest rate based on Canadian standards, generalised over the
    // chosen payment frequency (periodsPerYear) instead of always assuming monthly payments.
    const periodicRate = getPeriodicRate(annualRate, data.compounding, periodsPerYear);

    // M-1: selecting "Bi-Weekly" or "Weekly" used to still solve (and display) a monthly
    // annuity under the wrong label - totalPayments now reflects the TRUE number of payments
    // at the selected frequency.
    const totalPayments = data.amortization * periodsPerYear;

    // Calculate base mortgage payment
    let mortgagePayment: number;
    if (data.loanType === 'interest only') {
        mortgagePayment = principal * periodicRate;
    } else {
        if (periodicRate === 0) {
            mortgagePayment = principal / totalPayments;
        } else {
            mortgagePayment = principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1);
        }
    }

    // Calculate first payment breakdown
    const periodicInterest = principal * periodicRate;
    const periodicPrincipal = mortgagePayment - periodicInterest;

    // Calculate balance at end of rate term (regular mortgage)
    let balanceEndOfTerm = principal;
    const termPayments = data.rateTerm * periodsPerYear;

    for (let i = 0; i < termPayments; i++) {
        const interestPayment = balanceEndOfTerm * periodicRate;
        const principalPayment = mortgagePayment - interestPayment;
        balanceEndOfTerm = Math.max(0, balanceEndOfTerm - principalPayment);
        if (balanceEndOfTerm <= 0) break;
    }

    // Calculate regular 5-year breakdown
    let fiveYearBalance = principal;
    let fiveYearInterest = 0;
    let fiveYearPrincipal = 0;
    const fiveYearPayments = Math.min(5 * periodsPerYear, totalPayments);

    for (let i = 0; i < fiveYearPayments; i++) {
        const interestPayment = fiveYearBalance * periodicRate;
        const principalPayment = mortgagePayment - interestPayment;
        fiveYearBalance = Math.max(0, fiveYearBalance - principalPayment);
        fiveYearInterest += interestPayment;
        fiveYearPrincipal += principalPayment;
        if (fiveYearBalance <= 0) break;
    }

    const fiveYearTotalPaid = fiveYearInterest + fiveYearPrincipal;

    // Calculate total interest over full amortization
    const totalInterest = (mortgagePayment * totalPayments) - principal;
    const totalCost = principal + totalInterest;

    // Check for accelerated payments and recalculate everything if present
    const hasAcceleratedPayments = data.paymentIncrease > 0 || data.oneTimePrePayment > 0 || data.annualPrePayment > 0;
    let acceleratedResults = undefined;

    if (hasAcceleratedPayments) {
        const adjustedPayment = mortgagePayment + data.paymentIncrease;

        // Simulate accelerated mortgage
        let accBalance = principal;
        let accTotalInterest = 0;
        let accPayments = 0;
        let oneTimeApplied = false;

        while (accBalance > 0.01 && accPayments < totalPayments * 2) {
            accPayments++;

            const interestPayment = accBalance * periodicRate;
            let paymentAmount = adjustedPayment;

            // Apply one-time prepayment in first year
            if (!oneTimeApplied && accPayments <= 12 && data.oneTimePrePayment > 0) {
                paymentAmount += data.oneTimePrePayment;
                oneTimeApplied = true;
            }

            // Apply annual prepayment once per year starting from year 1
            if (accPayments % 12 === 0 && accPayments >= 12 && data.annualPrePayment > 0) {
                paymentAmount += data.annualPrePayment;
            }

            const principalPayment = Math.min(paymentAmount - interestPayment, accBalance);
            accBalance -= principalPayment;
            accTotalInterest += interestPayment;

            if (accBalance <= 0) break;
        }

        const acceleratedYears = accPayments / 12;
        const timeSavedYears = data.amortization - acceleratedYears;
        const timeSavedWholeYears = Math.floor(timeSavedYears);
        const timeSavedMonths = Math.round((timeSavedYears - timeSavedWholeYears) * 12);
        const interestSaved = totalInterest - accTotalInterest;

        // Generate comparison chart data
        const balanceComparison = [];
        const currentYear = new Date().getFullYear();

        // Simulate both regular and accelerated for chart
        let regBalance = principal;
        let accBalanceChart = principal;
        let regPaymentCount = 0;
        let accPaymentCount = 0;
        let oneTimeAppliedChart = false;

        for (let year = 0; year <= 25; year += 5) {
            const targetPayments = year * 12;

            // Regular balance
            while (regPaymentCount < targetPayments && regBalance > 0.01) {
                const interest = regBalance * periodicRate;
                const principal = mortgagePayment - interest;
                regBalance = Math.max(0, regBalance - principal);
                regPaymentCount++;
            }

            // Accelerated balance
            while (accPaymentCount < targetPayments && accBalanceChart > 0.01) {
                accPaymentCount++;
                const interest = accBalanceChart * periodicRate;
                let payment = adjustedPayment;

                if (!oneTimeAppliedChart && accPaymentCount <= 12 && data.oneTimePrePayment > 0) {
                    payment += data.oneTimePrePayment;
                    oneTimeAppliedChart = true;
                }

                if (accPaymentCount % 12 === 0 && data.annualPrePayment > 0) {
                    payment += data.annualPrePayment;
                }

                const principal = Math.min(payment - interest, accBalanceChart);
                accBalanceChart = Math.max(0, accBalanceChart - principal);
            }

            balanceComparison.push({
                year: currentYear + year,
                regularBalance: regBalance,
                acceleratedBalance: accBalanceChart
            });
        }

        // Recalculate 5-year breakdown with accelerated payments
        let accFiveYearBalance = principal;
        let accFiveYearInterest = 0;
        let accFiveYearPrincipal = 0;
        let accFiveYearTotalPaid = 0;
        let fiveYearOneTimeApplied = false;

        for (let i = 0; i < fiveYearPayments; i++) {
            const interestPayment = accFiveYearBalance * periodicRate;
            let paymentAmount = adjustedPayment;

            if (!fiveYearOneTimeApplied && i < 12 && data.oneTimePrePayment > 0) {
                paymentAmount += data.oneTimePrePayment;
                fiveYearOneTimeApplied = true;
            }

            if ((i + 1) % 12 === 0 && (i + 1) >= 12 && data.annualPrePayment > 0) {
                paymentAmount += data.annualPrePayment;
            }

            const principalPayment = Math.min(paymentAmount - interestPayment, accFiveYearBalance);
            accFiveYearBalance = Math.max(0, accFiveYearBalance - principalPayment);
            accFiveYearInterest += interestPayment;
            accFiveYearPrincipal += principalPayment;
            accFiveYearTotalPaid += paymentAmount;

            if (accFiveYearBalance <= 0) break;
        }

        // Recalculate balance at end of term with accelerated payments
        let accBalanceEndOfTerm = principal;
        let termOneTimeApplied = false;

        for (let i = 0; i < termPayments; i++) {
            const interestPayment = accBalanceEndOfTerm * periodicRate;
            let paymentAmount = adjustedPayment;

            if (!termOneTimeApplied && i < 12 && data.oneTimePrePayment > 0) {
                paymentAmount += data.oneTimePrePayment;
                termOneTimeApplied = true;
            }

            if ((i + 1) % 12 === 0 && (i + 1) >= 12 && data.annualPrePayment > 0) {
                paymentAmount += data.annualPrePayment;
            }

            const principalPayment = Math.min(paymentAmount - interestPayment, accBalanceEndOfTerm);
            accBalanceEndOfTerm = Math.max(0, accBalanceEndOfTerm - principalPayment);

            if (accBalanceEndOfTerm <= 0) break;
        }

        acceleratedResults = {
            adjustedPayment,
            payoffYears: acceleratedYears,
            totalInterestSaved: interestSaved,
            timeSaved: timeSavedWholeYears > 0
                ? `${timeSavedWholeYears} YEARS, ${timeSavedMonths} MONTHS FASTER`
                : `${timeSavedMonths} MONTHS FASTER`,
            balanceComparison
        };

        // Calculate accelerated payment breakdown
        const accInterestPayment = principal * periodicRate;
        const accPrincipalPayment = adjustedPayment - accInterestPayment;

        // Return accelerated results as the main results
        return {
            mortgagePayment: adjustedPayment,
            principal: accPrincipalPayment,
            interest: accInterestPayment,
            totalInterest: accTotalInterest,
            totalCost: principal + accTotalInterest,
            loanAmount: principal,
            balanceEndOfTerm: accBalanceEndOfTerm,
            fiveYearBreakdown: {
                totalPaid: accFiveYearTotalPaid,
                interestPaid: accFiveYearInterest,
                principalPaid: accFiveYearPrincipal,
                balanceRemaining: accFiveYearBalance
            },
            acceleratedResults
        };
    }

    return {
        mortgagePayment,
        principal: periodicPrincipal,
        interest: periodicInterest,
        totalInterest,
        totalCost,
        loanAmount: principal,
        balanceEndOfTerm,
        fiveYearBreakdown: {
            totalPaid: fiveYearTotalPaid,
            interestPaid: fiveYearInterest,
            principalPaid: fiveYearPrincipal,
            balanceRemaining: fiveYearBalance
        },
        acceleratedResults
    };
}
