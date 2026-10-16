import {
  calculateAllRatios, formatCurrencyDetailed, calculateIdealMortgageAmount, LoanType,
  DebtServiceSettings, QualificationResult, calculateQualification, MAX_LIMITS, B20_BENCHMARK_RATE,
  DebtItems, DebtObligations, calculateDebtObligations, REVOLVING_MIN_PAYMENT_RATE, HELOC_QUALIFYING_AMORTIZATION_YEARS
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
    <div class="debt-service-ratios">
      <div class="label">Debt Service Ratios</div>
      <div class="ratios">
        <div class="ratio">
          <div class="value">28.546%</div>
          <div class="value-label">GDS</div>
        </div>
        <div class="ratio">
          <div class="value">30.946%</div>
          <div class="value-label">TDS</div>
        </div>
      </div>
      <div class="details">
        <div class="st-rate">
          <div class="st-rate-label">Stress Test Rate (<span>CONTRACT</span>)</div>
          <div class="st-rate-value">6.29%</div>
        </div>
        <div class="ratio-tags">
          <div class="ratio-tag ratio-tag-32">32%/40%</div>
          <div class="ratio-tag ratio-tag-35">35%/42%</div>
          <div class="ratio-tag ratio-tag-39">39%/44%</div>
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
  `;

  container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading">Debt Service Calculator</div>
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
  const gdsRatioResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(1) .value') as HTMLInputElement;
  const tdsRatioResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(2) .value') as HTMLInputElement;
  const stressTestRateTypeResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .st-rate .st-rate-label span') as HTMLInputElement;
  const stressTestRateResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .st-rate .st-rate-value') as HTMLInputElement;
  const ratioTagsResultElements = container.querySelectorAll('.debt-service-calculator-results .debt-service-ratios .details .ratio-tags .ratio-tag') as NodeListOf<HTMLInputElement>;
  const monthlyMortgageResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .monthly-mortgage .service-detail-value') as HTMLInputElement;
  const debtPaymentResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .debt-payment .service-detail-value') as HTMLInputElement;
  const homeExpenseSpanResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-name span') as HTMLInputElement;
  const homeExpenseResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-value') as HTMLInputElement;
  const cashLeftResultsElement = container.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .cash-left .service-detail-value') as HTMLInputElement;

  const qualifyMaxMortgageValueElement = container.querySelector('.dsc-qualify-item:nth-child(1) .dsc-qualify-value') as HTMLElement;
  const qualifyMinIncomeValueElement = container.querySelector('.dsc-qualify-item:nth-child(2) .dsc-qualify-value') as HTMLElement;
  const qualifyRoomValueElement = container.querySelector('.dsc-qualify-item:nth-child(3) .dsc-qualify-value') as HTMLElement;
  const qualifyNoteElement = container.querySelector('.dsc-qualify-note') as HTMLElement;

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

  ratioTagsResultElements.forEach(ratioTagResultElement => {
    ratioTagResultElement.addEventListener('click', (event) => {
      const targetElement = event.target as HTMLElement;
      let targetGdsRatio = 32;
      if (targetElement.classList.contains("ratio-tag-35")) {
        targetGdsRatio = 35;
      } else if (targetElement.classList.contains("ratio-tag-39")) {
        targetGdsRatio = 39;
      }
      
      const loanAmountValue = loanAmountInput.dataset.previousValue ? parseInt(loanAmountInput.dataset.previousValue) : 0;
      const grossAnnualIncomeValue = grossAnnualIncomeInput.dataset.previousValue ? parseInt(grossAnnualIncomeInput.dataset.previousValue) : 0;
      const monthlyDebtPaymentsValue = calculateDebtObligations(getDebtItems()).total;
      const propertTaxMonthlyValue = homeExpenseMonthlyInput.dataset.previousValue ? parseFloat(parseFloat(homeExpenseMonthlyInput.dataset.previousValue).toFixed(2)) : 0;
      const condoFeesValue = homeExpenseCondoFeesInput.dataset.previousValue ? parseInt(homeExpenseCondoFeesInput.dataset.previousValue) : 0;
      const heatingCostValue = homeExpenseHeatInput.dataset.previousValue ? parseInt(homeExpenseHeatInput.dataset.previousValue) : 0;
      const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
      const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 5;
      const rentalIncomeMonthlyValue = addRentalIncomeMonthlyInput.dataset.previousValue ? parseInt(addRentalIncomeMonthlyInput.dataset.previousValue) : 0;

      const compoundingFrequencyValue = compoundingFrequencyValueElement.textContent ? compoundingFrequencyValueElement.textContent.toLowerCase() : "semi-annual";
      
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


      const idealAmount = calculateIdealMortgageAmount(
        targetGdsRatio,
        inputData,
        compoundingFrequencyValue,
        50,
        50,
        stressTestTypeValue,
        rentalIncomeMethodValue
      );
      if (idealAmount > 0 && idealAmount <= 1500000) {
        const inputValue = Math.round(idealAmount);
        loanAmountInputSlider.value = inputValue.toString();
        loanAmountInput.value = inputValue ? `$  ${inputValue.toLocaleString('en-US')}` : '';
        loanAmountInput.dataset.previousValue = inputValue.toString();
        updateSliderBackground(loanAmountInputSlider);
        updateResults();
      }
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

    gdsRatioResultsElement.textContent = stressTestTypeValue === "b20" ? `${resultObj.stressTestGDS.toFixed(3)}%` : `${resultObj.gdsRatio.toFixed(3)}%`;
    tdsRatioResultsElement.textContent = stressTestTypeValue === "b20" ? `${resultObj.stressTestTDS.toFixed(3)}%` : `${resultObj.tdsRatio.toFixed(3)}%`;
    stressTestRateTypeResultsElement.textContent = stressTestTypeValue.toUpperCase();
    stressTestRateResultsElement.textContent = `${resultObj.stressTestRate.toFixed(2)}%`;
    monthlyMortgageResultsElement.textContent = formatCurrencyDetailed(resultObj.monthlyMortgagePayment);
    debtPaymentResultsElement.textContent = formatCurrencyDetailed(inputData.monthlyDebtPayments);
    homeExpenseSpanResultsElement.style.display = rentalIncomeMethodValue.toLowerCase() === "offset" ? "unset" : "none";
    homeExpenseResultsElement.textContent = formatCurrencyDetailed(resultObj.adjustedHomeExpenses);
    cashLeftResultsElement.textContent = formatCurrencyDetailed(resultObj.cashLeftGross);

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

  updateResults();
}
