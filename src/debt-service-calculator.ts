import {
  calculateAllRatios, formatCurrencyDetailed, LoanType,
  DebtServiceSettings, QualificationResult, calculateQualification, MAX_LIMITS, B20_BENCHMARK_RATE,
  DebtItems, DebtObligations, calculateDebtObligations, REVOLVING_MIN_PAYMENT_RATE, HELOC_QUALIFYING_AMORTIZATION_YEARS,
  PREFERRED_LIMITS, RatioStatusLevel, getRatioStatus,
  ImprovementPatch, RatioImprovement, suggestRatioImprovements
} from './utils-debt-service-calculator';
import StressTestRuleIcon from './assets/icons/stress-test-rule.svg';
import LoadDetailsIcon from './assets/icons/loan-details.svg';
import RentalIncomeRuleIcon from './assets/icons/rental-income-rule.svg'
import AddRentalIncomeIcon from './assets/icons/add-rental-income.svg';
import RateIcon from './assets/icons/debt-service-rate.svg';
import HomeExpenseIcon from './assets/icons/home-expense.svg';
import AmortizationIcon from "./assets/icons/amortization.svg";
import DropdownIcon from './assets/icons/dropdown-icon.svg';

export function initDebtServiceCalculator(container: HTMLElement) {
  const calculatorInputsHTML = `
    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${LoadDetailsIcon}" alt="Mortgage Amount icon"/>
          <div class="title">Mortgage Amount</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field load-amount">
          <div class="field-label">Loan Amount</div>
          <input type="text" value="$  500,000" data-previous-value="500000" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="1500000" value="500000" step="10000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$1,500,000+</span>
          </div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field gross-annual-income">
          <div class="field-label">Gross Annual Income</div>
          <input type="text" value="$  150,000" data-previous-value="150000" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="500000" value="150000" step="10000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$500,000+</span>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input dsc-debts-card">
      <div class="header stacked">
        <div class="title-wrapper">
          <div class="title">Monthly Debts</div>
        </div>
        <div class="mortgage-calculator-info">Credit cards and unsecured lines of credit count at 3% of the balance per month. A secured HELOC counts as if it were paid off over 25 years at its own rate.</div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field car-loan-monthly">
          <div class="field-label">Car Loan / Lease ($/mo)</div>
          <input type="text" value="$  300" data-previous-value="300" class="value-input">
          <div class="field-error"></div>
        </div>
        <div class="input-field student-loan-monthly">
          <div class="field-label">Student Loan ($/mo)</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
        </div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field other-loan-monthly">
          <div class="field-label">Other Loans ($/mo)</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
        </div>
        <div class="input-field credit-card-balance">
          <div class="field-label">Credit Card Balance ($)</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
          <div class="dsc-debt-helper"></div>
        </div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field line-of-credit-balance">
          <div class="field-label">Unsecured Line of Credit ($)</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
          <div class="dsc-debt-helper"></div>
        </div>
        <div class="input-field heloc-balance">
          <div class="field-label">HELOC Balance ($)</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field heloc-rate">
          <div class="field-label">HELOC Rate (%)</div>
          <input type="text" value="7.00%" data-previous-value="7.00" class="value-input">
          <div class="field-error"></div>
          <div class="dsc-debt-helper"></div>
        </div>
      </div>
      <div class="dsc-debts-total">
        <span>Total counted toward TDS</span>
        <strong>$300.00/mo</strong>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${HomeExpenseIcon}" alt="Home Expenses icon"/>
          <div class="title">Home Expenses</div>
        </div>
        <div class="mortgage-calculator-info">To budget better and calculate a more realistic total monthly cost, enter the additional home expenses here.</div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field home-expense-monthly">
          <div class="field-label">Property Tax (Monthly)</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <div class="field-error"></div>
        </div>
        <div class="input-field home-expense-yearly">
          <div class="field-label">Property Tax (Yearly)</div>
          <input type="text" value="$  2,400" data-previous-value="2400" class="value-input">
          <div class="field-error"></div>
        </div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field home-expense-condo-fees">
          <div class="field-label">Condo fees (Monthly)</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <div class="field-error"></div>
        </div>
        <div class="input-field home-expense-heat">
          <div class="field-label">Heat (Monthly)</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <div class="field-error"></div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input debt-service-rate">
      <div class="header">
        <div class="title-wrapper">
          <img src="${RateIcon}" alt="Rate icon"/>
          <div class="title">Rate</div>
        </div>
        <div class="btn-group-selector">
          <div class="selector active">Regular</div>
          <div class="selector">Interest Only</div>
        </div>
        <div class="mortgage-calculator-info full-row-width">Your mortgage interest rate can either be Fixed for the term or Variable (which changes with the prime rate). The Rate Term is the contract length with a lender.</div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline compounding">
          <div class="dropdown-field inline-label">
            <div class="field-label">Compounding</div>
            <span>Semi-Annual</span>
            <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
          </div>
          <div class="dropdown-opts">
            <div class="dropdown-opt">Daily</div>
            <div class="dropdown-opt">Weekly</div>
            <div class="dropdown-opt">Bi-Weekly</div>
            <div class="dropdown-opt">Monthly</div>
            <div class="dropdown-opt">Quarterly</div>
            <div class="dropdown-opt">Semi-Annual</div>
          </div>
        </div>
      </div>
      <div class="input-fields">
        <div class="input-field rate">
          <div class="field-label">Rate</div>
          <input type="text" value="6.29%" data-previous-value="6.29" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="10" value="6.29" step="0.05" class="slider">
        </div>
        <div class="dropdown inline rate-term">
          <div class="dropdown-field inline-label">
            <div class="field-label">Rate Term</div>
            <span>5 years</span>
            <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
          </div>
          <div class="dropdown-opts">
            <div class="dropdown-opt">1 year</div>
            <div class="dropdown-opt">2 years</div>
            <div class="dropdown-opt">3 years</div>
            <div class="dropdown-opt">4 years</div>
            <div class="dropdown-opt">5 years</div>
            <div class="dropdown-opt">7 years</div>
            <div class="dropdown-opt">10 years</div>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${AmortizationIcon}" alt="Amortization icon"/>
          <div class="title">Amortization</div>
        </div>
        <div class="mortgage-calculator-info">Amortization is the total time it takes to pay off your mortgage in full. New mortgages usually start with an amortization of 25 years or 30 years in Canada.</div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field amortization">
          <div class="field-label">Amortization</div>
          <input type="text" value="25 Years" data-previous-value="25" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="5" max="30" value="25" step="1" class="slider">
          <div class="range-label">
            <span>5 Year</span>
            <span>30 Years</span>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input add-rental-income">
      <div class="header stacked">
        <div class="title-toggle-wrapper">
          <div class="title-wrapper">
            <img src="${AddRentalIncomeIcon}" alt="Add Rental Income icon"/>
            <div class="title">Add Rental Income</div>
          </div>
          <div class="toggle">
            <div class="opt off selected" data-value="off"></div>
            <div class="opt on" data-value="on"></div>
          </div>
        </div>
        <div class="mortgage-calculator-info">If you plan to rent out part of your home, enter the rent amount here to reduce your total monthly cost.</div>
      </div>

      <div class="input-fields half-width-fields expandable">
        <div class="input-field add-rental-income-monthly">
          <div class="field-label">Monthly</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <div class="field-error"></div>
        </div>
        <div class="input-field add-rental-income-yearly">
          <div class="field-label">Yearly</div>
          <input type="text" value="$  2,400" data-previous-value="2400" class="value-input">
          <div class="field-error"></div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input stress-test-rule">
      <div class="header">
        <div class="title-wrapper">
          <img src="${StressTestRuleIcon}" alt="Stress Test Rule icon"/>
          <div class="title">Stress Test Rule</div>
        </div>
        <div class="btn-group-selector">
          <div class="selector">Contract</div>
          <div class="selector active">B20</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline condo-fee-inclusion-rate">
          <div class="dropdown-field inline-label">
            <div class="field-label">Condo Fee Inclusion Rate</div>
            <span>50%</span>
            <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
          </div>
          <div class="dropdown-opts">
            <div class="dropdown-opt">0%</div>
            <div class="dropdown-opt">50%</div>
            <div class="dropdown-opt">100%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input rental-income-rule">
      <div class="header">
        <div class="title-wrapper">
          <img src="${RentalIncomeRuleIcon}" alt="Rental Income Rule icon"/>
          <div class="title">Rental Income Rule</div>
        </div>
        <div class="btn-group-selector">
          <div class="selector">Add Back</div>
          <div class="selector active">Offset</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline rental-income-portion">
          <div class="dropdown-field inline-label">
            <div class="field-label">Rental Income Portion</div>
            <span>50%</span>
            <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
          </div>
          <div class="dropdown-opts">
            <div class="dropdown-opt">25%</div>
            <div class="dropdown-opt">50%</div>
            <div class="dropdown-opt">75%</div>
            <div class="dropdown-opt">100%</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const calculatorResultsHTML = `
    <div class="dsc-verdict" data-level="within">
      <div class="dsc-verdict-headline">Within lender guidelines</div>
      <div class="dsc-verdict-detail"></div>
    </div>

    <div class="dsc-gauges">
      <div class="label">Debt Service Ratios</div>
      <div class="dsc-gauge" data-metric="gds">
        <div class="dsc-gauge-header">
          <span class="dsc-gauge-label">GDS</span>
          <span class="dsc-gauge-value">28.55%</span>
        </div>
        <div class="dsc-gauge-track" role="meter" aria-valuemin="0" aria-valuemax="60" aria-valuenow="28.55" aria-label="GDS ratio">
          <div class="dsc-gauge-fill"></div>
        </div>
        <div class="dsc-gauge-caption">Lender preferred &le;32% &middot; CMHC max 39%</div>
      </div>
      <div class="dsc-gauge" data-metric="tds">
        <div class="dsc-gauge-header">
          <span class="dsc-gauge-label">TDS</span>
          <span class="dsc-gauge-value">30.95%</span>
        </div>
        <div class="dsc-gauge-track" role="meter" aria-valuemin="0" aria-valuemax="60" aria-valuenow="30.95" aria-label="TDS ratio">
          <div class="dsc-gauge-fill"></div>
        </div>
        <div class="dsc-gauge-caption">Lender preferred &le;40% &middot; CMHC max 44%</div>
      </div>
    </div>

    <div class="dsc-stress">
      <div class="label">Stress Test</div>
      <div class="dsc-stress-row">
        <div class="dsc-stress-col">
          <div class="dsc-stress-label">Qualifying rate <span class="dsc-stress-badge">B20</span></div>
          <div class="dsc-stress-value">8.29%</div>
          <div class="dsc-stress-payment">$0.00/mo</div>
        </div>
        <div class="dsc-stress-col">
          <div class="dsc-stress-label">Your rate</div>
          <div class="dsc-stress-value">6.29%</div>
          <div class="dsc-stress-payment">$0.00/mo</div>
        </div>
      </div>
      <div class="dsc-stress-note"></div>
    </div>

    <div class="debt-service-ratios">
      <div class="details">
        <div class="dsc-stack-bar" role="img" aria-label="Monthly breakdown of mortgage, home expenses, debts, and cash left">
          <div class="dsc-stack-segment dsc-stack-mortgage"></div>
          <div class="dsc-stack-segment dsc-stack-home"></div>
          <div class="dsc-stack-segment dsc-stack-debts"></div>
          <div class="dsc-stack-segment dsc-stack-cash"></div>
        </div>
        <div class="debt-service-details">
          <div class="service-detail monthly-mortgage">
            <div class="service-detail-icon"></div>
            <div class="service-detail-name">Monthly Mortgage</div>
            <div class="service-detail-value">$2,934.93</div>
          </div>
          <div class="service-detail debt-payment">
            <div class="service-detail-icon"></div>
            <div class="service-detail-name">Debt Payment</div>
            <div class="service-detail-value">$300.00</div>
          </div>
          <div class="service-detail home-expenses">
            <div class="service-detail-icon"></div>
            <div class="service-detail-name">Home Expenses <span>(incl. rental offset)</span></div>
            <div class="service-detail-value">$1,233.33</div>
          </div>
          <div class="service-detail cash-left">
            <div class="service-detail-icon"></div>
            <div class="service-detail-name">Cash Left (Gross)</div>
            <div class="service-detail-value">$8,531.74</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dsc-qualify">
      <div class="label">What You Qualify For</div>
      <div class="dsc-qualify-grid">
        <div class="dsc-qualify-item">
          <div class="dsc-qualify-label">Max mortgage at CMHC limits</div>
          <div class="dsc-qualify-value">&mdash;</div>
        </div>
        <div class="dsc-qualify-item">
          <div class="dsc-qualify-label">Minimum income for this loan</div>
          <div class="dsc-qualify-value">&mdash;</div>
        </div>
        <div class="dsc-qualify-item">
          <div class="dsc-qualify-label">Monthly room left (TDS)</div>
          <div class="dsc-qualify-value">&mdash;</div>
        </div>
      </div>
      <div class="dsc-qualify-note"></div>
    </div>

    <div class="ways-to-save">
      <div class="section-wrapper">
        <div class="sec-heading">Ways to lower your ratios</div>
        <div class="ways-to-save-intro"></div>
        <div class="ways-to-save-list"></div>
      </div>
    </div>
  `;

  // Onboarding: a 6-step walkthrough of what GDS/TDS mean and how the calculator's main inputs
  // feed them, ported from mortgage-calculator.ts's own wizard pattern - one value collected
  // per step, explanation attached to the thing it describes. Gated on a localStorage key so
  // it only shows on a visitor's first visit.
  const onboardingModalHTML = `
    <div class="onboarding-overlay">
      <div class="onboarding-modal">
        <div class="onboarding-progress">
          <span class="dot" data-dot="1"></span>
          <span class="dot" data-dot="2"></span>
          <span class="dot" data-dot="3"></span>
          <span class="dot" data-dot="4"></span>
          <span class="dot" data-dot="5"></span>
          <span class="dot" data-dot="6"></span>
        </div>

        <div class="onboarding-step" data-step="1">
          <div class="onboarding-title">Can you actually afford this mortgage?</div>
          <div class="onboarding-subtitle">Lenders answer that with two ratios: <strong>GDS</strong> (housing costs &divide; income) and <strong>TDS</strong> (housing costs + other debts &divide; income). We'll walk through what feeds each one.</div>
          <div class="onboarding-note">
            <strong>The limits lenders use:</strong>
            <ul>
              <li><em>Lender preferred:</em> GDS &le; 32%, TDS &le; 40%.</li>
              <li><em>CMHC maximum:</em> GDS &le; 39%, TDS &le; 44%.</li>
            </ul>
            Staying under the preferred numbers gives you the most room; the CMHC numbers are the hard ceiling.
          </div>
        </div>

        <div class="onboarding-step" data-step="2">
          <div class="onboarding-title">What's your gross annual income?</div>
          <div class="onboarding-subtitle">Gross means before tax. Both ratios are divided by this number, so it's the foundation everything else is measured against.</div>
          <div class="onboarding-slider-field">
            <div class="onboarding-readout" data-readout="income">$150,000</div>
            <input type="range" id="onboarding-income" class="onboarding-slider" min="0" max="500000" step="10000" value="150000"/>
            <div class="onboarding-range-label"><span>$0</span><span>$500K+</span></div>
          </div>
        </div>

        <div class="onboarding-step" data-step="3">
          <div class="onboarding-title">What debts are you already carrying?</div>
          <div class="onboarding-subtitle">These count toward TDS on top of your housing costs. Credit cards and unsecured lines of credit are counted at <strong>3% of the balance</strong> per month, whether or not you pay them off.</div>
          <div class="onboarding-fields">
            <div class="onboarding-field">
              <label for="onboarding-car-loan">Car loan ($/mo)</label>
              <input type="number" id="onboarding-car-loan" min="0" step="1" value="300"/>
            </div>
            <div class="onboarding-field">
              <label for="onboarding-student-loan">Student loan ($/mo)</label>
              <input type="number" id="onboarding-student-loan" min="0" step="1" value="0"/>
            </div>
            <div class="onboarding-field">
              <label for="onboarding-other-loan">Other loans ($/mo)</label>
              <input type="number" id="onboarding-other-loan" min="0" step="1" value="0"/>
            </div>
            <div class="onboarding-field">
              <label for="onboarding-credit-card">Credit card balance ($)</label>
              <input type="number" id="onboarding-credit-card" min="0" step="1" value="0"/>
            </div>
          </div>
        </div>

        <div class="onboarding-step" data-step="4">
          <div class="onboarding-title">Now the home itself</div>
          <div class="onboarding-subtitle">Your <strong>loan amount</strong> drives the mortgage payment; property tax and heat are added straight into GDS.</div>
          <div class="onboarding-slider-field">
            <div class="onboarding-readout" data-readout="loan">$500,000</div>
            <input type="range" id="onboarding-loan-amount" class="onboarding-slider" min="0" max="1500000" step="10000" value="500000"/>
            <div class="onboarding-range-label"><span>$0</span><span>$1.5M+</span></div>
          </div>
          <div class="onboarding-fields onboarding-field-spaced">
            <div class="onboarding-field">
              <label for="onboarding-property-tax">Property tax ($/mo)</label>
              <input type="number" id="onboarding-property-tax" min="0" step="1" value="200"/>
            </div>
            <div class="onboarding-field">
              <label for="onboarding-heat">Heat ($/mo)</label>
              <input type="number" id="onboarding-heat" min="0" step="1" value="200"/>
            </div>
          </div>
          <div class="onboarding-note">Have condo fees? Only a portion counts toward GDS - 50% by default, adjustable in Advanced Settings.</div>
        </div>

        <div class="onboarding-step" data-step="5">
          <div class="onboarding-title">Why your ratios look worse than expected</div>
          <div class="onboarding-subtitle">By default this calculator stress-tests your mortgage, the same way a federally regulated lender must.</div>
          <div class="onboarding-note">
            <strong>The qualifying rate (B20):</strong> the higher of your contract rate + 2%, or 5.25%. Your ratios are calculated using that higher rate, not your actual rate - so your real payment is usually lower than what qualified you.
          </div>
        </div>

        <div class="onboarding-step" data-step="6">
          <div class="onboarding-title">You're set. Here's what to explore.</div>
          <div class="onboarding-note">
            <ul>
              <li><strong>Hover any label with a dotted underline</strong> to see exactly what it means.</li>
              <li><strong>"What You Qualify For"</strong> shows the largest mortgage your current numbers support at CMHC's limits.</li>
              <li><strong>"Ways to lower your ratios"</strong> gives real, one-click options if you're borderline or over.</li>
              <li><strong>"How this works"</strong> in the header opens a full spotlight tour any time.</li>
            </ul>
          </div>
        </div>

        <div class="onboarding-actions">
          <button type="button" class="onboarding-back">Back</button>
          <button type="button" class="onboarding-continue">Next</button>
        </div>
        <button type="button" class="onboarding-skip">Skip, I know my way around</button>
      </div>
    </div>
  `;

  const tourHTML = `
    <div class="tour-layer">
      <div class="tour-spotlight"></div>
      <div class="tour-card">
        <button type="button" class="tour-close" aria-label="Close tour">&times;</button>
        <div class="tour-step-count"></div>
        <div class="tour-title"></div>
        <div class="tour-text"></div>
        <div class="tour-why"></div>
        <div class="tour-actions">
          <button type="button" class="tour-back">Back</button>
          <button type="button" class="tour-next">Next</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading">
          <span>Debt Service Calculator</span>
          <button type="button" class="onboarding-reopen">How this works</button>
        </div>
        <div class="tab-layout">
          <div class="tab-content active">
            <div class="calculator-inputs">
              ${calculatorInputsHTML}
            </div>
            <div class="calculator-results debt-service-calculator-results">
              ${calculatorResultsHTML}
            </div>
          </div>
        </div>
        ${onboardingModalHTML}
        ${tourHTML}
    </div>
  `;

  type StressTestType = 'contract' | 'b20';
  type RentalIncomeMethod = 'offset' | 'add-back';

  const loanAmountInput = container.querySelector('.load-amount .value-input') as HTMLInputElement;
  const loanAmountInputSlider = container.querySelector('.load-amount .slider') as HTMLInputElement;
  const loanAmountErrorElement = container.querySelector('.load-amount .field-error') as HTMLElement;

  const grossAnnualIncomeInput = container.querySelector('.gross-annual-income .value-input') as HTMLInputElement;
  const grossAnnualIncomeInputSlider = container.querySelector('.gross-annual-income .slider') as HTMLInputElement;
  const grossAnnualIncomeErrorElement = container.querySelector('.gross-annual-income .field-error') as HTMLElement;

  const carLoanInput = container.querySelector('.car-loan-monthly .value-input') as HTMLInputElement;
  const carLoanErrorElement = container.querySelector('.car-loan-monthly .field-error') as HTMLElement;
  const studentLoanInput = container.querySelector('.student-loan-monthly .value-input') as HTMLInputElement;
  const studentLoanErrorElement = container.querySelector('.student-loan-monthly .field-error') as HTMLElement;
  const otherLoanInput = container.querySelector('.other-loan-monthly .value-input') as HTMLInputElement;
  const otherLoanErrorElement = container.querySelector('.other-loan-monthly .field-error') as HTMLElement;
  const creditCardBalanceInput = container.querySelector('.credit-card-balance .value-input') as HTMLInputElement;
  const creditCardBalanceErrorElement = container.querySelector('.credit-card-balance .field-error') as HTMLElement;
  const creditCardHelperElement = container.querySelector('.credit-card-balance .dsc-debt-helper') as HTMLElement;
  const lineOfCreditBalanceInput = container.querySelector('.line-of-credit-balance .value-input') as HTMLInputElement;
  const lineOfCreditBalanceErrorElement = container.querySelector('.line-of-credit-balance .field-error') as HTMLElement;
  const lineOfCreditHelperElement = container.querySelector('.line-of-credit-balance .dsc-debt-helper') as HTMLElement;
  const helocBalanceInput = container.querySelector('.heloc-balance .value-input') as HTMLInputElement;
  const helocBalanceErrorElement = container.querySelector('.heloc-balance .field-error') as HTMLElement;
  const helocRateInput = container.querySelector('.heloc-rate .value-input') as HTMLInputElement;
  const helocRateErrorElement = container.querySelector('.heloc-rate .field-error') as HTMLElement;
  const helocHelperElement = container.querySelector('.heloc-rate .dsc-debt-helper') as HTMLElement;
  const debtsTotalValueElement = container.querySelector('.dsc-debts-total strong') as HTMLElement;

  const homeExpenseMonthlyInput = container.querySelector('.home-expense-monthly .value-input') as HTMLInputElement;
  const homeExpenseYearlyInput = container.querySelector('.home-expense-yearly .value-input') as HTMLInputElement;
  const homeExpenseCondoFeesInput = container.querySelector('.home-expense-condo-fees .value-input') as HTMLInputElement;
  const homeExpenseHeatInput = container.querySelector('.home-expense-heat .value-input') as HTMLInputElement;
  const homeExpenseMonthlyErrorElement = container.querySelector('.home-expense-monthly .field-error') as HTMLElement;
  const homeExpenseYearlyErrorElement = container.querySelector('.home-expense-yearly .field-error') as HTMLElement;
  const homeExpenseCondoFeesErrorElement = container.querySelector('.home-expense-condo-fees .field-error') as HTMLElement;
  const homeExpenseHeatErrorElement = container.querySelector('.home-expense-heat .field-error') as HTMLElement;

  const addRentalIncomeExpandableElement = container.querySelector('.add-rental-income .expandable') as HTMLInputElement;
  const addRentalIncomeMonthlyInput = container.querySelector('.add-rental-income-monthly .value-input') as HTMLInputElement;
  const addRentalIncomeYearlyInput = container.querySelector('.add-rental-income-yearly .value-input') as HTMLInputElement;
  const addRentalIncomeMonthlyErrorElement = container.querySelector('.add-rental-income-monthly .field-error') as HTMLElement;
  const addRentalIncomeYearlyErrorElement = container.querySelector('.add-rental-income-yearly .field-error') as HTMLElement;

  const interestRateInput = container.querySelector('.rate .value-input') as HTMLInputElement;
  const interestRateInputSlider = container.querySelector('.rate .slider') as HTMLInputElement;
  const interestRateErrorElement = container.querySelector('.rate .field-error') as HTMLElement;

  const compoundingFrequencyValueElement = container.querySelector('.compounding .dropdown-field span') as HTMLInputElement;
  const condoFeeInclusionRateValueElement = container.querySelector('.condo-fee-inclusion-rate .dropdown-field span') as HTMLInputElement;
  const rentalIncomePortionRateValueElement = container.querySelector('.rental-income-portion .dropdown-field span') as HTMLInputElement;

  const amortizationInput = container.querySelector('.amortization .value-input') as HTMLInputElement;
  const amortizationInputSlider = container.querySelector('.amortization .slider') as HTMLInputElement;
  const amortizationErrorElement = container.querySelector('.amortization .field-error') as HTMLElement;

  // Verdict banner
  const verdictElement = container.querySelector('.dsc-verdict') as HTMLElement;
  const verdictHeadlineElement = container.querySelector('.dsc-verdict-headline') as HTMLElement;
  const verdictDetailElement = container.querySelector('.dsc-verdict-detail') as HTMLElement;

  // Gauges
  const gdsGaugeValueElement = container.querySelector('.dsc-gauge[data-metric="gds"] .dsc-gauge-value') as HTMLElement;
  const gdsGaugeFillElement = container.querySelector('.dsc-gauge[data-metric="gds"] .dsc-gauge-fill') as HTMLElement;
  const gdsGaugeTrackElement = container.querySelector('.dsc-gauge[data-metric="gds"] .dsc-gauge-track') as HTMLElement;
  const tdsGaugeValueElement = container.querySelector('.dsc-gauge[data-metric="tds"] .dsc-gauge-value') as HTMLElement;
  const tdsGaugeFillElement = container.querySelector('.dsc-gauge[data-metric="tds"] .dsc-gauge-fill') as HTMLElement;
  const tdsGaugeTrackElement = container.querySelector('.dsc-gauge[data-metric="tds"] .dsc-gauge-track') as HTMLElement;

  // Stress test panel
  const stressQualifyingRateValueElement = container.querySelector('.dsc-stress-col:nth-child(1) .dsc-stress-value') as HTMLElement;
  const stressQualifyingRateBadgeElement = container.querySelector('.dsc-stress-col:nth-child(1) .dsc-stress-badge') as HTMLElement;
  const stressQualifyingPaymentElement = container.querySelector('.dsc-stress-col:nth-child(1) .dsc-stress-payment') as HTMLElement;
  const stressYourRateValueElement = container.querySelector('.dsc-stress-col:nth-child(2) .dsc-stress-value') as HTMLElement;
  const stressYourPaymentElement = container.querySelector('.dsc-stress-col:nth-child(2) .dsc-stress-payment') as HTMLElement;
  const stressNoteElement = container.querySelector('.dsc-stress-note') as HTMLElement;

  // Monthly breakdown stacked bar
  const stackMortgageElement = container.querySelector('.dsc-stack-mortgage') as HTMLElement;
  const stackHomeElement = container.querySelector('.dsc-stack-home') as HTMLElement;
  const stackDebtsElement = container.querySelector('.dsc-stack-debts') as HTMLElement;
  const stackCashElement = container.querySelector('.dsc-stack-cash') as HTMLElement;
  const monthlyMortgageResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .monthly-mortgage .service-detail-value') as HTMLInputElement;
  const debtPaymentResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .debt-payment .service-detail-value') as HTMLInputElement;
  const homeExpenseSpanResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-name span') as HTMLInputElement;
  const homeExpenseResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-value') as HTMLInputElement;
  const cashLeftResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .cash-left .service-detail-value') as HTMLInputElement;

  const qualifyMaxMortgageValueElement = container.querySelector('.dsc-qualify-item:nth-child(1) .dsc-qualify-value') as HTMLElement;
  const qualifyMinIncomeValueElement = container.querySelector('.dsc-qualify-item:nth-child(2) .dsc-qualify-value') as HTMLElement;
  const qualifyRoomValueElement = container.querySelector('.dsc-qualify-item:nth-child(3) .dsc-qualify-value') as HTMLElement;
  const qualifyNoteElement = container.querySelector('.dsc-qualify-note') as HTMLElement;

  // Ways to lower your ratios
  const waysToSaveElement = container.querySelector('.ways-to-save') as HTMLElement;
  const waysToSaveListElement = container.querySelector('.ways-to-save-list') as HTMLElement;
  const waysToSaveIntroElement = container.querySelector('.ways-to-save-intro') as HTMLElement;

  const debtServiceRateSelectorElements = container.querySelectorAll('.debt-service-rate .btn-group-selector .selector');
  const stressTestRuleSelectorElements = container.querySelectorAll('.stress-test-rule .btn-group-selector .selector');
  const rentalIncomeRuleSelectorElements = container.querySelectorAll('.rental-income-rule .btn-group-selector .selector');

  const addRentalIncomeToggleSelectorElements = container.querySelectorAll('.add-rental-income .opt');

  const tooltipElements = container.querySelectorAll("[data-tooltip]");

  const dropdownOpts = container.querySelectorAll('.dropdown-opt');
  dropdownOpts.forEach(dropdownOpt => {
    dropdownOpt.addEventListener('click', () => {
      const prevEl = dropdownOpt.parentElement?.previousElementSibling;
      const span = prevEl?.querySelector('span');

      if (span) {
        span.textContent = dropdownOpt.textContent;
      }

      dropdownOpt.parentElement?.classList.remove("expanded");
      prevEl?.classList.remove('dropdown-expanded');
      updateResults();
    });
  });

  container.querySelectorAll('.dropdown-field').forEach(field => {
    field.addEventListener('click', (e) => {
      e.stopPropagation();
      const expandedDropdownElement = (e.target as HTMLElement)?.closest('.dropdown-expanded');
      if (expandedDropdownElement) {
        container.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
          opt.previousElementSibling?.classList.remove('dropdown-expanded');
          opt.classList.remove('expanded');
        });
      } else {
        container.querySelectorAll('.dropdown-field.dropdown-expanded').forEach(dropdown => {
          dropdown.classList.remove('dropdown-expanded');
        });
        container.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
          opt.classList.remove('expanded');
        });

        const opts = field.nextElementSibling as HTMLElement;
        opts?.classList.toggle('expanded');

        if (opts?.classList.contains('expanded') && opts.previousElementSibling) {
          opts.style.top = `${opts.previousElementSibling.clientHeight + 5}px`;
          field.classList.add('dropdown-expanded');
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (!target.closest('.dropdown')) {
      container.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
        opt.previousElementSibling?.classList.remove('dropdown-expanded');
        opt.classList.remove('expanded');
      });
    }
  });

  debtServiceRateSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      debtServiceRateSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  stressTestRuleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      stressTestRuleSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  rentalIncomeRuleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      rentalIncomeRuleSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  addRentalIncomeToggleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      const prevValue = (container.querySelector('.title-toggle-wrapper .toggle .selected') as HTMLElement)?.dataset?.value;
      const newValue = prevValue === 'off' ? 'on' : 'off';

      addRentalIncomeToggleSelectorElements.forEach(h => h.classList.remove('selected'));

      if (newValue === 'on') {
        (container.querySelector('.title-toggle-wrapper .toggle .on') as HTMLElement).classList.add('selected');
      } else {
        (container.querySelector('.title-toggle-wrapper .toggle .off') as HTMLElement).classList.add('selected');
      }

      selector.parentElement?.classList.remove('switched-on');
      selector.parentElement?.parentElement?.parentElement?.nextElementSibling?.classList.remove('expanded');

      if (newValue === 'on') {
        selector.parentElement?.classList.add('switched-on');
        selector.parentElement?.parentElement?.parentElement?.nextElementSibling?.classList.add('expanded');
      } else {
        addRentalIncomeMonthlyInput.value = '$  0';
        addRentalIncomeMonthlyInput.dataset.previousValue = '0';

        addRentalIncomeYearlyInput.value = '$  0';
        addRentalIncomeYearlyInput.dataset.previousValue = '0';
      }

      updateResults();
    });
  });

  tooltipElements.forEach(el => {
    const tooltipText = el.getAttribute("data-tooltip");

    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip mortgage-calculator-tooltip";
    tooltip.textContent = tooltipText;
    document.body.appendChild(tooltip);

    el.addEventListener("mousemove", (e) => {
      const event = e as MouseEvent;
      tooltip.style.top = `${event.pageY + 20}px`;
      tooltip.style.left = `${(event.pageX - (tooltip.clientWidth / 2))}px`;
    });

    el.addEventListener("mouseenter", (e) => {
      tooltip.style.opacity = "1";
      tooltip.style.pointerEvents = "none";
    });

    el.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
  });

  function updateSliderBackground(slider: HTMLInputElement) {
    const value = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const percent = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #1A4383 ${percent}%, #1A43832f ${percent}%)`;
  }

  loanAmountInputSlider.addEventListener("input", () => {
    const inputValue = loanAmountInputSlider.value.replace(/[^0-9.]/g, '');
    loanAmountInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    loanAmountInput.dataset.previousValue = inputValue;
    updateSliderBackground(loanAmountInputSlider);
    if (loanAmountErrorElement) loanAmountErrorElement.textContent = '';
    updateResults();
  });

  grossAnnualIncomeInputSlider.addEventListener("input", () => {
    const inputValue = grossAnnualIncomeInputSlider.value.replace(/[^0-9.]/g, '');
    grossAnnualIncomeInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    grossAnnualIncomeInput.dataset.previousValue = inputValue;
    updateSliderBackground(grossAnnualIncomeInputSlider);
    if (grossAnnualIncomeErrorElement) grossAnnualIncomeErrorElement.textContent = '';
    updateResults();
  });

  interestRateInputSlider.addEventListener("input", () => {
    const inputValue = interestRateInputSlider.value.replace(/[^0-9.]/g, '');
    interestRateInput.value = inputValue ? `${parseFloat(inputValue).toFixed(2)}%` : '';
    interestRateInput.dataset.previousValue = inputValue;
    updateSliderBackground(interestRateInputSlider);
    if (interestRateErrorElement) interestRateErrorElement.textContent = '';
    updateResults();
  });

  amortizationInputSlider.addEventListener("input", () => {
    const inputValue = amortizationInputSlider.value.replace(/[^0-9.]/g, '');
    amortizationInput.value = inputValue ? `${parseInt(inputValue).toLocaleString('en-US')} Years` : '';
    amortizationInput.dataset.previousValue = inputValue;
    updateSliderBackground(amortizationInputSlider);
    if (amortizationErrorElement) amortizationErrorElement.textContent = '';
    updateResults();
  });

  // Sanitizes to digits, a single leading minus sign, and a single decimal point - the
  // previous `value.replace(/[^0-9.]/g, '')` + parseInt silently dropped a leading minus
  // (so "-500" became 500) and truncated decimals (parseInt ignores everything after the
  // integer part). Uses parseFloat and requires Number.isFinite before accepting, and shows a
  // per-field error message instead of silently reverting when the input isn't valid.
  const formatInput = (
    inputElement: HTMLInputElement,
    symbol: string,
    type: string,
    errorElement?: HTMLElement,
    errorMessage?: string
  ) => {
    const showError = () => { if (errorElement) errorElement.textContent = errorMessage ?? 'Enter a valid amount.'; };
    const clearError = () => { if (errorElement) errorElement.textContent = ''; };

    inputElement.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target) {
        let value = target.value.replace(/[^0-9.\-]/g, '');
        value = value.replace(/(?!^)-/g, ''); // only a leading '-' survives
        const firstDotIndex = value.indexOf('.');
        if (firstDotIndex !== -1) {
          value = value.slice(0, firstDotIndex + 1) + value.slice(firstDotIndex + 1).replace(/\./g, '');
        }
        const isParseable = value !== '' && value !== '-' && value !== '.' && value !== '-.';
        const parsed = isParseable ? parseFloat(value) : NaN;
        const numericValue = Number.isFinite(parsed) ? parsed : NaN;
        const isValid = Number.isFinite(numericValue);

        switch (type) {
          case "loan-amount":
            if (isValid && 0 <= numericValue) {
              const roundedValue = Math.round(numericValue);
              loanAmountInputSlider.value = roundedValue.toString();
              updateSliderBackground(loanAmountInputSlider);
              target.value = `${symbol}  ${roundedValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = roundedValue.toString();
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
              showError();
            }
            break;

          case "gross-annual-income":
            if (isValid && 0 <= numericValue) {
              const roundedValue = Math.round(numericValue);
              grossAnnualIncomeInputSlider.value = roundedValue.toString();
              updateSliderBackground(grossAnnualIncomeInputSlider);
              target.value = `${symbol}  ${roundedValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = roundedValue.toString();
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
              showError();
            }
            break;

          // Itemized debt/balance fields - integers, >= 0, no upper bound.
          case "car-loan-monthly":
          case "student-loan-monthly":
          case "other-loan-monthly":
          case "credit-card-balance":
          case "line-of-credit-balance":
          case "heloc-balance":
            if (isValid && 0 <= numericValue) {
              const roundedValue = Math.round(numericValue);
              target.value = `${symbol}  ${roundedValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = roundedValue.toString();
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
              showError();
            }
            break;

          // HELOC rate - text-only, default 7.00%, 2 decimals, 0-25%.
          case "heloc-rate":
            if (isValid && 0 <= numericValue && numericValue <= 25) {
              target.value = `${numericValue.toFixed(2)}%`;
              target.dataset.previousValue = numericValue.toFixed(2);
              clearError();
            } else {
              const previous = target.dataset.previousValue ? parseFloat(target.dataset.previousValue) : 7.00;
              target.value = `${previous.toFixed(2)}%`;
              showError();
            }
            break;

          case "home-expense-monthly":
          case "home-expense-yearly":
          case "home-expense-condo-fees":
          case "home-expense-heat":
          case "add-rental-income-monthly":
          case "add-rental-income-yearly":
            if (isValid && 0 <= numericValue) {
              const roundedValue = Math.round(numericValue);
              target.value = `${symbol}  ${roundedValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = roundedValue.toString();
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
              showError();
            }

            if (type === "home-expense-monthly") {
              const prevValueStr = target.dataset.previousValue;
              const prevValue = prevValueStr ? parseInt(prevValueStr) : 0;
              const rawYearlyValue = prevValue * 12;

              homeExpenseYearlyInput.value = `${symbol} ${rawYearlyValue.toLocaleString('en-US')}`;
              homeExpenseYearlyInput.dataset.previousValue = rawYearlyValue.toString();
            } else if (type === "home-expense-yearly") {
              const prevValueStr = target.dataset.previousValue;
              const prevValue = prevValueStr ? parseInt(prevValueStr) : 0;
              const rawMonthlyValue = prevValue / 12;

              homeExpenseMonthlyInput.value = `${symbol} ${rawMonthlyValue.toLocaleString('en-US')}`;
              homeExpenseMonthlyInput.dataset.previousValue = rawMonthlyValue.toString();
            } else if (type === "add-rental-income-monthly") {
              const prevValueStr = target.dataset.previousValue;
              const prevValue = prevValueStr ? parseInt(prevValueStr) : 0;
              const rawYearlyValue = prevValue * 12;

              addRentalIncomeYearlyInput.value = `${symbol} ${rawYearlyValue.toLocaleString('en-US')}`;
              addRentalIncomeYearlyInput.dataset.previousValue = rawYearlyValue.toString();
            } else if (type === "add-rental-income-yearly") {
              const prevValueStr = target.dataset.previousValue;
              const prevValue = prevValueStr ? parseInt(prevValueStr) : 0;
              const rawMonthlyValue = prevValue / 12;

              addRentalIncomeMonthlyInput.value = `${symbol} ${rawMonthlyValue.toLocaleString('en-US')}`;
              addRentalIncomeMonthlyInput.dataset.previousValue = rawMonthlyValue.toString();
            }
            break;

          case "interest-rate":
            if (isValid && 0.1 <= numericValue && numericValue <= 10) {
              interestRateInputSlider.value = numericValue.toFixed(2);
              updateSliderBackground(interestRateInputSlider);
              target.value = `${numericValue.toFixed(2)}%`;
              target.dataset.previousValue = numericValue.toFixed(2);
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${parseFloat(target.dataset.previousValue).toFixed(2)}%`;
              showError();
            }
            break;

          case "amortization-period":
            if (isValid && 5 <= numericValue && numericValue <= 30) {
              const roundedValue = Math.round(numericValue);
              amortizationInputSlider.value = roundedValue.toString();
              updateSliderBackground(amortizationInputSlider);
              target.value = `${roundedValue.toLocaleString('en-US')} ${symbol}`;
              target.dataset.previousValue = roundedValue.toString();
              clearError();
            } else {
              if (target.dataset.previousValue) target.value = `${parseInt(target.dataset.previousValue).toLocaleString('en-US')} ${symbol}`;
              showError();
            }
            break;

          default:
            break;
        }
        updateResults();
      }
    });
  };

  function isStressTestType(value: string): value is StressTestType {
    return value === 'contract' || value === 'b20';
  }

  function isRentalIncomeMethod(value: string): value is RentalIncomeMethod {
    return value === 'offset' || value === 'add-back';
  }

  function getActiveLoanType(): LoanType {
    const activeEl = container.querySelector(".debt-service-rate .btn-group-selector .active") as HTMLElement | null;
    return activeEl?.textContent?.trim().toLowerCase() === 'interest only' ? 'interest-only' : 'regular';
  }

  function getDebtItems(): DebtItems {
    const num = (el: HTMLInputElement, fallback: number) => el.dataset.previousValue ? parseFloat(el.dataset.previousValue) : fallback;
    return {
      carLoanMonthly: num(carLoanInput, 300),
      studentLoanMonthly: num(studentLoanInput, 0),
      otherLoanMonthly: num(otherLoanInput, 0),
      creditCardBalance: num(creditCardBalanceInput, 0),
      lineOfCreditBalance: num(lineOfCreditBalanceInput, 0),
      helocBalance: num(helocBalanceInput, 0),
      helocRate: num(helocRateInput, 7.00),
    };
  }

  const GAUGE_SCALE_MAX = 60;

  function renderGauge(
    fillEl: HTMLElement, trackEl: HTMLElement, valueEl: HTMLElement,
    ratio: number, hasValidIncome: boolean, level: RatioStatusLevel | null
  ) {
    if (!hasValidIncome) {
      valueEl.textContent = 'N/A';
      fillEl.style.width = '0%';
      fillEl.style.background = '#E3E5DD';
      trackEl.removeAttribute('aria-valuenow');
      return;
    }
    valueEl.textContent = `${ratio.toFixed(2)}%`;
    const percentOfScale = Math.max(0, Math.min(100, (ratio / GAUGE_SCALE_MAX) * 100));
    fillEl.style.width = `${percentOfScale}%`;
    fillEl.style.background = level === 'within' ? '#15803d' : level === 'borderline' ? '#b45309' : '#c92a2a';
    trackEl.setAttribute('aria-valuenow', ratio.toFixed(2));
  }

  const updateResults = () => {
    const loanAmountValue = loanAmountInput.dataset.previousValue ? parseInt(loanAmountInput.dataset.previousValue) : 0;
    const grossAnnualIncomeValue = grossAnnualIncomeInput.dataset.previousValue ? parseInt(grossAnnualIncomeInput.dataset.previousValue) : 0;
    const debtItems = getDebtItems();
    const debtObligations: DebtObligations = calculateDebtObligations(debtItems);
    const monthlyDebtPaymentsValue = debtObligations.total;

    // Live debt helper text (3% revolving rule / HELOC amortized payment).
    if (creditCardHelperElement) {
      creditCardHelperElement.textContent = `counts as ${formatCurrencyDetailed(debtObligations.creditCard)}/mo (${(REVOLVING_MIN_PAYMENT_RATE * 100).toFixed(0)}%)`;
    }
    if (lineOfCreditHelperElement) {
      lineOfCreditHelperElement.textContent = `counts as ${formatCurrencyDetailed(debtObligations.lineOfCredit)}/mo (${(REVOLVING_MIN_PAYMENT_RATE * 100).toFixed(0)}%)`;
    }
    if (helocHelperElement) {
      helocHelperElement.textContent = `counts as ${formatCurrencyDetailed(debtObligations.heloc)}/mo (${HELOC_QUALIFYING_AMORTIZATION_YEARS}-yr amortized)`;
    }
    if (debtsTotalValueElement) {
      debtsTotalValueElement.textContent = `${formatCurrencyDetailed(debtObligations.total)}/mo`;
    }
    const propertTaxMonthlyValue = homeExpenseMonthlyInput.dataset.previousValue ? parseFloat(parseFloat(homeExpenseMonthlyInput.dataset.previousValue).toFixed(2)) : 0;
    const condoFeesValue = homeExpenseCondoFeesInput.dataset.previousValue ? parseInt(homeExpenseCondoFeesInput.dataset.previousValue) : 0;
    const heatingCostValue = homeExpenseHeatInput.dataset.previousValue ? parseInt(homeExpenseHeatInput.dataset.previousValue) : 0;
    const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
    const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 5;
    const rentalIncomeMonthlyValue = addRentalIncomeMonthlyInput.dataset.previousValue ? parseInt(addRentalIncomeMonthlyInput.dataset.previousValue) : 0;

    const compoundingFrequencyValue = compoundingFrequencyValueElement.textContent ? compoundingFrequencyValueElement.textContent.toLowerCase() : "semi-annual";
    const stressTestRate = 5.25;
    const condoFeeInclusionRateValue = condoFeeInclusionRateValueElement.textContent ? parseInt(condoFeeInclusionRateValueElement.textContent.replace("%", "")) : 50;
    const rentalIncomePortionRateValue = rentalIncomePortionRateValueElement.textContent ? parseInt(rentalIncomePortionRateValueElement.textContent.replace("%", "")) : 50;

    const stressTestTypeActiveElement = container.querySelector(".stress-test-rule .btn-group-selector .active") as HTMLInputElement;
    const rentalIncomeMethodActiveElement = container.querySelector(".rental-income-rule .btn-group-selector .active") as HTMLInputElement;

    const rawStressTest = stressTestTypeActiveElement.textContent?.toLowerCase() || 'contract';
    const stressTestTypeValue: StressTestType = isStressTestType(rawStressTest) ? rawStressTest : 'contract';

    const rawRentalMethod = rentalIncomeMethodActiveElement.textContent?.toLowerCase().replace(" ", "-") || 'offset';
    const rentalIncomeMethodValue: RentalIncomeMethod = isRentalIncomeMethod(rawRentalMethod) ? rawRentalMethod : 'offset';

    const inputData: any = {
      mortgageAmount: loanAmountValue,
      grossAnnualIncome: grossAnnualIncomeValue,
      monthlyDebtPayments: monthlyDebtPaymentsValue,
      propertyTaxMonthly: propertTaxMonthlyValue,
      condoFees: condoFeesValue,
      heatingCost: heatingCostValue,
      interestRate: interestRateValue,
      amortizationYears: amortizationValue,
      isRentalIncomeEnabled: addRentalIncomeExpandableElement.classList.contains("expanded"),
      rentalIncomeMonthly: rentalIncomeMonthlyValue,
    };
    const resultObj = calculateAllRatios(inputData, compoundingFrequencyValue, stressTestRate, condoFeeInclusionRateValue, rentalIncomePortionRateValue, stressTestTypeValue, rentalIncomeMethodValue, getActiveLoanType());

    const hasValidIncome = grossAnnualIncomeValue > 0;
    const isB20 = stressTestTypeValue === "b20";
    const displayedGds = isB20 ? resultObj.stressTestGDS : resultObj.gdsRatio;
    const displayedTds = isB20 ? resultObj.stressTestTDS : resultObj.tdsRatio;
    const status = hasValidIncome ? getRatioStatus(displayedGds, displayedTds) : null;

    // Verdict banner
    if (!hasValidIncome) {
      verdictElement.dataset.level = 'neutral';
      verdictHeadlineElement.textContent = 'Enter your income to see your ratios';
      verdictDetailElement.textContent = 'GDS and TDS are both measured against your gross income, so we need that first.';
    } else if (status) {
      verdictElement.dataset.level = status.level;
      verdictHeadlineElement.textContent = status.headline;
      verdictDetailElement.textContent = status.detail;
    }

    // Gauges. GDS/TDS each have their own tier coloring based on their own thresholds, not the
    // combined verdict level - a ratio that's individually fine shouldn't render red just
    // because the OTHER ratio is over.
    const gdsLevel: RatioStatusLevel = displayedGds <= PREFERRED_LIMITS.gds ? 'within' : displayedGds <= MAX_LIMITS.gds ? 'borderline' : 'over';
    const tdsLevel: RatioStatusLevel = displayedTds <= PREFERRED_LIMITS.tds ? 'within' : displayedTds <= MAX_LIMITS.tds ? 'borderline' : 'over';
    renderGauge(gdsGaugeFillElement, gdsGaugeTrackElement, gdsGaugeValueElement, displayedGds, hasValidIncome, gdsLevel);
    renderGauge(tdsGaugeFillElement, tdsGaugeTrackElement, tdsGaugeValueElement, displayedTds, hasValidIncome, tdsLevel);

    // Stress test panel
    stressQualifyingRateBadgeElement.textContent = stressTestTypeValue.toUpperCase();
    stressQualifyingRateValueElement.textContent = `${resultObj.stressTestRate.toFixed(2)}%`;
    stressQualifyingPaymentElement.textContent = `${formatCurrencyDetailed(resultObj.stressTestMonthlyPayment)}/mo`;
    stressYourRateValueElement.textContent = `${inputData.interestRate.toFixed(2)}%`;
    stressYourPaymentElement.textContent = `${formatCurrencyDetailed(resultObj.monthlyMortgagePayment)}/mo`;
    stressNoteElement.textContent = isB20
      ? 'Your ratios above use the qualifying rate, not your actual rate.'
      : "Contract mode isn't a real stress test - it shows your ratios at your actual rate, not a lender's qualifying rate.";

    monthlyMortgageResultsElement.textContent = formatCurrencyDetailed(resultObj.monthlyMortgagePayment);
    debtPaymentResultsElement.textContent = formatCurrencyDetailed(inputData.monthlyDebtPayments);
    homeExpenseSpanResultsElement.style.display = rentalIncomeMethodValue.toLowerCase() === "offset" ? "unset" : "none";
    homeExpenseResultsElement.textContent = formatCurrencyDetailed(resultObj.adjustedHomeExpenses);
    cashLeftResultsElement.textContent = formatCurrencyDetailed(resultObj.cashLeftGross);

    // Stacked bar mirrors the four rows directly above it - proportional visualisation only,
    // not a re-derivation, so it always agrees with what's printed in the rows.
    const barMortgage = Math.max(0, resultObj.monthlyMortgagePayment);
    const barHome = Math.max(0, resultObj.adjustedHomeExpenses);
    const barDebts = Math.max(0, inputData.monthlyDebtPayments);
    const barCash = Math.max(0, resultObj.cashLeftGross);
    const barTotal = barMortgage + barHome + barDebts + barCash;
    const pct = (v: number) => barTotal > 0 ? `${(v / barTotal) * 100}%` : '0%';
    stackMortgageElement.style.width = pct(barMortgage);
    stackHomeElement.style.width = pct(barHome);
    stackDebtsElement.style.width = pct(barDebts);
    stackCashElement.style.width = pct(barCash);

    // "What You Qualify For" - max mortgage / required income / monthly room at CMHC's maximum
    // GDS/TDS limits. Always computed with the regular/amortizing formula internally
    // (calculateQualification's own policy), independent of the Regular/Interest Only toggle.
    const loanTypeValue = getActiveLoanType();
    const qualificationSettings: DebtServiceSettings = {
      compoundingFrequency: compoundingFrequencyValue,
      condoFeeInclusionRate: condoFeeInclusionRateValue,
      rentalIncomePortionRate: rentalIncomePortionRateValue,
      stressTestType: stressTestTypeValue,
      rentalIncomeMethod: rentalIncomeMethodValue,
      loanType: loanTypeValue,
      benchmarkStressRate: B20_BENCHMARK_RATE,
    };
    const qualification: QualificationResult = calculateQualification(inputData, qualificationSettings, MAX_LIMITS);
    if (grossAnnualIncomeValue > 0) {
      qualifyMaxMortgageValueElement.textContent = `$${Math.round(qualification.maxMortgage).toLocaleString('en-US')}`;
      qualifyMinIncomeValueElement.textContent = `$${Math.round(qualification.requiredAnnualIncome).toLocaleString('en-US')}/yr`;
      const roomTds = qualification.monthlyRoomTds;
      qualifyRoomValueElement.textContent = `${roomTds < 0 ? '-' : ''}${formatCurrencyDetailed(Math.abs(roomTds))}/mo`;
    } else {
      qualifyMaxMortgageValueElement.textContent = '—';
      qualifyMinIncomeValueElement.textContent = '—';
      qualifyRoomValueElement.textContent = '—';
    }
    qualifyNoteElement.textContent = loanTypeValue === 'interest-only'
      ? 'Qualification uses a regular amortizing payment, even though Interest Only is selected above.'
      : '';

    // Ways to lower your ratios
    const improvements: RatioImprovement[] = hasValidIncome ? suggestRatioImprovements(inputData, debtItems, qualificationSettings) : [];
    renderWaysToSave(improvements, status?.level ?? null, hasValidIncome);
  }

  function renderWaysToSave(improvements: RatioImprovement[], currentLevel: RatioStatusLevel | null, hasValidIncome: boolean) {
    if (!waysToSaveElement) return;

    if (!hasValidIncome) {
      waysToSaveElement.style.display = 'none';
      return;
    }

    if (!improvements.length) {
      if (currentLevel === 'within') {
        waysToSaveElement.style.display = 'unset';
        waysToSaveIntroElement.textContent = "You're within lender guidelines - no changes needed right now.";
        waysToSaveListElement.innerHTML = '';
      } else {
        waysToSaveElement.style.display = 'none';
      }
      return;
    }

    waysToSaveElement.style.display = 'unset';
    waysToSaveIntroElement.textContent = `Based on your numbers, here ${improvements.length === 1 ? 'is 1 option' : `are ${improvements.length} options`} that would improve your ratios.`;

    waysToSaveListElement.innerHTML = '';
    improvements.forEach(item => {
      const row = document.createElement('div');
      row.className = 'way-to-save';

      const info = document.createElement('div');
      info.className = 'way-to-save-info';

      const label = document.createElement('div');
      label.className = 'way-to-save-label';
      label.textContent = item.title;

      const detail = document.createElement('div');
      detail.className = 'way-to-save-detail';
      detail.textContent = item.description;

      const impact = document.createElement('div');
      // dsc-impact-<level> lets the delta line's colour reflect the RESULTING tier (still
      // over/borderline/within after applying this suggestion) rather than a blanket "green
      // means improvement" - a suggestion that only takes someone from over to borderline
      // shouldn't render the same reassuring green as one that gets them fully within.
      impact.className = `way-to-save-impact dsc-impact-${item.newLevel}`;
      const newHeadline = getRatioStatus(item.newGds, item.newTds).headline;
      impact.textContent = `GDS ${item.newGds.toFixed(2)}% · TDS ${item.newTds.toFixed(2)}% — ${newHeadline}`;

      info.appendChild(label);
      info.appendChild(detail);
      info.appendChild(impact);

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.className = 'way-to-save-apply';
      applyButton.textContent = 'Apply';
      // Guard against a real race: if a debt/home-expense field still has focus when this
      // button is clicked, the mousedown's default focus change blurs that field first, which
      // synchronously fires its 'change' handler -> updateResults() -> re-renders this very
      // list, replacing this button with a new element *before* the click event would
      // otherwise fire on it - so the click silently never registers. Preventing the
      // mousedown's default action stops it from stealing focus (and triggering that
      // synchronous rebuild) before the click completes.
      applyButton.addEventListener('mousedown', (e) => e.preventDefault());
      applyButton.addEventListener('click', () => applyImprovementPatch(item.patch));

      row.appendChild(info);
      row.appendChild(applyButton);
      waysToSaveListElement.appendChild(row);
    });
  }

  const debtInputBySettingsKey: Record<keyof DebtItems, HTMLInputElement> = {
    carLoanMonthly: carLoanInput,
    studentLoanMonthly: studentLoanInput,
    otherLoanMonthly: otherLoanInput,
    creditCardBalance: creditCardBalanceInput,
    lineOfCreditBalance: lineOfCreditBalanceInput,
    helocBalance: helocBalanceInput,
    helocRate: helocRateInput,
  };

  function applyImprovementPatch(patch: ImprovementPatch) {
    if (patch.debts) {
      (Object.keys(patch.debts) as (keyof DebtItems)[]).forEach(key => {
        const value = patch.debts![key];
        if (value === undefined) return;
        const input = debtInputBySettingsKey[key];
        if (!input) return;
        if (key === 'helocRate') {
          input.value = `${value.toFixed(2)}%`;
        } else {
          input.value = `$  ${Math.round(value).toLocaleString('en-US')}`;
        }
        input.dataset.previousValue = key === 'helocRate' ? value.toFixed(2) : Math.round(value).toString();
      });
    }
    if (patch.amortizationYears !== undefined) {
      amortizationInputSlider.value = String(Math.max(5, Math.min(30, patch.amortizationYears)));
      amortizationInputSlider.dispatchEvent(new Event('input'));
    }
    if (patch.mortgageAmount !== undefined) {
      loanAmountInputSlider.value = String(Math.max(0, Math.min(1500000, Math.round(patch.mortgageAmount))));
      loanAmountInputSlider.dispatchEvent(new Event('input'));
    }
    updateResults();
  }

  formatInput(loanAmountInput, '$', 'loan-amount', loanAmountErrorElement, 'Enter an amount of $0 or more.');
  updateSliderBackground(loanAmountInputSlider);

  formatInput(grossAnnualIncomeInput, '$', 'gross-annual-income', grossAnnualIncomeErrorElement, 'Enter an amount of $0 or more.');
  updateSliderBackground(grossAnnualIncomeInputSlider);

  formatInput(carLoanInput, '$', 'car-loan-monthly', carLoanErrorElement, 'Enter an amount of $0 or more.');
  formatInput(studentLoanInput, '$', 'student-loan-monthly', studentLoanErrorElement, 'Enter an amount of $0 or more.');
  formatInput(otherLoanInput, '$', 'other-loan-monthly', otherLoanErrorElement, 'Enter an amount of $0 or more.');
  formatInput(creditCardBalanceInput, '$', 'credit-card-balance', creditCardBalanceErrorElement, 'Enter an amount of $0 or more.');
  formatInput(lineOfCreditBalanceInput, '$', 'line-of-credit-balance', lineOfCreditBalanceErrorElement, 'Enter an amount of $0 or more.');
  formatInput(helocBalanceInput, '$', 'heloc-balance', helocBalanceErrorElement, 'Enter an amount of $0 or more.');
  formatInput(helocRateInput, '%', 'heloc-rate', helocRateErrorElement, 'Enter a rate between 0% and 25%.');

  formatInput(homeExpenseMonthlyInput, '$', 'home-expense-monthly', homeExpenseMonthlyErrorElement, 'Enter an amount of $0 or more.');
  formatInput(homeExpenseYearlyInput, '$', 'home-expense-yearly', homeExpenseYearlyErrorElement, 'Enter an amount of $0 or more.');
  formatInput(homeExpenseCondoFeesInput, '$', 'home-expense-condo-fees', homeExpenseCondoFeesErrorElement, 'Enter an amount of $0 or more.');
  formatInput(homeExpenseHeatInput, '$', 'home-expense-heat', homeExpenseHeatErrorElement, 'Enter an amount of $0 or more.');
  formatInput(addRentalIncomeMonthlyInput, '$', 'add-rental-income-monthly', addRentalIncomeMonthlyErrorElement, 'Enter an amount of $0 or more.');
  formatInput(addRentalIncomeYearlyInput, '$', 'add-rental-income-yearly', addRentalIncomeYearlyErrorElement, 'Enter an amount of $0 or more.');


  formatInput(interestRateInput, '%', 'interest-rate', interestRateErrorElement, 'Enter a rate between 0.1% and 10%.');
  updateSliderBackground(interestRateInputSlider);

  formatInput(amortizationInput, 'Years', 'amortization-period', amortizationErrorElement, 'Enter a term between 5 and 30 years.');
  updateSliderBackground(amortizationInputSlider);

  // ---------------------------------------------------------------------
  // Onboarding (first-visit walkthrough)
  // ---------------------------------------------------------------------

  const ONBOARDING_STORAGE_KEY = 'debtServiceCalculatorOnboardingSeen';
  const TOTAL_ONBOARDING_STEPS = 6;

  const onboardingOverlay = container.querySelector('.onboarding-overlay') as HTMLElement;
  const onboardingIncomeInput = container.querySelector('#onboarding-income') as HTMLInputElement;
  const onboardingCarLoanInput = container.querySelector('#onboarding-car-loan') as HTMLInputElement;
  const onboardingStudentLoanInput = container.querySelector('#onboarding-student-loan') as HTMLInputElement;
  const onboardingOtherLoanInput = container.querySelector('#onboarding-other-loan') as HTMLInputElement;
  const onboardingCreditCardInput = container.querySelector('#onboarding-credit-card') as HTMLInputElement;
  const onboardingLoanAmountInput = container.querySelector('#onboarding-loan-amount') as HTMLInputElement;
  const onboardingPropertyTaxInput = container.querySelector('#onboarding-property-tax') as HTMLInputElement;
  const onboardingHeatInput = container.querySelector('#onboarding-heat') as HTMLInputElement;
  const onboardingContinueButton = container.querySelector('.onboarding-continue') as HTMLElement;
  const onboardingBackButton = container.querySelector('.onboarding-back') as HTMLElement;
  const onboardingSkipButton = container.querySelector('.onboarding-skip') as HTMLElement;
  const onboardingReopenButton = container.querySelector('.onboarding-reopen') as HTMLElement;
  const onboardingSteps = container.querySelectorAll('.onboarding-step');
  const onboardingDots = container.querySelectorAll('.onboarding-progress .dot');

  let currentOnboardingStep = 1;

  const renderOnboardingStep = () => {
    onboardingSteps.forEach(step => {
      const stepNumber = Number((step as HTMLElement).dataset.step);
      (step as HTMLElement).style.display = stepNumber === currentOnboardingStep ? 'block' : 'none';
    });
    onboardingDots.forEach(dot => {
      const dotNumber = Number((dot as HTMLElement).dataset.dot);
      dot.classList.toggle('active', dotNumber === currentOnboardingStep);
      dot.classList.toggle('done', dotNumber < currentOnboardingStep);
    });
    onboardingBackButton.style.visibility = currentOnboardingStep === 1 ? 'hidden' : 'visible';
    onboardingContinueButton.textContent =
      currentOnboardingStep === TOTAL_ONBOARDING_STEPS ? 'See my results'
        : currentOnboardingStep === 1 ? "Let's go"
          : 'Next';
  };

  const onboardingIncomeReadout = container.querySelector('[data-readout="income"]') as HTMLElement;
  const onboardingLoanReadout = container.querySelector('[data-readout="loan"]') as HTMLElement;

  const renderOnboardingReadouts = () => {
    if (onboardingIncomeReadout) {
      onboardingIncomeReadout.textContent = `$${Number(onboardingIncomeInput.value).toLocaleString('en-US')}`;
    }
    if (onboardingLoanReadout) {
      onboardingLoanReadout.textContent = `$${Number(onboardingLoanAmountInput.value).toLocaleString('en-US')}`;
    }
    updateSliderBackground(onboardingIncomeInput);
    updateSliderBackground(onboardingLoanAmountInput);
  };

  [onboardingIncomeInput, onboardingLoanAmountInput].forEach(slider => {
    slider?.addEventListener('input', renderOnboardingReadouts);
  });

  const applyOnboardingValues = () => {
    grossAnnualIncomeInputSlider.value = onboardingIncomeInput.value;
    grossAnnualIncomeInputSlider.dispatchEvent(new Event('input'));

    loanAmountInputSlider.value = onboardingLoanAmountInput.value;
    loanAmountInputSlider.dispatchEvent(new Event('input'));

    if (onboardingCarLoanInput) { carLoanInput.value = onboardingCarLoanInput.value; carLoanInput.dispatchEvent(new Event('change')); }
    if (onboardingStudentLoanInput) { studentLoanInput.value = onboardingStudentLoanInput.value; studentLoanInput.dispatchEvent(new Event('change')); }
    if (onboardingOtherLoanInput) { otherLoanInput.value = onboardingOtherLoanInput.value; otherLoanInput.dispatchEvent(new Event('change')); }
    if (onboardingCreditCardInput) { creditCardBalanceInput.value = onboardingCreditCardInput.value; creditCardBalanceInput.dispatchEvent(new Event('change')); }
    if (onboardingPropertyTaxInput) { homeExpenseMonthlyInput.value = onboardingPropertyTaxInput.value; homeExpenseMonthlyInput.dispatchEvent(new Event('change')); }
    if (onboardingHeatInput) { homeExpenseHeatInput.value = onboardingHeatInput.value; homeExpenseHeatInput.dispatchEvent(new Event('change')); }

    updateResults();
  };

  const openOnboarding = () => {
    if (grossAnnualIncomeInput.dataset.previousValue) onboardingIncomeInput.value = grossAnnualIncomeInput.dataset.previousValue;
    if (loanAmountInput.dataset.previousValue) onboardingLoanAmountInput.value = loanAmountInput.dataset.previousValue;
    if (carLoanInput.dataset.previousValue) onboardingCarLoanInput.value = carLoanInput.dataset.previousValue;
    if (studentLoanInput.dataset.previousValue) onboardingStudentLoanInput.value = studentLoanInput.dataset.previousValue;
    if (otherLoanInput.dataset.previousValue) onboardingOtherLoanInput.value = otherLoanInput.dataset.previousValue;
    if (creditCardBalanceInput.dataset.previousValue) onboardingCreditCardInput.value = creditCardBalanceInput.dataset.previousValue;
    if (homeExpenseMonthlyInput.dataset.previousValue) onboardingPropertyTaxInput.value = homeExpenseMonthlyInput.dataset.previousValue;
    if (homeExpenseHeatInput.dataset.previousValue) onboardingHeatInput.value = homeExpenseHeatInput.dataset.previousValue;
    renderOnboardingReadouts();
    currentOnboardingStep = 1;
    renderOnboardingStep();
    onboardingOverlay.classList.add('open');
  };

  const closeOnboarding = () => {
    onboardingOverlay.classList.remove('open');
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, '1'); } catch { /* private browsing etc - non-fatal, just re-shows next visit */ }
  };

  onboardingContinueButton?.addEventListener('click', () => {
    if (currentOnboardingStep === TOTAL_ONBOARDING_STEPS) {
      applyOnboardingValues();
      closeOnboarding();
      return;
    }
    currentOnboardingStep += 1;
    renderOnboardingStep();
  });

  onboardingBackButton?.addEventListener('click', () => {
    if (currentOnboardingStep > 1) {
      currentOnboardingStep -= 1;
      renderOnboardingStep();
    }
  });

  onboardingSkipButton?.addEventListener('click', () => {
    applyOnboardingValues();
    closeOnboarding();
  });

  // ---------------------------------------------------------------------
  // "How this works" spotlight tour
  // ---------------------------------------------------------------------

  const tourLayer = container.querySelector('.tour-layer') as HTMLElement;
  const tourSpotlight = container.querySelector('.tour-spotlight') as HTMLElement;
  const tourCard = container.querySelector('.tour-card') as HTMLElement;
  const tourTitleElement = container.querySelector('.tour-title') as HTMLElement;
  const tourTextElement = container.querySelector('.tour-text') as HTMLElement;
  const tourWhyElement = container.querySelector('.tour-why') as HTMLElement;
  const tourStepCountElement = container.querySelector('.tour-step-count') as HTMLElement;
  const tourBackButton = container.querySelector('.tour-back') as HTMLElement;
  const tourNextButton = container.querySelector('.tour-next') as HTMLElement;
  const tourCloseButton = container.querySelector('.tour-close') as HTMLElement;
  const calculatorRootElement = container.querySelector('.mortgage-calculator') as HTMLElement;

  type TourStep = { selector: string; title: string; text: string; why: string };
  const tourStepDefinitions: TourStep[] = [
    {
      selector: '.gross-annual-income',
      title: 'Income',
      text: 'Your gross annual income, before tax. Both GDS and TDS are measured against this number.',
      why: 'Everything on this page scales with what you enter here.',
    },
    {
      selector: '.dsc-debts-card',
      title: 'Monthly Debts',
      text: 'Every debt you carry outside this mortgage. Credit cards and unsecured lines of credit count at 3% of the balance; a HELOC counts as if amortized over 25 years at its own rate.',
      why: 'These add directly to your TDS - they never affect GDS.',
    },
    {
      selector: '.debt-service-rate',
      title: 'Mortgage',
      text: 'Your loan amount, rate, and amortization set your mortgage payment - the biggest single input to both ratios.',
      why: 'Interest Only lowers this payment, but qualification below always uses the regular payment.',
    },
    {
      selector: '.dsc-verdict',
      title: 'Verdict',
      text: 'A quick read on where your ratios land relative to lender guidelines.',
      why: 'Green is within preferred limits, amber is borderline, red is over the CMHC maximum.',
    },
    {
      selector: '.dsc-gauges',
      title: 'GDS & TDS',
      text: 'The two ratios themselves, plotted against the lender-preferred and CMHC-maximum limits.',
      why: 'Lender preferred is 32%/40%; CMHC maximum is 39%/44%.',
    },
    {
      selector: '.dsc-qualify',
      title: 'What You Qualify For',
      text: "The largest mortgage, and the minimum income, your current numbers support at CMHC's limits.",
      why: "This isn't a lender approval - just what the math itself supports.",
    },
    {
      selector: '.ways-to-save',
      title: 'Ways to lower your ratios',
      text: 'Real, one-click options - simulated against your own numbers - for improving your ratios if you need to.',
      why: 'Only shown when there is a genuine improvement of at least 0.1 point.',
    },
  ];

  let activeTourSteps: { step: TourStep; element: HTMLElement }[] = [];
  let currentTourIndex = 0;

  const positionTour = () => {
    const entry = activeTourSteps[currentTourIndex];
    if (!entry || !calculatorRootElement) return;
    const calcRect = calculatorRootElement.getBoundingClientRect();
    const targetRect = entry.element.getBoundingClientRect();
    const pad = 8;

    const top = targetRect.top - calcRect.top - pad;
    const left = targetRect.left - calcRect.left - pad;
    const width = targetRect.width + pad * 2;
    const height = targetRect.height + pad * 2;

    tourSpotlight.style.top = `${top}px`;
    tourSpotlight.style.left = `${left}px`;
    tourSpotlight.style.width = `${width}px`;
    tourSpotlight.style.height = `${height}px`;

    const cardHeight = tourCard.offsetHeight || 190;
    const cardWidth = tourCard.offsetWidth || 320;
    let cardTop = top + height + 14;
    if (cardTop + cardHeight > calcRect.height - 12) {
      cardTop = top - cardHeight - 14;
    }
    cardTop = Math.max(12, Math.min(cardTop, calcRect.height - cardHeight - 12));

    let cardLeft = left;
    cardLeft = Math.max(12, Math.min(cardLeft, calcRect.width - cardWidth - 12));

    tourCard.style.top = `${cardTop}px`;
    tourCard.style.left = `${cardLeft}px`;
  };

  const renderTourStep = () => {
    const entry = activeTourSteps[currentTourIndex];
    if (!entry) return;
    tourTitleElement.textContent = entry.step.title;
    tourTextElement.textContent = entry.step.text;
    tourWhyElement.textContent = entry.step.why;
    tourStepCountElement.textContent = `${currentTourIndex + 1} of ${activeTourSteps.length}`;
    tourBackButton.style.visibility = currentTourIndex === 0 ? 'hidden' : 'visible';
    tourNextButton.textContent = currentTourIndex === activeTourSteps.length - 1 ? 'Done' : 'Next';

    tourSpotlight.classList.remove('pulse');
    void tourSpotlight.offsetWidth;
    tourSpotlight.classList.add('pulse');

    entry.element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    positionTour();
    setTimeout(positionTour, 380);
  };

  const openTour = () => {
    activeTourSteps = tourStepDefinitions
      .map(step => ({ step, element: container.querySelector(step.selector) as HTMLElement }))
      .filter(entry => entry.element && entry.element.offsetParent !== null);
    if (!activeTourSteps.length) return;
    currentTourIndex = 0;
    tourLayer.classList.add('open');
    renderTourStep();
  };

  const closeTour = () => {
    tourLayer.classList.remove('open');
  };

  onboardingReopenButton?.addEventListener('click', openTour);
  tourCloseButton?.addEventListener('click', closeTour);
  tourNextButton?.addEventListener('click', () => {
    if (currentTourIndex === activeTourSteps.length - 1) {
      closeTour();
      return;
    }
    currentTourIndex += 1;
    renderTourStep();
  });
  tourBackButton?.addEventListener('click', () => {
    if (currentTourIndex > 0) {
      currentTourIndex -= 1;
      renderTourStep();
    }
  });
  tourLayer?.addEventListener('click', (e) => {
    if (e.target === tourLayer || e.target === tourSpotlight) closeTour();
  });
  window.addEventListener('resize', () => { if (tourLayer.classList.contains('open')) positionTour(); });
  window.addEventListener('scroll', () => { if (tourLayer.classList.contains('open')) positionTour(); }, { passive: true });

  renderOnboardingStep();
  renderOnboardingReadouts();

  let hasSeenOnboarding = false;
  try { hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1'; } catch { /* private browsing etc - just show it every visit */ }
  if (!hasSeenOnboarding) {
    openOnboarding();
  }

  updateResults();
}
