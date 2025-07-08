import { calculateAllRatios, formatCurrencyDetailed, calculateIdealMortgageAmount } from './utils-debt-service-calculator';
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
          <input type="range" min="0" max="1500000" value="500000" step="10000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$1,500,000+</span>
          </div>
        </div>
      </div>
      <div class="input-fields half-width-fields">
        <div class="input-field gross-annual-income">
          <div class="field-label">Gross Annual Income</div>
          <input type="text" value="$  150,000" data-previous-value="150000" class="value-input">
          <input type="range" min="0" max="500000" value="150000" step="10000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$500,000+</span>
          </div>
        </div>
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
        </div>
        <div class="input-field home-expense-heat">
          <div class="field-label">Heat</div>
          <input type="text" value="$  200" data-previous-value="200" class="value-input">
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

    <div class="calculator-input mortgage-calculator-input stress-test-rule">
      <div class="header">
        <div class="title-wrapper">
          <img src="${StressTestRuleIcon}" alt="Stress Test Rule icon"/>
          <div class="title">Stress Test Rule</div>
        </div>
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
    </div>

    <div class="calculator-input mortgage-calculator-input rental-income-rule">
      <div class="header">
        <div class="title-wrapper">
          <img src="${RentalIncomeRuleIcon}" alt="Rental Income Rule icon"/>
          <div class="title">Rental Income Rule</div>
        </div>
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

  const loanAmountInput = document.querySelector('.load-amount .value-input') as HTMLInputElement;
  const loanAmountInputSlider = document.querySelector('.load-amount .slider') as HTMLInputElement;

  const grossAnnualIncomeInput = document.querySelector('.gross-annual-income .value-input') as HTMLInputElement;
  const grossAnnualIncomeInputSlider = document.querySelector('.gross-annual-income .slider') as HTMLInputElement;

  const monthlyDebtPaymentsInput = document.querySelector('.monthly-debt-payments .value-input') as HTMLInputElement;
  const monthlyDebtPaymentsInputSlider = document.querySelector('.monthly-debt-payments .slider') as HTMLInputElement;

  const homeExpenseMonthlyInput = document.querySelector('.home-expense-monthly .value-input') as HTMLInputElement;
  const homeExpenseYearlyInput = document.querySelector('.home-expense-yearly .value-input') as HTMLInputElement;
  const homeExpenseCondoFeesInput = document.querySelector('.home-expense-condo-fees .value-input') as HTMLInputElement;
  const homeExpenseHeatInput = document.querySelector('.home-expense-heat .value-input') as HTMLInputElement;

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
  const gdsRatioResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(1) .value') as HTMLInputElement;
  const tdsRatioResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .ratios .ratio:nth-of-type(2) .value') as HTMLInputElement;
  const stressTestRateTypeResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .st-rate .st-rate-label span') as HTMLInputElement;
  const stressTestRateResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .st-rate .st-rate-value') as HTMLInputElement;
  const ratioTagsResultElements = document.querySelectorAll('.debt-service-calculator-results .debt-service-ratios .details .ratio-tags .ratio-tag') as NodeListOf<HTMLInputElement>;
  const monthlyMortgageResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .monthly-mortgage .service-detail-value') as HTMLInputElement;
  const debtPaymentResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .debt-payment .service-detail-value') as HTMLInputElement;
  const homeExpenseSpanResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-name span') as HTMLInputElement;
  const homeExpenseResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .home-expenses .service-detail-value') as HTMLInputElement;
  const cashLeftResultsElement = document.querySelector('.debt-service-calculator-results .debt-service-ratios .details .debt-service-details .cash-left .service-detail-value') as HTMLInputElement;

  const debtServiceRateSelectorElements = document.querySelectorAll('.debt-service-rate .btn-group-selector .selector');
  const stressTestRuleSelectorElements = document.querySelectorAll('.stress-test-rule .btn-group-selector .selector');
  const rentalIncomeRuleSelectorElements = document.querySelectorAll('.rental-income-rule .btn-group-selector .selector');

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
      const monthlyDebtPaymentsValue = monthlyDebtPaymentsInput.dataset.previousValue ? parseInt(monthlyDebtPaymentsInput.dataset.previousValue) : 0;
      const propertTaxMonthlyValue = homeExpenseMonthlyInput.dataset.previousValue ? parseFloat(parseFloat(homeExpenseMonthlyInput.dataset.previousValue).toFixed(2)) : 0;
      const condoFeesValue = homeExpenseCondoFeesInput.dataset.previousValue ? parseInt(homeExpenseCondoFeesInput.dataset.previousValue) : 0;
      const heatingCostValue = homeExpenseHeatInput.dataset.previousValue ? parseInt(homeExpenseHeatInput.dataset.previousValue) : 0;
      const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
      const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 5;
      const rentalIncomeMonthlyValue = addRentalIncomeMonthlyInput.dataset.previousValue ? parseInt(addRentalIncomeMonthlyInput.dataset.previousValue) : 0;

      const compoundingFrequencyValue = compoundingFrequencyValueElement.textContent ? compoundingFrequencyValueElement.textContent.toLowerCase() : "semi-annual";
      
      const stressTestTypeActiveElement = document.querySelector(".stress-test-rule .btn-group-selector .active") as HTMLInputElement;
      const rentalIncomeMethodActiveElement = document.querySelector(".rental-income-rule .btn-group-selector .active") as HTMLInputElement;

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

  loanAmountInputSlider.addEventListener("input", () => {
    const inputValue = loanAmountInputSlider.value.replace(/[^0-9.]/g, '');
    loanAmountInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    loanAmountInput.dataset.previousValue = inputValue;
    updateSliderBackground(loanAmountInputSlider);
    updateResults();
  });

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
          case "loan-amount":
            if (0 <= numericValue && numericValue <= 1500000) {
              loanAmountInputSlider.value = numericValue.toString();
              updateSliderBackground(loanAmountInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
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

          case "home-expense-monthly":
          case "home-expense-yearly":
          case "home-expense-condo-fees":
          case "home-expense-heat":
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
    const loanAmountValue = loanAmountInput.dataset.previousValue ? parseInt(loanAmountInput.dataset.previousValue) : 0;
    const grossAnnualIncomeValue = grossAnnualIncomeInput.dataset.previousValue ? parseInt(grossAnnualIncomeInput.dataset.previousValue) : 0;
    const monthlyDebtPaymentsValue = monthlyDebtPaymentsInput.dataset.previousValue ? parseInt(monthlyDebtPaymentsInput.dataset.previousValue) : 0;
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

    const stressTestTypeActiveElement = document.querySelector(".stress-test-rule .btn-group-selector .active") as HTMLInputElement;
    const rentalIncomeMethodActiveElement = document.querySelector(".rental-income-rule .btn-group-selector .active") as HTMLInputElement;

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
    const resultObj = calculateAllRatios(inputData, compoundingFrequencyValue, stressTestRate, condoFeeInclusionRateValue, rentalIncomePortionRateValue, stressTestTypeValue, rentalIncomeMethodValue);

    gdsRatioResultsElement.textContent = stressTestTypeValue === "b20" ? `${resultObj.stressTestGDS.toFixed(3)}%` : `${resultObj.gdsRatio.toFixed(3)}%`;
    tdsRatioResultsElement.textContent = stressTestTypeValue === "b20" ? `${resultObj.stressTestTDS.toFixed(3)}%` : `${resultObj.tdsRatio.toFixed(3)}%`;
    stressTestRateTypeResultsElement.textContent = stressTestTypeValue.toUpperCase();
    stressTestRateResultsElement.textContent = `${resultObj.stressTestRate.toFixed(2)}%`;
    monthlyMortgageResultsElement.textContent = formatCurrencyDetailed(resultObj.monthlyMortgagePayment);
    debtPaymentResultsElement.textContent = formatCurrencyDetailed(inputData.monthlyDebtPayments);
    homeExpenseSpanResultsElement.style.display = rentalIncomeMethodValue.toLowerCase() === "offset" ? "unset" : "none";
    homeExpenseResultsElement.textContent = formatCurrencyDetailed(resultObj.monthlyHomeExpenses);
    cashLeftResultsElement.textContent = formatCurrencyDetailed(resultObj.cashLeftGross);
  }

  formatInput(loanAmountInput, '$', 'loan-amount');
  updateSliderBackground(loanAmountInputSlider);

  formatInput(grossAnnualIncomeInput, '$', 'gross-annual-income');
  updateSliderBackground(grossAnnualIncomeInputSlider);

  formatInput(monthlyDebtPaymentsInput, '$', 'monthly-debt-payments');
  updateSliderBackground(monthlyDebtPaymentsInputSlider);

  formatInput(homeExpenseMonthlyInput, '$', 'home-expense-monthly');
  formatInput(homeExpenseYearlyInput, '$', 'home-expense-yearly');
  formatInput(homeExpenseCondoFeesInput, '$', 'home-expense-condo-fees');
  formatInput(homeExpenseHeatInput, '$', 'home-expense-heat');
  formatInput(addRentalIncomeMonthlyInput, '$', 'add-rental-income-monthly');
  formatInput(addRentalIncomeYearlyInput, '$', 'add-rental-income-yearly');


  formatInput(interestRateInput, '%', 'interest-rate');
  updateSliderBackground(interestRateInputSlider);

  formatInput(amortizationInput, 'Years', 'amortization-period');
  updateSliderBackground(amortizationInputSlider);

  updateResults();
}
