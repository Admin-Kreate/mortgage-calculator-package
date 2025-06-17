export interface MortgageData {
    loanAmount: number;
    interestRate: number;
    rateTerm: number; // in years
    amortization: number;
    paymentFrequency: 'monthly' | 'biweekly' | 'weekly';
    loanType: 'regular' | 'interest-only';
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

export function calculateMortgage(data: MortgageData): MortgageResults {
    const principal = data.loanAmount;

    // Calculate monthly interest rate based on Canadian standards
    let monthlyRate: number;
    const annualRate = data.interestRate / 100;

    // Canadian mortgages use semi-annual compounding by default
    switch (data.compounding) {
        case 'semi-annual':
            monthlyRate = Math.pow(1 + annualRate / 2, 1 / 6) - 1;
            break;
        case 'monthly':
            monthlyRate = annualRate / 12;
            break;
        case 'quarterly':
            monthlyRate = Math.pow(1 + annualRate / 4, 1 / 3) - 1;
            break;
        case 'daily':
            monthlyRate = Math.pow(1 + annualRate / 365, 365 / 12) - 1;
            break;
        case 'weekly':
            monthlyRate = Math.pow(1 + annualRate / 52, 52 / 12) - 1;
            break;
        case 'bi-weekly':
            monthlyRate = Math.pow(1 + annualRate / 26, 26 / 12) - 1;
            break;
        default:
            monthlyRate = Math.pow(1 + annualRate / 2, 1 / 6) - 1;
    }

    const totalPayments = data.amortization * 12;

    // Calculate base mortgage payment
    let mortgagePayment: number;
    if (data.loanType === 'interest-only') {
        mortgagePayment = principal * monthlyRate;
    } else {
        if (monthlyRate === 0) {
            mortgagePayment = principal / totalPayments;
        } else {
            mortgagePayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        }
    }

    // Calculate first payment breakdown
    const monthlyInterest = principal * monthlyRate;
    const monthlyPrincipal = mortgagePayment - monthlyInterest;

    // Calculate balance at end of rate term (regular mortgage)
    let balanceEndOfTerm = principal;
    const termPayments = data.rateTerm * 12;

    for (let i = 0; i < termPayments; i++) {
        const interestPayment = balanceEndOfTerm * monthlyRate;
        const principalPayment = mortgagePayment - interestPayment;
        balanceEndOfTerm = Math.max(0, balanceEndOfTerm - principalPayment);
        if (balanceEndOfTerm <= 0) break;
    }

    // Calculate regular 5-year breakdown
    let fiveYearBalance = principal;
    let fiveYearInterest = 0;
    let fiveYearPrincipal = 0;
    const fiveYearPayments = Math.min(60, totalPayments);

    for (let i = 0; i < fiveYearPayments; i++) {
        const interestPayment = fiveYearBalance * monthlyRate;
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

            const interestPayment = accBalance * monthlyRate;
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
                const interest = regBalance * monthlyRate;
                const principal = mortgagePayment - interest;
                regBalance = Math.max(0, regBalance - principal);
                regPaymentCount++;
            }

            // Accelerated balance
            while (accPaymentCount < targetPayments && accBalanceChart > 0.01) {
                accPaymentCount++;
                const interest = accBalanceChart * monthlyRate;
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

        for (let i = 0; i < Math.min(60, totalPayments); i++) {
            const interestPayment = accFiveYearBalance * monthlyRate;
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
            const interestPayment = accBalanceEndOfTerm * monthlyRate;
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
        const accInterestPayment = principal * monthlyRate;
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
        principal: monthlyPrincipal,
        interest: monthlyInterest,
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