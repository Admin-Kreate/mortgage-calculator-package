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

// M-5: single shared step used by every accelerated-simulation call site (main payoff loop,
// comparison chart, 5-year breakdown, and rate-term breakdown) so their prepayment timing
// rules cannot drift apart from one another - previously there were ~4 near-duplicate copies
// of this logic, each applying the one-time prepayment on the FIRST iteration (payment #1,
// i.e. at closing) instead of the 1-year anniversary the UI tooltip promises, and the annual
// prepayment on a hardcoded "every 12th payment" which was wrong for true bi-weekly/weekly
// periodicities.
//
// - The one-time prepayment is applied once, on the anniversary of the first year
//   (periodIndex === periodsPerYear) rather than on payment #1 / at closing.
// - The annual prepayment is applied once per year, on every anniversary starting with year 1.
function applyAcceleratedPayment(
    balance: number,
    periodicRate: number,
    basePaymentAmount: number,
    periodIndex: number, // 1-based count of this payment within the simulation
    periodsPerYear: number,
    oneTimePrePayment: number,
    oneTimeApplied: boolean,
    annualPrePayment: number
): { balance: number; interestPaid: number; principalPaid: number; oneTimeApplied: boolean } {
    const interestPayment = balance * periodicRate;
    let paymentAmount = basePaymentAmount;

    if (!oneTimeApplied && periodIndex === periodsPerYear && oneTimePrePayment > 0) {
        paymentAmount += oneTimePrePayment;
        oneTimeApplied = true;
    }

    if (periodIndex % periodsPerYear === 0 && annualPrePayment > 0) {
        paymentAmount += annualPrePayment;
    }

    const principalPayment = Math.min(Math.max(paymentAmount - interestPayment, 0), balance);
    const newBalance = Math.max(0, balance - principalPayment);

    return {
        balance: newBalance,
        interestPaid: interestPayment,
        principalPaid: principalPayment,
        oneTimeApplied
    };
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

    // M-9: a rate term longer than the amortization period makes no sense - clamp it.
    const effectiveRateTerm = Math.min(data.rateTerm, data.amortization);

    // Calculate balance at end of rate term (regular mortgage)
    let balanceEndOfTerm = principal;
    const termPayments = effectiveRateTerm * periodsPerYear;

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
    // F1: how many periods the schedule below actually takes to hit a zero balance. Equals
    // totalPayments for monthly/true-biweekly/true-weekly (the annuity formula solves for
    // exactly that), but comes in under totalPayments for the two accelerated frequencies,
    // since their (monthly-derived) payment is larger than what this periodicity's own
    // annuity formula would have solved for.
    let periodsToPayoff = totalPayments;

    if (data.loanType === 'interest only') {
        // M-2: no principal is ever repaid on an interest-only loan - every payment is
        // 100% interest, and the full original principal remains owing as a balloon.
        totalInterest = mortgagePayment * totalPayments;
        totalPrincipalPaid = 0;
    } else {
        // M-11: sum the actual amortization schedule instead of `payment * n - principal`,
        // which overstates interest because it assumes every payment (including the last)
        // is identical, which isn't true in a real schedule.
        let scheduleBalance = principal;
        let scheduleInterest = 0;
        let schedulePrincipal = 0;
        for (let i = 0; i < totalPayments; i++) {
            const interestPortion = scheduleBalance * periodicRate;
            const principalPortion = Math.min(mortgagePayment - interestPortion, scheduleBalance);
            scheduleBalance = Math.max(0, scheduleBalance - principalPortion);
            scheduleInterest += interestPortion;
            schedulePrincipal += principalPortion;
            if (scheduleBalance <= 0) {
                periodsToPayoff = i + 1;
                break;
            }
        }
        totalInterest = scheduleInterest;
        totalPrincipalPaid = schedulePrincipal;
    }

    // F1: exposed so the UI can show a genuinely shortened "Effective Amortization" for the
    // accelerated frequencies even when no additional payment-increase/prepayment has been
    // entered (that case is instead reflected in acceleratedResults.payoffYears below).
    // Interest-only never amortizes on its own regardless of frequency, so this is just the
    // nominal amortization there.
    const effectiveAmortizationYears = data.loanType === 'interest only'
        ? data.amortization
        : periodsToPayoff / periodsPerYear;

    const totalCost = data.loanType === 'interest only'
        ? principal + totalInterest // includes the balloon principal still owed at maturity
        : totalPrincipalPaid + totalInterest;

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

            const step = applyAcceleratedPayment(accBalance, periodicRate, adjustedPayment, accPayments, periodsPerYear, data.oneTimePrePayment, oneTimeApplied, data.annualPrePayment);
            accBalance = step.balance;
            accTotalInterest += step.interestPaid;
            accTotalPrincipal += step.principalPaid;
            oneTimeApplied = step.oneTimeApplied;

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

        // IO-2: "time saved" is measured against the nominal amortization - but an
        // interest-only loan never reaches that baseline at all, it never pays off on its
        // own. Comparing against it could produce a "FASTER" claim for a loan that
        // genuinely takes LONGER than the nominal amortization. Only claim "faster" when it
        // actually is faster, and only when the loan actually paid off within the cap.
        const isInterestOnlyLoan = data.loanType === 'interest only';
        const rawTimeSavedYears = data.amortization - acceleratedYears;
        const isGenuinelyFaster = payoffAchieved && rawTimeSavedYears > 0;
        const timeSavedYears = isGenuinelyFaster ? rawTimeSavedYears : 0;
        const timeSavedWholeYears = Math.max(0, Math.floor(timeSavedYears));
        const timeSavedMonths = Math.max(0, Math.round((timeSavedYears - timeSavedWholeYears) * 12));
        const interestSaved = payoffAchieved ? Math.max(0, totalInterest - accTotalInterest) : 0;

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
            const targetPayments = year * periodsPerYear;

            // Regular balance
            while (regPaymentCount < targetPayments && regBalance > 0.01) {
                regPaymentCount++;
                const interest = regBalance * periodicRate;
                const principalPortion = Math.min(mortgagePayment - interest, regBalance);
                regBalance = Math.max(0, regBalance - principalPortion);
            }

            // Accelerated balance - shares the same step logic as every other simulation loop
            while (accPaymentCount < targetPayments && accBalanceChart > 0.01) {
                accPaymentCount++;
                const step = applyAcceleratedPayment(accBalanceChart, periodicRate, adjustedPayment, accPaymentCount, periodsPerYear, data.oneTimePrePayment, oneTimeAppliedChart, data.annualPrePayment);
                accBalanceChart = step.balance;
                oneTimeAppliedChart = step.oneTimeApplied;
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
            const periodIndex = i + 1;
            const step = applyAcceleratedPayment(accFiveYearBalance, periodicRate, adjustedPayment, periodIndex, periodsPerYear, data.oneTimePrePayment, fiveYearOneTimeApplied, data.annualPrePayment);
            accFiveYearInterest += step.interestPaid;
            accFiveYearPrincipal += step.principalPaid;
            accFiveYearTotalPaid += step.interestPaid + step.principalPaid;
            accFiveYearBalance = step.balance;
            fiveYearOneTimeApplied = step.oneTimeApplied;

            if (accFiveYearBalance <= 0) break;
        }

        // Recalculate balance at end of term with accelerated payments
        let accBalanceEndOfTerm = principal;
        let termOneTimeApplied = false;

        for (let i = 0; i < termPayments; i++) {
            const periodIndex = i + 1;
            const step = applyAcceleratedPayment(accBalanceEndOfTerm, periodicRate, adjustedPayment, periodIndex, periodsPerYear, data.oneTimePrePayment, termOneTimeApplied, data.annualPrePayment);
            accBalanceEndOfTerm = step.balance;
            termOneTimeApplied = step.oneTimeApplied;

            if (accBalanceEndOfTerm <= 0) break;
        }

        // IO-2: describe what actually happened rather than always asserting "FASTER". For
        // an interest-only loan the meaningful comparison isn't against the nominal
        // amortization (which it never reaches on its own) - it's that extra payments turn a
        // loan that never self-liquidates into one that does.
        let timeSavedLabel: string;
        if (!payoffAchieved) {
            timeSavedLabel = 'STILL DOES NOT PAY OFF';
        } else if (isGenuinelyFaster) {
            timeSavedLabel = timeSavedWholeYears > 0
                ? `${timeSavedWholeYears} YEARS, ${timeSavedMonths} MONTHS FASTER`
                : `${timeSavedMonths} MONTHS FASTER`;
        } else if (isInterestOnlyLoan) {
            const payoffWholeYears = Math.floor(acceleratedYears);
            const payoffMonths = Math.round((acceleratedYears - payoffWholeYears) * 12);
            timeSavedLabel = `NOW PAYS OFF IN ${payoffWholeYears} YEARS${payoffMonths > 0 ? `, ${payoffMonths} MONTHS` : ''}`;
        } else {
            timeSavedLabel = 'NO TIME SAVED';
        }

        acceleratedResults = {
            adjustedPayment,
            payoffYears: acceleratedYears,
            payoffAchieved,
            totalInterestSaved: interestSaved,
            timeSaved: timeSavedLabel,
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
