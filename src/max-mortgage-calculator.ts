import { calculateMaxMortgage, formatCurrency, formatPercentage } from './utils-max-mortgage-calculator';
import StressTestRuleIcon from './assets/icons/stress-test-rule.svg';
import LoadDetailsIcon from './assets/icons/loan-details.svg';
import AddRentalIncomeIcon from './assets/icons/add-rental-income.svg';
import RateIcon from './assets/icons/debt-service-rate.svg';
import AffordabilityLevelIcon from './assets/icons/affordability-level.svg';
import HomeExpenseIcon from './assets/icons/home-expense.svg';
import AmortizationIcon from "./assets/icons/amortization.svg";
import DropdownIcon from './assets/icons/dropdown-icon.svg';

export function initMaxMortgageCalculator(container: HTMLElement) {
  const calculatorInputsHTML = `
    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${LoadDetailsIcon}" alt="Maximum Mortgage icon"/>
          <div class="title">Maximum Mortgage</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field gross-annual-income">
          <div class="field-label">Gross Annual Income</div>
          <input type="text" value="$  150,000" data-previous-value="150000" class="value-input">
          <input type="range" min="0" max="500000" value="150000" step="10000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$500,000+</span>
          </div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field monthly-debt-payments">
          <div class="field-label">Monthly Debt Payments</div>
          <input type="text" value="$  300" data-previous-value="300" class="value-input">
          <input type="range" min="0" max="5000" value="300" step="100" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$5,000+</span>
          </div>
        </div>
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
          <input type="text" value="$  833.33" data-previous-value="833.33" class="value-input">
        </div>
        <div class="input-field home-expense-yearly">
          <div class="field-label">Property Tax (Yearly)</div>
          <input type="text" value="$  10,000" data-previous-value="10000" class="value-input">
        </div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field home-expense-condo-fees">
          <div class="field-label">Condo fees (Monthly)</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <input type="range" min="0" max="5000" value="200" step="100" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$5,000+</span>
          </div>
        </div>
        <div class="input-field home-expense-heat">
          <div class="field-label">Heat</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
          <input type="range" min="0" max="5000" value="200" step="100" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$5,000+</span>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input affordability-level">
      <div class="header">
        <div class="title-wrapper">
          <img src="${AffordabilityLevelIcon}" alt="Affordability Level icon"/>
          <div class="title">Affordability Level</div>
        </div>
        <div class="mortgage-calculator-info full-row-width">This affordability slider helps you decides how much of your disposable income is allocated to mortgage payments, home expenses and monthly debt payments.</div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field affordability-level-gds">
          <div class="field-label">Property Tax (GDS)</div>
          <input type="text" value="35%" data-previous-value="35" class="value-input">
        </div>
        <div class="input-field affordability-level-tds">
          <div class="field-label">Property Tax (TDS)</div>
          <input type="text" value="42%" data-previous-value="42" class="value-input">
        </div>
      </div>
      <div class="btn-group-selector full-width">
        <div class="selector active">Baseline</div>
        <div class="selector">Standard</div>
      </div>
      <div class="current-calculated-ratios">
        <div class="label">Current Calculated Ratios</div>
        <div class="value">GDS: <span>35.00%</span> / TDS: <span>42.00%</span></div>
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
          <input type="range" min="0" max="10" value="6.29" step="0.01" class="slider">
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
          <input type="text" value="$  833.33" data-previous-value="833.33" class="value-input">
        </div>
        <div class="input-field add-rental-income-yearly">
          <div class="field-label">Yearly</div>
          <input type="text" value="$  10,000" data-previous-value="10000" class="value-input">
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input calculation-rules">
      <div class="header">
        <div class="title-wrapper">
          <img src="${StressTestRuleIcon}" alt="Calculation Rules icon"/>
          <div class="title">Calculation Rules</div>
        </div>
      </div>
      <div class="sub-header stress-test-rule">
        <div class="title">Stress Test Rule</div>
        <div class="btn-group-selector">
          <div class="selector active">Contract</div>
          <div class="selector">B20</div>
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
      <div class="sub-header rental-income-rule">
        <div class="title">Rental Income Rule</div>
        <div class="btn-group-selector">
          <div class="selector active">Add Back</div>
          <div class="selector">Offset</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline rental-income-portion">
          <div class="dropdown-field inline-label">
            <div class="field-label">Rental Income Portion</div>
            <span>100%</span>
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
      <div class="foot-notes">
        <div class="foot-note">
          <span>Stress Test:</span> CONTRACT uses your actual rate, 820 uses higher of 5.25% or contract rate + 2%
        </div>
        <div class="foot-note">
          <span>Rental Income:</span> ADO BACK adds income to qualify, OFFSET reduces housing costs
        </div>
      </div>
    </div>
  `;

  const calculatorResultsHTML = `
    <div class="max-mortgage-results">
      <div class="label">Maximum Mortgage Amount</div>
      <div class="max-mortgage-amount">
        <div class="amount">$427,432</div>
      </div>
      <div class="ratios-wrapper">
        <div class="item">
          <div class="item-label">Stress Test Rate</div>
          <div class="item-value">8.29%</div>
        </div>
        <div class="item">
          <div class="item-label">GDS / TDS</div>
          <div class="item-value">35.00% / 42.00%</div>
        </div>
      </div>
      <div class="details">
        <div class="breakdown-bar-container">
          <div class="breakdown-bar-monthly-mortgage"></div>
          <div class="breakdown-bar-debt-payment"></div>
          <div class="breakdown-bar-home-expenses"></div>
          <div class="breakdown-bar-cash-left"></div>
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
  `;

  container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading">Maximum Mortgage Calculator</div>
        <div class="tab-layout">
          <div class="tab-content active">
            <div class="calculator-inputs">
              ${calculatorInputsHTML}
            </div>
            <div class="calculator-results max-mortgage-calculator-results">
              ${calculatorResultsHTML}
            </div>
          </div>
        </div>
    </div>
  `;

  type StressTestType = 'contract' | 'b20';
  type RentalIncomeMethod = 'offset' | 'add-back';

  const grossAnnualIncomeInput = document.querySelector('.gross-annual-income .value-input') as HTMLInputElement;
  const grossAnnualIncomeInputSlider = document.querySelector('.gross-annual-income .slider') as HTMLInputElement;

  const monthlyDebtPaymentsInput = document.querySelector('.monthly-debt-payments .value-input') as HTMLInputElement;
  const monthlyDebtPaymentsInputSlider = document.querySelector('.monthly-debt-payments .slider') as HTMLInputElement;

  const homeExpenseMonthlyInput = document.querySelector('.home-expense-monthly .value-input') as HTMLInputElement;
  const homeExpenseYearlyInput = document.querySelector('.home-expense-yearly .value-input') as HTMLInputElement;

  const homeExpenseCondoFeesInput = document.querySelector('.home-expense-condo-fees .value-input') as HTMLInputElement;
  const homeExpenseCondoFeesInputSlider = document.querySelector('.home-expense-condo-fees .slider') as HTMLInputElement;


  const homeExpenseHeatInput = document.querySelector('.home-expense-heat .value-input') as HTMLInputElement;
  const homeExpenseHeatInputSlider = document.querySelector('.home-expense-heat .slider') as HTMLInputElement;

  const affordabilityLevelGdsInput = document.querySelector('.affordability-level-gds .value-input') as HTMLInputElement;
  const affordabilityLevelTdsInput = document.querySelector('.affordability-level-tds .value-input') as HTMLInputElement;

  const affordabilityRatioGds = document.querySelector('.affordability-level .current-calculated-ratios .value span:nth-of-type(1)') as HTMLInputElement;
  const affordabilityRatioTds = document.querySelector('.affordability-level .current-calculated-ratios .value span:nth-of-type(2)') as HTMLInputElement;

  const addRentalIncomeExpandableElement = document.querySelector('.add-rental-income .expandable') as HTMLInputElement;
  const addRentalIncomeMonthlyInput = document.querySelector('.add-rental-income-monthly .value-input') as HTMLInputElement;
  const addRentalIncomeYearlyInput = document.querySelector('.add-rental-income-yearly .value-input') as HTMLInputElement;

  const interestRateInput = document.querySelector('.rate .value-input') as HTMLInputElement;
  const interestRateInputSlider = document.querySelector('.rate .slider') as HTMLInputElement;

  const compoundingFrequencyValueElement = document.querySelector('.compounding .dropdown-field span') as HTMLInputElement;
  const condoFeeInclusionRateValueElement = document.querySelector('.condo-fee-inclusion-rate .dropdown-field span') as HTMLInputElement;
  const rentalIncomePortionRateValueElement = document.querySelector('.rental-income-portion .dropdown-field span') as HTMLInputElement;

  const amortizationInput = document.querySelector('.amortization .value-input') as HTMLInputElement;
  const amortizationInputSlider = document.querySelector('.amortization .slider') as HTMLInputElement;
  
  const maxMortgageAmountResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-amount .amount') as HTMLInputElement;
  // const gdsRatioResultsElement = document.querySelector('.max-mortgage-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(1) .value') as HTMLInputElement;
  // const tdsRatioResultsElement = document.querySelector('.max-mortgage-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(2) .value') as HTMLInputElement;
  // const stressTestRateTypeResultsElement = document.querySelector('.max-mortgage-calculator-results .debt-service-ratios .details .st-rate .st-rate-label span') as HTMLInputElement;
  const stressTestRateResultsElement = document.querySelector('.max-mortgage-calculator-results .ratios-wrapper .item:nth-of-type(1) .item-value') as HTMLInputElement;
  const gdsTdsRatioResultElements = document.querySelector('.max-mortgage-calculator-results .ratios-wrapper .item:nth-of-type(2) .item-value') as HTMLInputElement;
  
  const monthlyMortgageResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .debt-service-details .monthly-mortgage .service-detail-value') as HTMLInputElement;
  const debtPaymentResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .debt-service-details .debt-payment .service-detail-value') as HTMLInputElement;
  const homeExpenseSpanResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .debt-service-details .home-expenses .service-detail-name span') as HTMLInputElement;
  const homeExpenseResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .debt-service-details .home-expenses .service-detail-value') as HTMLInputElement;
  const cashLeftResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .debt-service-details .cash-left .service-detail-value') as HTMLInputElement;

  const breakdownBarMonthlyMortgageResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .breakdown-bar-container .breakdown-bar-monthly-mortgage') as HTMLInputElement;
  const breakdownBarDebtPaymentResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .breakdown-bar-container .breakdown-bar-debt-payment') as HTMLInputElement;
  const breakdownBarHomeExpensesResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .breakdown-bar-container .breakdown-bar-home-expenses') as HTMLInputElement;
  const breakdownBarCashLeftResultsElement = document.querySelector('.max-mortgage-calculator-results .max-mortgage-results .details .breakdown-bar-container .breakdown-bar-cash-left') as HTMLInputElement;

  const debtServiceRateSelectorElements = document.querySelectorAll('.debt-service-rate .btn-group-selector .selector');
  const stressTestRuleSelectorElements = document.querySelectorAll('.stress-test-rule .btn-group-selector .selector');
  const rentalIncomeRuleSelectorElements = document.querySelectorAll('.rental-income-rule .btn-group-selector .selector');
  const affordabilityLevelSelectorElements = document.querySelectorAll('.affordability-level .btn-group-selector .selector');

  const addRentalIncomeToggleSelectorElements = document.querySelectorAll('.add-rental-income .opt');

  const tooltipElements = document.querySelectorAll("[data-tooltip]");

  const dropdownOpts = document.querySelectorAll('.dropdown-opt');
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

  document.querySelectorAll('.dropdown-field').forEach(field => {
    field.addEventListener('click', (e) => {
      e.stopPropagation();
      const expandedDropdownElement = (e.target as HTMLElement)?.closest('.dropdown-expanded');
      if (expandedDropdownElement) {
        document.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
          opt.previousElementSibling?.classList.remove('dropdown-expanded');
          opt.classList.remove('expanded');
        });
      } else {
        document.querySelectorAll('.dropdown-field.dropdown-expanded').forEach(dropdown => {
          dropdown.classList.remove('dropdown-expanded');
        });
        document.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
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
      document.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
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

  affordabilityLevelSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      affordabilityLevelSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      
      const affordabilityLevelType = selector.textContent?.toLowerCase();
      const gdsValue = affordabilityLevelType === "baseline" ? 35 : 39;
      const tdsValue = affordabilityLevelType === "baseline" ? 42 : 44;
      
      affordabilityLevelGdsInput.value = `${gdsValue.toLocaleString('en-US')}%`;
      affordabilityLevelGdsInput.dataset.previousValue = gdsValue.toString();
      affordabilityLevelTdsInput.value = `${tdsValue.toLocaleString('en-US')}%`;
      affordabilityLevelTdsInput.dataset.previousValue = tdsValue.toString();

      updateResults();
    });
  });

  addRentalIncomeToggleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      const prevValue = (document.querySelector('.title-toggle-wrapper .toggle .selected') as HTMLElement)?.dataset?.value;
      const newValue = prevValue === 'off' ? 'on' : 'off';

      addRentalIncomeToggleSelectorElements.forEach(h => h.classList.remove('selected'));

      if (newValue === 'on') {
        (document.querySelector('.title-toggle-wrapper .toggle .on') as HTMLElement).classList.add('selected');
      } else {
        (document.querySelector('.title-toggle-wrapper .toggle .off') as HTMLElement).classList.add('selected');
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
    tooltip.className = "custom-tooltip";
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

  grossAnnualIncomeInputSlider.addEventListener("input", () => {
    const inputValue = grossAnnualIncomeInputSlider.value.replace(/[^0-9.]/g, '');
    grossAnnualIncomeInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    grossAnnualIncomeInput.dataset.previousValue = inputValue;
    updateSliderBackground(grossAnnualIncomeInputSlider);
    updateResults();
  });

  monthlyDebtPaymentsInputSlider.addEventListener("input", () => {
    const inputValue = monthlyDebtPaymentsInputSlider.value.replace(/[^0-9.]/g, '');
    monthlyDebtPaymentsInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    monthlyDebtPaymentsInput.dataset.previousValue = inputValue;
    updateSliderBackground(monthlyDebtPaymentsInputSlider);
    updateResults();
  });

  homeExpenseCondoFeesInputSlider.addEventListener("input", () => {
    const inputValue = homeExpenseCondoFeesInputSlider.value.replace(/[^0-9.]/g, '');
    homeExpenseCondoFeesInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    homeExpenseCondoFeesInput.dataset.previousValue = inputValue;
    updateSliderBackground(homeExpenseCondoFeesInputSlider);
    updateResults();
  });

  homeExpenseHeatInputSlider.addEventListener("input", () => {
    const inputValue = homeExpenseHeatInputSlider.value.replace(/[^0-9.]/g, '');
    homeExpenseHeatInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    homeExpenseHeatInput.dataset.previousValue = inputValue;
    updateSliderBackground(homeExpenseHeatInputSlider);
    updateResults();
  });

  interestRateInputSlider.addEventListener("input", () => {
    const inputValue = interestRateInputSlider.value.replace(/[^0-9.]/g, '');
    interestRateInput.value = inputValue ? `${parseFloat(inputValue).toFixed(2)}%` : '';
    interestRateInput.dataset.previousValue = inputValue;
    updateSliderBackground(interestRateInputSlider);
    updateResults();
  });

  amortizationInputSlider.addEventListener("input", () => {
    const inputValue = amortizationInputSlider.value.replace(/[^0-9.]/g, '');
    amortizationInput.value = inputValue ? `${parseInt(inputValue).toLocaleString('en-US')} Years` : '';
    amortizationInput.dataset.previousValue = inputValue;
    updateSliderBackground(amortizationInputSlider);
    updateResults();
  });

  const formatInput = (inputElement: HTMLInputElement, symbol: string, type: string) => {
    inputElement.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target) {
        let value = target.value;
        value = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
        const numericValue = value ? parseInt(value) : 0;

        switch (type) {
          case "affordability-level-gds":
          case "affordability-level-tds":
            if (0 <= numericValue && numericValue <= 100) {
              target.value = `${parseInt(value).toLocaleString('en-US')}${symbol}`;
              target.dataset.previousValue = value;
              if (type === "affordability-level-gds") {
                affordabilityRatioGds.textContent = `${parseFloat(parseFloat(value).toFixed(2)).toLocaleString('en-US')}${symbol}`;
              } else if (type === "affordability-level-tds") {
                affordabilityRatioTds.textContent = `${parseFloat(parseFloat(value).toFixed(2)).toLocaleString('en-US')}${symbol}`;
              }
            } else if (target.dataset.previousValue) {
              target.value = `${parseInt(target.dataset.previousValue).toLocaleString('en-US')}${symbol}`;
            }
            break;

          case "gross-annual-income":
            if (0 <= numericValue && numericValue <= 500000) {
              grossAnnualIncomeInputSlider.value = numericValue.toString();
              updateSliderBackground(grossAnnualIncomeInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "monthly-debt-payments":
            if (0 <= numericValue && numericValue <= 5000) {
              monthlyDebtPaymentsInputSlider.value = numericValue.toString();
              updateSliderBackground(monthlyDebtPaymentsInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "home-expense-condo-fees":
            if (0 <= numericValue && numericValue <= 5000) {
              homeExpenseCondoFeesInputSlider.value = numericValue.toString();
              updateSliderBackground(homeExpenseCondoFeesInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "home-expense-heat":
            if (0 <= numericValue && numericValue <= 5000) {
              homeExpenseHeatInputSlider.value = numericValue.toString();
              updateSliderBackground(homeExpenseHeatInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "home-expense-monthly":
          case "home-expense-yearly":
          case "add-rental-income-monthly":
          case "add-rental-income-yearly":
            if (0 <= numericValue && numericValue <= 5000) {
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "interest-rate":
            const floatValue = value ? parseFloat(value) : 0.00;
            if (0.1 <= floatValue && floatValue <= 10) {
              interestRateInputSlider.value = floatValue.toFixed(2);
              updateSliderBackground(interestRateInputSlider);
              target.value = `${floatValue.toFixed(2)}%`;
              target.dataset.previousValue = floatValue.toFixed(2);
            } else if (target.dataset.previousValue) {
              target.value = `${parseFloat(target.dataset.previousValue).toFixed(2)}%`;
            }
            break;

          case "amortization-period":
            if (5 <= numericValue && numericValue <= 30) {
              amortizationInputSlider.value = numericValue.toString();
              updateSliderBackground(amortizationInputSlider);
              target.value = `${parseInt(value).toLocaleString('en-US')} ${symbol}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${parseInt(target.dataset.previousValue).toLocaleString('en-US')} ${symbol}`;
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

  const updateResults = () => {
    const grossAnnualIncomeValue = grossAnnualIncomeInput.dataset.previousValue ? parseFloat(grossAnnualIncomeInput.dataset.previousValue) : 0;
    const monthlyDebtPaymentsValue = monthlyDebtPaymentsInput.dataset.previousValue ? parseFloat(monthlyDebtPaymentsInput.dataset.previousValue) : 0;
    const propertTaxMonthlyValue = homeExpenseMonthlyInput.dataset.previousValue ? parseFloat(parseFloat(homeExpenseMonthlyInput.dataset.previousValue).toFixed(2)) : 0;
    const condoFeesValue = homeExpenseCondoFeesInput.dataset.previousValue ? parseFloat(homeExpenseCondoFeesInput.dataset.previousValue) : 0;
    const heatingCostValue = homeExpenseHeatInput.dataset.previousValue ? parseFloat(homeExpenseHeatInput.dataset.previousValue) : 0;
    const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
    const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 5;
    const rentalIncomeMonthlyValue = addRentalIncomeMonthlyInput.dataset.previousValue ? parseFloat(addRentalIncomeMonthlyInput.dataset.previousValue) : 0;
    const affordabilityLevelGdsValue = affordabilityLevelGdsInput.dataset.previousValue ? parseFloat(affordabilityLevelGdsInput.dataset.previousValue) : 0;
    const affordabilityLevelTdsValue = affordabilityLevelTdsInput.dataset.previousValue ? parseFloat(affordabilityLevelTdsInput.dataset.previousValue) : 0;

    const compoundingFrequencyValue = compoundingFrequencyValueElement.textContent ? compoundingFrequencyValueElement.textContent.toLowerCase() : "semi-annual";
    const condoFeeInclusionRateValue = condoFeeInclusionRateValueElement.textContent ? parseInt(condoFeeInclusionRateValueElement.textContent.replace("%", "")) : 50;
    const rentalIncomePortionRateValue = rentalIncomePortionRateValueElement.textContent ? parseInt(rentalIncomePortionRateValueElement.textContent.replace("%", "")) : 50;

    const stressTestTypeActiveElement = document.querySelector(".stress-test-rule .btn-group-selector .active") as HTMLInputElement;
    const rentalIncomeMethodActiveElement = document.querySelector(".rental-income-rule .btn-group-selector .active") as HTMLInputElement;

    const rawStressTest = stressTestTypeActiveElement.textContent?.toLowerCase() || 'contract';
    const stressTestTypeValue: StressTestType = isStressTestType(rawStressTest) ? rawStressTest : 'contract';

    const rawRentalMethod = rentalIncomeMethodActiveElement.textContent?.toLowerCase().replace(" ", "-") || 'offset';
    const rentalIncomeMethodValue: RentalIncomeMethod = isRentalIncomeMethod(rawRentalMethod) ? rawRentalMethod : 'offset';

    const debtServiceRateTypeActiveElement = document.querySelector(".debt-service-rate .btn-group-selector .active") as HTMLInputElement;

    const resultObj = calculateMaxMortgage({
      grossAnnualIncome: grossAnnualIncomeValue,
      monthlyDebtPayments: monthlyDebtPaymentsValue,
      propertyTaxMonthly: propertTaxMonthlyValue,
      condoFees: condoFeesValue,
      heatCosts: heatingCostValue,
      interestRate: interestRateValue,
      amortizationYears: amortizationValue,
      amortizationMonths: 0,
      affordabilityLevel: 0,
      customGdsRatio: affordabilityLevelGdsValue,
      customTdsRatio: affordabilityLevelTdsValue,
      rentalIncomeMonthly: rentalIncomeMonthlyValue,
      includeRentalIncome: addRentalIncomeExpandableElement.classList.contains("expanded"),
      stressTestRule: stressTestTypeValue.toUpperCase(),
      condoFeeInclusionRate: condoFeeInclusionRateValue,
      rentalIncomeRule: rentalIncomeMethodValue.toUpperCase(),
      rentalIncomePortion: rentalIncomePortionRateValue,
      loanType: 'REGULAR',
      compounding: compoundingFrequencyValue,
    });

    maxMortgageAmountResultsElement.textContent = formatCurrency(resultObj.maxMortgageAmount);
    stressTestRateResultsElement.textContent = formatPercentage(resultObj.stressTestRate);
    gdsTdsRatioResultElements.textContent = `${formatPercentage(resultObj.gdsRatio)} / ${formatPercentage(resultObj.tdsRatio)}`;

    monthlyMortgageResultsElement.textContent = formatCurrency(resultObj.monthlyMortgagePayment, true);
    const debtPayments = resultObj.totalMonthlyDebtCosts - resultObj.totalMonthlyHousingCosts;
    const homeExpenses = resultObj.homeExpenses;

    // Calculate proportions for visual breakdown
    const total = resultObj.monthlyMortgagePayment + Math.max(debtPayments, 0) + homeExpenses + resultObj.cashLeftGross;
    const mortgageProp = (resultObj.monthlyMortgagePayment / total) * 100;
    const debtProp = (Math.max(debtPayments, 0) / total) * 100;
    const expensesProp = (homeExpenses / total) * 100;
    const cashProp = (resultObj.cashLeftGross / total) * 100;

    breakdownBarMonthlyMortgageResultsElement.style.width = `${mortgageProp.toString()}%`;
    breakdownBarDebtPaymentResultsElement.style.width = `${debtProp.toString()}%`;
    breakdownBarHomeExpensesResultsElement.style.width = `${expensesProp.toString()}%`;
    breakdownBarCashLeftResultsElement.style.width = `${cashProp.toString()}%`;

    debtPaymentResultsElement.textContent = formatCurrency(Math.max(debtPayments, 0), true);
    homeExpenseSpanResultsElement.style.display = rentalIncomeMethodValue.toLowerCase() === "offset" ? "unset" : "none";
    homeExpenseResultsElement.textContent = formatCurrency(homeExpenses, true);
    cashLeftResultsElement.textContent = formatCurrency(resultObj.cashLeftGross, true);
  }

  formatInput(grossAnnualIncomeInput, '$', 'gross-annual-income');
  updateSliderBackground(grossAnnualIncomeInputSlider);

  formatInput(monthlyDebtPaymentsInput, '$', 'monthly-debt-payments');
  updateSliderBackground(monthlyDebtPaymentsInputSlider);

  formatInput(homeExpenseMonthlyInput, '$', 'home-expense-monthly');
  formatInput(homeExpenseYearlyInput, '$', 'home-expense-yearly');

  formatInput(affordabilityLevelGdsInput, '%', 'affordability-level-gds');
  formatInput(affordabilityLevelTdsInput, '%', 'affordability-level-tds');



  formatInput(homeExpenseCondoFeesInput, '$', 'home-expense-condo-fees');
  updateSliderBackground(homeExpenseCondoFeesInputSlider);

  formatInput(homeExpenseHeatInput, '$', 'home-expense-heat');
  updateSliderBackground(homeExpenseHeatInputSlider);

  formatInput(addRentalIncomeMonthlyInput, '$', 'add-rental-income-monthly');
  formatInput(addRentalIncomeYearlyInput, '$', 'add-rental-income-yearly');


  formatInput(interestRateInput, '%', 'interest-rate');
  updateSliderBackground(interestRateInputSlider);

  formatInput(amortizationInput, 'Years', 'amortization-period');
  updateSliderBackground(amortizationInputSlider);

  updateResults();
}
