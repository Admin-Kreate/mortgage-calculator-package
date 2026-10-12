export interface MortgageData {
    loanAmount: number;
    interestRate: number;
    rateTerm: number; // in years
    amortization: number;
    // F1: 'acceleratedBiweekly' / 'acceleratedWeekly' are NOT solved independently at 26/52
    // periods - their payment amount is derived from the true monthly payment (see the
    // isAcceleratedFrequency branch in calculateMortgage below). 'biweekly' / 'weekly' remain
    // "true" schedules, solved independently at their own periodicity, same as before.
    paymentFrequency: 'monthly' | 'biweekly' | 'weekly' | 'acceleratedBiweekly' | 'acceleratedWeekly';
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
    totalPrincipalPaid: number;
    loanAmount: number;
    balanceEndOfTerm: number;
    // F1: how long it actually takes to reach a zero balance at `mortgagePayment`, ignoring
    // any payment-increase/prepayment (those are reflected in acceleratedResults.payoffYears
    // instead). For monthly / true bi-weekly / true weekly this is always == amortization
    // (the annuity formula solves for exactly that). For the two accelerated frequencies it
    // comes in under amortization, because their payment is derived from the monthly payment
    // (which pays the equivalent of 13 monthly payments a year instead of 12) - that's the
    // whole point of "accelerated". Not meaningful for interest-only (never amortizes on its
    // own), where it's just set to the nominal amortization.
    effectiveAmortizationYears: number;
    fiveYearBreakdown: {
        totalPaid: number;
        interestPaid: number;
        principalPaid: number;
        balanceRemaining: number;
    };
    acceleratedResults?: {
        adjustedPayment: number;
        payoffYears: number;
        payoffAchieved: boolean;
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

// M-1: periods per year for each supported payment frequency. The accelerated variants (F1)
// run their interest-accrual / balance-reduction simulation at the SAME periodicity as their
// true counterpart (26 / 52) - only the payment amount differs, see the isAcceleratedFrequency
// branch in calculateMortgage below.
function getPeriodsPerYear(frequency: MortgageData['paymentFrequency']): number {
    switch (frequency) {
        case 'biweekly':
        case 'acceleratedBiweekly':
            return 26;
        case 'weekly':
        case 'acceleratedWeekly':
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

// Standard amortization annuity-payment formula, shared by the true-frequency branch and by
// the accelerated branch's (F1) monthly baseline.
function annuityPayment(principal: number, periodicRate: number, totalPayments: number): number {
    if (periodicRate === 0) return principal / totalPayments;
    return principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1);
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

    // F1: 'acceleratedBiweekly' / 'acceleratedWeekly' are NOT solved independently at their
    // own periodicity (26/52) the way true bi-weekly/weekly are. Their payment is derived
    // straight from the TRUE MONTHLY payment: accelerated bi-weekly = monthlyPayment / 2,
    // paid 26x/yr; accelerated weekly = monthlyPayment / 4, paid 52x/yr. Because
    // 26 * (M/2) = 13M and 52 * (M/4) = 13M, both pay the equivalent of one extra monthly
    // payment every year versus true monthly's 12M - that extra payment is what actually
    // shortens the amortization (see effectiveAmortizationYears below), which is the entire
    // point of "accelerated" frequencies on a real Canadian mortgage.
    //
    // This derivation intentionally only applies to regular (amortizing) loans. An
    // interest-only payment is just `principal * periodicRate` for whatever periodicity is
    // selected - there is no amortizing schedule to accelerate, so accelerated interest-only
    // behaves identically to true-frequency interest-only.
    const isAcceleratedFrequency = data.paymentFrequency === 'acceleratedBiweekly' || data.paymentFrequency === 'acceleratedWeekly';

    // Calculate base mortgage payment
    let mortgagePayment: number;
    if (data.loanType === 'interest only') {
        mortgagePayment = principal * periodicRate;
    } else if (isAcceleratedFrequency) {
        const monthlyPeriodicRate = getPeriodicRate(annualRate, data.compounding, 12);
        const monthlyTotalPayments = data.amortization * 12;
        const monthlyPayment = annuityPayment(principal, monthlyPeriodicRate, monthlyTotalPayments);
        mortgagePayment = data.paymentFrequency === 'acceleratedBiweekly' ? monthlyPayment / 2 : monthlyPayment / 4;
    } else {
        mortgagePayment = annuityPayment(principal, periodicRate, totalPayments);
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

    // Calculate total interest / total principal paid over the full amortization.
    let totalInterest: number;
    let totalPrincipalPaid: number;

    if (data.loanType === 'interest only') {
        // M-2: no principal is ever repaid on an interest-only loan - every payment is
        // 100% interest, and the full original principal remains owing as a balloon. The old
        // `(mortgagePayment * totalPayments) - principal` shortcut assumed principal would be
        // paid down like a regular amortizing loan, which produced a nonsense figure here.
        totalInterest = mortgagePayment * totalPayments;
        totalPrincipalPaid = 0;
    } else {
        totalInterest = (mortgagePayment * totalPayments) - principal;
        totalPrincipalPaid = principal;
    }

    const totalCost = data.loanType === 'interest only'
        ? principal + totalInterest // includes the balloon principal still owed at maturity
        : totalPrincipalPaid + totalInterest;

    // F1: exposed so the UI can show a genuinely shortened "Effective Amortization" for the
    // accelerated frequencies even when no additional payment-increase/prepayment has been
    // entered (that case is instead reflected in acceleratedResults.payoffYears below).
    // Solved analytically (the inverse of the annuity formula) rather than simulated, since
    // the base schedule (no extra payments) decays at a fixed payment/rate with no
    // conditional prepayment logic to walk through. Interest-only never amortizes on its own
    // regardless of frequency, so this is just the nominal amortization there.
    const effectiveAmortizationYears = data.loanType === 'interest only'
        ? data.amortization
        : (periodicRate === 0
            ? (principal / mortgagePayment) / periodsPerYear
            : (Math.log(mortgagePayment / (mortgagePayment - periodicRate * principal)) / Math.log(1 + periodicRate)) / periodsPerYear);

    // Check for accelerated payments and recalculate everything if present
    const hasAcceleratedPayments = data.paymentIncrease > 0 || data.oneTimePrePayment > 0 || data.annualPrePayment > 0;
    let acceleratedResults = undefined;

    if (hasAcceleratedPayments) {
        const adjustedPayment = mortgagePayment + data.paymentIncrease;

        // Simulate accelerated mortgage
        let accBalance = principal;
        let accTotalInterest = 0;
        let accTotalPrincipal = 0;
        let accPayments = 0;
        let oneTimeApplied = false;
        const maxIterations = totalPayments * 2;

        // IO-1: totals measured at the user's OWN amortization horizon, captured as the
        // simulation passes it. When the loan doesn't clear, these are what get reported -
        // otherwise the internal 2x-amortization safety cap leaks into the user-facing
        // numbers, e.g. an interest-only loan with a token increase reported ~2x the real
        // amortization's worth of interest. The cap is an implementation detail and must
        // never set the reported horizon.
        let interestAtNominalHorizon = 0;
        let principalAtNominalHorizon = 0;
        let balanceAtNominalHorizon = principal;

        while (accBalance > 0.01 && accPayments < maxIterations) {
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
            accTotalPrincipal += principalPayment;

            if (accPayments <= totalPayments) {
                interestAtNominalHorizon = accTotalInterest;
                principalAtNominalHorizon = accTotalPrincipal;
                balanceAtNominalHorizon = accBalance;
            }

            if (accBalance <= 0) break;
        }

        // M-3: the loan may not actually clear within the simulation cap (e.g. interest-only
        // plus a token payment increase). Detect that explicitly instead of reporting a
        // nonsense payoff time / negative "savings".
        const payoffAchieved = accBalance <= 0.01;

        // Reported totals: the real ones when the loan clears, otherwise the ones measured
        // at the amortization the user actually entered (IO-1).
        const reportedTotalInterest = payoffAchieved ? accTotalInterest : interestAtNominalHorizon;
        const reportedTotalPrincipal = payoffAchieved ? accTotalPrincipal : principalAtNominalHorizon;
        const reportedRemainingBalance = payoffAchieved ? 0 : balanceAtNominalHorizon;

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
            payoffAchieved,
            totalInterestSaved: interestSaved,
            timeSaved: timeSavedWholeYears > 0
                ? `${timeSavedWholeYears} YEARS, ${timeSavedMonths} MONTHS FASTER`
                : `${timeSavedMonths} MONTHS FASTER`,
            balanceComparison
        };

        // Calculate accelerated payment breakdown
        const accInterestPayment = principal * periodicRate;
        const accPrincipalPayment = adjustedPayment - accInterestPayment;

        // IO-1: total cost must include prepayments and any balance still owed, and must be
        // measured over the amortization the user entered (not the internal simulation cap).
        const accTotalCost = reportedTotalPrincipal + reportedTotalInterest + reportedRemainingBalance;

        // Return accelerated results as the main results
        return {
            mortgagePayment: adjustedPayment,
            principal: accPrincipalPayment,
            interest: accInterestPayment,
            totalInterest: reportedTotalInterest,
            totalCost: accTotalCost,
            totalPrincipalPaid: reportedTotalPrincipal,
            loanAmount: principal,
            balanceEndOfTerm: accBalanceEndOfTerm,
            effectiveAmortizationYears,
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
        totalPrincipalPaid,
        loanAmount: principal,
        balanceEndOfTerm,
        effectiveAmortizationYears,
        fiveYearBreakdown: {
            totalPaid: fiveYearTotalPaid,
            interestPaid: fiveYearInterest,
            principalPaid: fiveYearPrincipal,
            balanceRemaining: fiveYearBalance
        },
        acceleratedResults
    };
}
