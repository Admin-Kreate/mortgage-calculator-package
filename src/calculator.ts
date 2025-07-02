import { calculateMortgage, calculateAdvancedResults } from './utils';

import PurchasePriceIcon from './assets/icons/purchase-price.svg';
import DownPaymentIcon from './assets/icons/down-payment.svg';
import InterestRateIcon from './assets/icons/interest-rate.svg';
import AmortizationPeriodIcon from './assets/icons/amortization-period.svg';
import DropdownIcon from './assets/icons/dropdown-icon.svg';
import TermLengthIcon from './assets/icons/term-length.svg';
import PaymentFrequencyIcon from './assets/icons/payment-frequency.svg';
import PropertyTaxesIcon from './assets/icons/property-taxes.svg';
import HeatingCostsIcon from './assets/icons/heating-costs.svg';
import CondoFeesIcon from './assets/icons/condo-fees.svg';
import ExtraPaymentsIcon from './assets/icons/extra-payments.svg';
import InfoIcon from './assets/icons/info.svg';

export function initCalculator(container: HTMLElement, applyUrl: string) {
  const calculatorInputsHTML = `
    <div class="calculator-input purchase-price">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${PurchasePriceIcon}" alt="Purchase Price icon"/>
          <div class="title">Purchase Price</div>
        </div>
        <div class="mortgage-calculator-info">The total purchase price of the property</div>
      </div>
      <div class="input-field">
        <input type="text" value="$  500,000" data-previous-value="500000" class="value-input">
        <input type="range" min="0" max="2000000" value="500000" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$2M</span>
        </div>
      </div>
    </div>

    <div class="calculator-input down-payment">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${DownPaymentIcon}" alt="Down Payment icon"/>
          <div class="title">Down Payment</div>
        </div>
        <div class="mortgage-calculator-info">Your initial payment towards the property</div>
      </div>
      <div class="input-field">
        <div class="downpayment-percentage-wrapper">
          <input type="text" value="$  100,000" data-previous-value="100000" class="value-input">
          <input type="text" value="20%" data-previous-value="20" class="percentage-value-input">
        </div>
        <input type="range" min="5" max="40" value="20" class="slider">
        <div class="range-label">
          <span>5%</span>
          <span>40%</span>
        </div>
      </div>
    </div>

    <div class="calculator-input interest-rate">
      <div class="header">
        <div class="title-wrapper">
          <img src="${InterestRateIcon}" alt="Interest Rate icon"/>
          <div class="title">Interest Rate</div>
        </div>
        <div class="fixed-variable-selector">
          <div class="selector">Fixed</div>
          <div class="selector active">Variable</div>
        </div>
      </div>
      <div class="input-field">
        <input type="text" value="6.00%" data-previous-value="6.00" class="value-input">
        <input type="range" min="0.1" max="40" value="6" step="0.1" class="slider">
        <div class="range-label">
          <span>0.1%</span>
          <span>40%</span>
        </div>
      </div>
    </div>

    <div class="calculator-input amortization-period">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${AmortizationPeriodIcon}" alt="Amortization Period icon"/>
          <div class="title">Amortization Period</div>
        </div>
        <div class="mortgage-calculator-info">The total length of time to pay off your mortgage</div>
      </div>
      <div class="dropdown">
        <div class="dropdown-field">
          <span>25 years</span>
          <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
        </div>
        <div class="dropdown-opts">
          <div class="dropdown-opt">5 years</div>
          <div class="dropdown-opt">10 years</div>
          <div class="dropdown-opt">15 years</div>
          <div class="dropdown-opt">20 years</div>
          <div class="dropdown-opt">25 years</div>
          <div class="dropdown-opt">30 years</div>
        </div>
      </div>
    </div>

    <div class="calculator-input term-length">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${TermLengthIcon}" alt="Term Length icon"/>
          <div class="title">Term Length</div>
        </div>
        <div class="mortgage-calculator-info">The length of your mortgage term</div>
      </div>
      <div class="dropdown">
        <div class="dropdown-field">
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

    <div class="calculator-input payment-frequency">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${PaymentFrequencyIcon}" alt="Payment Frequency icon"/>
          <div class="title">Payment Frequency</div>
        </div>
        <div class="mortgage-calculator-info">How often you make mortgage payments</div>
      </div>
      <div class="dropdown">
        <div class="dropdown-field">
          <span>Monthly</span>
          <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
        </div>
        <div class="dropdown-opts">
          <div class="dropdown-opt">Monthly</div>
          <div class="dropdown-opt">Semi-Monthly</div>
          <div class="dropdown-opt">Bi-Weekly</div>
          <div class="dropdown-opt">Accelerated Bi-Weekly</div>
          <div class="dropdown-opt">Weekly</div>
          <div class="dropdown-opt">Accelerated Weekly</div>
        </div>
      </div>
    </div>

  `;

  const calculatorResultsHTML = `
    <div class="mortgage-payment">
      <div class="mortgage-payment-wrapper">
        <div class="label">Mortgage Payment</div>
        <div class="value">$2,902</div>
        <div class="frequency">Monthly Payment</div>
      </div>
      <div class="mortgage-amount-insurance">
        <div class="mortgage-amount">
          <div class="label">Mortgage Amount</div>
          <div class="value">$440,000</div>
        </div>
        <div class="mortgage-insurance">
          <div class="label">Mortgage Insurance</div>
          <div class="value">$13,640</div>
        </div>
      </div>
    </div>

    <div class="payment-breakdown">
      <div class="section-label">Payment Breakdown</div>
      <div class="section-wrapper">
        <div class="principal">
          <div class="label">Principal</div>
          <div class="value">$662</div>
        </div>
        <div class="interest">
          <div class="label">Interest</div>
          <div class="value">$2,240</div>
        </div>
      </div>
    </div>

    <div class="term-calculations">
      <div class="section-label">Term Calculations (<span>5 years</span>)</div>
      <div class="section-wrapper">
        <div class="calculation-row">
          <div class="label">Total Payments over Term</div>
          <div class="value">$174,145</div>
        </div>
        <div class="calculation-row">
          <div class="label">Principal Paid during Term</div>
          <div class="value">$46,105</div>
        </div>
        <div class="calculation-row">
          <div class="label">Interest Paid during Term</div>
          <div class="value">$128,040</div>
        </div>
        <div class="calculation-row">
          <div class="label">Balance Remaining after Term</div>
          <div class="value">$407,535</div>
        </div>
        <div class="calculation-row">
          <input type="range" min="1" max="100" value="10" step="1" class="slider principal-slider" disabled>
          <div class="range-label">
            <span>Principal Paid (10%)</span>
            <span>Remaining Balance</span>
          </div>
        </div>
      </div>
    </div>

    <div class="total-mortgage">
      <div class="section-label">Total Mortgage (<span>25 years</span>)</div>
      <div class="section-wrapper">
        <div class="calculation-row">
          <div class="label">Total Mortgage + Interest</div>
          <div class="value">$870,726</div>
        </div>
        <div class="calculation-row">
          <div class="label">Total Interest Paid</div>
          <div class="value">$417,086</div>
        </div>
        <div class="calculation-row">
          <div class="label">Interest/Principal Ratio</div>
          <div class="value">92%</div>
        </div>
        <div class="calculation-row">
          <div class="calculation-row-label">Amortization</div>
          <input type="range" min="1" max="100" value="92" step="1" class="slider amortization-result-slider" disabled>
          <div class="range-label">
            <span>Principal</span>
            <span>Interest</span>
          </div>
        </div>
      </div>
    </div>

  `;

  const advancedCalculatorInputsHTML = `
    <div class="calculator-input property-taxes">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${PropertyTaxesIcon}" alt="Property Taxes icon"/>
          <div class="title">Property Taxes</div>
        </div>
        <div class="mortgage-calculator-info">Annual property taxes</div>
      </div>
      <div class="input-field">
        <input type="text" value="$  9,600" data-previous-value="9600" class="value-input">
        <input type="range" min="0" max="100000" value="9600" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$100,000</span>
        </div>
      </div>
    </div>

    <div class="calculator-input heating-costs">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${HeatingCostsIcon}" alt="Heating Costs icon"/>
          <div class="title">Heating Costs</div>
        </div>
        <div class="mortgage-calculator-info">Annual heating costs</div>
      </div>
      <div class="input-field">
        <input type="text" value="$  2,400" data-previous-value="2400" class="value-input">
        <input type="range" min="0" max="5000" value="2400" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$5,000</span>
        </div>
      </div>
    </div>

    <div class="calculator-input condo-fees">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${CondoFeesIcon}" alt="Condo Fees icon"/>
          <div class="title">Condo Fees</div>
        </div>
        <div class="mortgage-calculator-info">Monthly condo maintenance fees</div>
      </div>
      <div class="input-field">
        <input type="text" value="$  250" data-previous-value="250" class="value-input">
        <input type="range" min="0" max="1500" value="250" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$1,500</span>
        </div>
      </div>
    </div>

    <div class="calculator-input extra-payments">
      <div class="header">
        <div class="title-wrapper">
          <img src="${ExtraPaymentsIcon}" alt="Extra Payments icon"/>
          <div class="title">Extra Payments</div>
        </div>
        <div class="extra-payment-selectors">
          <span class="selector">None</span>
          <span class="selector active">One-Time</span>
          <span class="selector">Recurring</span>
        </div>
      </div>
      <div class="input-field"><input type="text" value="$  0" data-previous-value="0" class="value-input"></div>
      <div class="dropdown">
        <div class="dropdown-field">
          <span>Monthly</span>
          <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>  
        </div>
        <div class="dropdown-opts">
          <div class="dropdown-opt">Monthly</div>
          <div class="dropdown-opt">Yearly</div>
          <div class="dropdown-opt">One-time</div>
        </div>
      </div>
    </div>

  `;

  const advancedCalculatorResultsHTML = `
    <div class="total-mortgage-payment">
      <div class="mortgage-payment-wrapper">
        <div class="label">Total Mortgage Payment</div>
        <div class="value">$3,902</div>
        <div class="frequency">Including all selected costs</div>
      </div>
      <div class="mortgage-amount-insurance">
        <div class="mortgage-amount advanced-mortgage-payment">
          <div class="label">Mortgage Payment</div>
          <div class="value">$2,902</div>
        </div>
        <div class="mortgage-insurance property-taxes">
          <div class="label">Property Taxes</div>
          <div class="value">$800</div>
        </div>
        <div class="mortgage-amount heating-costs">
          <div class="label">Heating Costs</div>
          <div class="value">$200</div>
        </div>
        <div class="mortgage-insurance condo-fees">
          <div class="label">Condo Fees</div>
          <div class="value">$0</div>
        </div>
      </div>
    </div>

    <div class="extra-payment-impacts">
      <div class="section-label">Impact of Extra Payments</div>
      <div class="section-wrapper">
        <div class="principal years-saved">
          <div class="label">Years Saved</div>
          <div class="value">0 years</div>
        </div>
        <div class="interest interest-saved">
          <div class="label">Interest Saved</div>
          <div class="value">$0</div>
        </div>
      </div>
    </div>

    <div class="mortgage-stress-test">
      <div class="section-label">Mortgage Stress Test</div>
      <div class="section-wrapper">
        <div class="calculation-row">
          <div class="label">Qualifying Rate</div>
          <div class="value">8.00%</div>
        </div>
        <div class="calculation-row">
          <div class="label">Stress Test Payment</div>
          <div class="value">$3,358</div>
        </div>
        <div class="calculation-row">
          <div class="label">Income Required</div>
          <div class="value">$163,430</div>
        </div>
      </div>
    </div>

  `;
  container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading">Purchase Calculator</div>
        <div class="tab-layout">
          <div class="tab-headers">
            <div class="tab-header active">Standard</div>
            <div class="tab-header">Advanced</div>
          </div>
          <div class="tab-content active">
            <div class="calculator-inputs">
              ${calculatorInputsHTML}
            </div>
            <div class="calculator-results">
              ${calculatorResultsHTML}
            </div>
          </div>
          <div class="tab-content">
            <div class="calculator-inputs">
              ${advancedCalculatorInputsHTML}
            </div>
            <div class="calculator-results">
              ${advancedCalculatorResultsHTML}
            </div>
          </div>
        </div>
    </div>
  `;



  const purchasePriceInput = document.querySelector('.purchase-price .value-input') as HTMLInputElement;
  const purchasePriceInputSlider = document.querySelector('.purchase-price .slider') as HTMLInputElement;

  const downPaymentInput = document.querySelector('.down-payment .value-input') as HTMLInputElement;
  const downPaymentPecentageInput = document.querySelector('.down-payment .percentage-value-input') as HTMLInputElement;
  const downPaymentPercentageInputSlider = document.querySelector('.down-payment .slider') as HTMLInputElement;

  const interestRateInput = document.querySelector('.interest-rate .value-input') as HTMLInputElement;
  const interestRateInputSlider = document.querySelector('.interest-rate .slider') as HTMLInputElement;

  const principalSlider = document.querySelector('.term-calculations .principal-slider') as HTMLInputElement;
  const amortizationResultSlider = document.querySelector('.total-mortgage .amortization-result-slider') as HTMLInputElement;

  const tabHeaders = document.querySelectorAll('.tab-header');
  const tabContents = document.querySelectorAll('.tab-content');

  const propertyTaxesInput = document.querySelector('.property-taxes .value-input') as HTMLInputElement;
  const propertyTaxesInputSlider = document.querySelector('.property-taxes .slider') as HTMLInputElement;

  const heatingCostsInput = document.querySelector('.heating-costs .value-input') as HTMLInputElement;
  const heatingCostsInputSlider = document.querySelector('.heating-costs .slider') as HTMLInputElement;

  const condoFeesInput = document.querySelector('.condo-fees .value-input') as HTMLInputElement;
  const condoFeesInputSlider = document.querySelector('.condo-fees .slider') as HTMLInputElement;

  const extraPaymentsInput = document.querySelector('.extra-payments .value-input') as HTMLInputElement;

  const amortizationPeriodValueElement = document.querySelector('.amortization-period .dropdown-field span') as HTMLInputElement;
  const paymentFrequencyValueElement = document.querySelector('.payment-frequency .dropdown-field span') as HTMLInputElement;
  const termLengthValueElement = document.querySelector('.term-length .dropdown-field span') as HTMLInputElement;
  const extraPaymentFrequencyValueElement = document.querySelector('.extra-payments .dropdown-field span') as HTMLInputElement;

  const mortgagePaymentResultsElement = document.querySelector('.calculator-results .mortgage-payment-wrapper .value') as HTMLInputElement;
  const mortgageAmountResultsElement = document.querySelector('.calculator-results .mortgage-amount-insurance .mortgage-amount .value') as HTMLInputElement;
  const mortgageInsuranceResultsElement = document.querySelector('.calculator-results .mortgage-amount-insurance .mortgage-insurance .value') as HTMLInputElement;
  const paymentBreakdownPrincipalResultsElement = document.querySelector('.calculator-results .payment-breakdown .principal .value') as HTMLInputElement;
  const paymentBreakdownInterestResultsElement = document.querySelector('.calculator-results .payment-breakdown .interest .value') as HTMLInputElement;

  const totalPaymentsOverTimeResultsElement = document.querySelector('.term-calculations .section-wrapper .calculation-row:nth-child(1) .value') as HTMLInputElement;
  const principalPaidDuringTermResultsElement = document.querySelector('.term-calculations .section-wrapper .calculation-row:nth-child(2) .value') as HTMLInputElement;
  const interestPaidDuringTermResultsElement = document.querySelector('.term-calculations .section-wrapper .calculation-row:nth-child(3) .value') as HTMLInputElement;
  const balanceRemainingAfterTermResultsElement = document.querySelector('.term-calculations .section-wrapper .calculation-row:nth-child(4) .value') as HTMLInputElement;

  const totalMortgagePlusInterestResultsElement = document.querySelector('.total-mortgage .section-wrapper .calculation-row:nth-child(1) .value') as HTMLInputElement;
  const totalInterestPaidResultsElement = document.querySelector('.total-mortgage .section-wrapper .calculation-row:nth-child(2) .value') as HTMLInputElement;
  const interestPrincipalRatioResultsElement = document.querySelector('.total-mortgage .section-wrapper .calculation-row:nth-child(3) .value') as HTMLInputElement;

  const termLengthResultsElement = document.querySelector('.term-calculations .section-label span') as HTMLInputElement;
  const totalMortgageYearsResultsElement = document.querySelector('.total-mortgage .section-label span') as HTMLInputElement;

  const totalMortgagePaymentAdvancedResultsElement = document.querySelector('.calculator-results .total-mortgage-payment .mortgage-payment-wrapper .value') as HTMLInputElement;
  const mortgagePaymentAdvancedResultsElement = document.querySelector('.calculator-results .total-mortgage-payment .mortgage-amount-insurance .advanced-mortgage-payment .value') as HTMLInputElement;
  const propertyTaxesAdvancedResultsElement = document.querySelector('.calculator-results .total-mortgage-payment .mortgage-amount-insurance .property-taxes .value') as HTMLInputElement;
  const heatingCostsAdvancedResultsElement = document.querySelector('.calculator-results .total-mortgage-payment .mortgage-amount-insurance .heating-costs .value') as HTMLInputElement;
  const condoFeesAdvancedResultsElement = document.querySelector('.calculator-results .total-mortgage-payment .mortgage-amount-insurance .condo-fees .value') as HTMLInputElement;

  const yearsSavedAdvancedResultsElement = document.querySelector('.calculator-results .extra-payment-impacts .years-saved .value') as HTMLInputElement;
  const interestSavedAdvancedResultsElement = document.querySelector('.calculator-results .extra-payment-impacts .interest-saved .value') as HTMLInputElement;

  const qualifyingRateAdvancedResultsElement = document.querySelector('.calculator-results .mortgage-stress-test .section-wrapper .calculation-row:nth-child(1) .value') as HTMLInputElement;
  const stressTestPaymentAdvancedResultsElement = document.querySelector('.calculator-results .mortgage-stress-test .section-wrapper .calculation-row:nth-child(2) .value') as HTMLInputElement;
  const incomeRequiredAdvancedResultsElement = document.querySelector('.calculator-results .mortgage-stress-test .section-wrapper .calculation-row:nth-child(3) .value') as HTMLInputElement;

  const interestRateTypeSelectorElements = document.querySelectorAll('.fixed-variable-selector .selector');
  const extraPaymentsTypeSelectorElements = document.querySelectorAll('.extra-payment-selectors .selector');

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
        // field.classList.remove('dropdown-expanded');
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

  tabHeaders.forEach((header, index) => {
    header.addEventListener('click', () => {
      tabHeaders.forEach(h => h.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      header.classList.add('active');
      tabContents[index].classList.add('active');

      updateResults();
    });
  });

  interestRateTypeSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      interestRateTypeSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  extraPaymentsTypeSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      extraPaymentsTypeSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');

      const firstField = selector.parentElement?.parentElement?.nextElementSibling;
      const secondField = selector.parentElement?.parentElement?.nextElementSibling?.nextElementSibling;
      if (selector.textContent?.toLowerCase() === 'none') {
        firstField?.classList.add("disabled");
        secondField?.classList.add("disabled");
      } else {
        firstField?.classList.remove("disabled");
        secondField?.classList.remove("disabled");
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

  purchasePriceInputSlider.addEventListener("input", () => {
    const inputValue = purchasePriceInputSlider.value.replace(/[^0-9.]/g, '');
    purchasePriceInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    purchasePriceInput.dataset.previousValue = inputValue;
    updateSliderBackground(purchasePriceInputSlider);
    updateDownpaymentPercentageInputs();
    updateResults();
  });

  downPaymentPercentageInputSlider.addEventListener("input", () => {
    let value = purchasePriceInput.dataset.previousValue?.replace(/[^0-9.]/g, '');
    const purchasePrice = value ? parseInt(value) : 0;

    const inputValue = downPaymentPercentageInputSlider.value.replace(/[^0-9.]/g, '');
    downPaymentPecentageInput.value = inputValue ? `${parseInt(inputValue).toLocaleString('en-US')}%` : '';
    downPaymentPecentageInput.dataset.previousValue = inputValue;

    const downpaymentValue = purchasePrice && inputValue ? purchasePrice * (parseInt(inputValue) * 0.01) : 0;
    downPaymentInput.value = `$  ${downpaymentValue.toLocaleString('en-US')}`;
    downPaymentInput.dataset.previousValue = downpaymentValue.toString();

    updateSliderBackground(downPaymentPercentageInputSlider);
    updateResults();
  });

  interestRateInputSlider.addEventListener("input", () => {
    const inputValue = interestRateInputSlider.value.replace(/[^0-9.]/g, '');
    interestRateInput.value = inputValue ? `${parseFloat(inputValue).toFixed(2)}%` : '';
    interestRateInput.dataset.previousValue = inputValue;
    updateSliderBackground(interestRateInputSlider);
    updateResults();
  });

  propertyTaxesInputSlider.addEventListener("input", () => {
    const inputValue = propertyTaxesInputSlider.value.replace(/[^0-9.]/g, '');
    propertyTaxesInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    propertyTaxesInput.dataset.previousValue = inputValue;
    updateSliderBackground(propertyTaxesInputSlider);
    updateResults();
  });

  heatingCostsInputSlider.addEventListener("input", () => {
    const inputValue = heatingCostsInputSlider.value.replace(/[^0-9.]/g, '');
    heatingCostsInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    heatingCostsInput.dataset.previousValue = inputValue;
    updateSliderBackground(heatingCostsInputSlider);
    updateResults();
  });

  condoFeesInputSlider.addEventListener("input", () => {
    const inputValue = condoFeesInputSlider.value.replace(/[^0-9.]/g, '');
    condoFeesInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    condoFeesInput.dataset.previousValue = inputValue;
    updateSliderBackground(condoFeesInputSlider);
    updateResults();
  });

  const updateDownpaymentPercentageInputs = () => {
    let ppValue = purchasePriceInput.dataset.previousValue?.replace(/[^0-9.]/g, '');
    const purchasePrice = ppValue ? parseInt(ppValue) : 0;

    const downpaymentValue = parseInt(downPaymentInput.dataset.previousValue ?? '0');
    const downpaymentPercentageValue = (downpaymentValue / purchasePrice) * 100;
    downPaymentPercentageInputSlider.value = downpaymentPercentageValue.toString();
    updateSliderBackground(downPaymentPercentageInputSlider);

    downPaymentPecentageInput.value = `${downpaymentPercentageValue.toLocaleString('en-US')}%`;
    downPaymentPecentageInput.dataset.previousValue = downpaymentPercentageValue.toString();
  };

  const formatInput = (inputElement: HTMLInputElement, symbol: string, type: string) => {
    inputElement.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target) {
        let value = target.value;
        value = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
        const numericValue = value ? parseInt(value) : 0;

        switch (type) {
          case "purchase-price":
            if (0 <= numericValue && numericValue <= 2000000) {
              purchasePriceInputSlider.value = numericValue.toString();
              updateSliderBackground(purchasePriceInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            updateDownpaymentPercentageInputs();
            break;

          case "downpayment":
            let ppValue = purchasePriceInput.dataset.previousValue?.replace(/[^0-9.]/g, '');
            const purchasePrice = ppValue ? parseInt(ppValue) : 0;

            const downpaymentLowerLimit = purchasePrice * 0.05;
            const downpaymentUpperLimit = purchasePrice * 0.40;

            if (numericValue <= downpaymentUpperLimit) {
              const downpaymentPercentageValue = (numericValue / purchasePrice) * 100;
              downPaymentPercentageInputSlider.value = downpaymentPercentageValue.toString();
              updateSliderBackground(downPaymentPercentageInputSlider);

              downPaymentPecentageInput.value = `${downpaymentPercentageValue.toLocaleString('en-US')}%`;
              downPaymentPecentageInput.dataset.previousValue = downpaymentPercentageValue.toString();

              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${target.dataset.previousValue}`;
            }
            break;

          case "downpayment-percentage":
            if (1 <= numericValue && numericValue <= 40) {
              downPaymentPercentageInputSlider.value = numericValue.toString();
              updateSliderBackground(downPaymentPercentageInputSlider);
              target.value = `${value}${symbol}`;
              target.dataset.previousValue = value;

              let ppValue = purchasePriceInput.dataset.previousValue?.replace(/[^0-9.]/g, '');
              const purchasePrice = ppValue ? parseInt(ppValue) : 0;
              const downpaymentValue = purchasePrice ? purchasePrice * (numericValue * 0.01) : 0;
              downPaymentInput.value = `$  ${downpaymentValue.toLocaleString('en-US')}`;
              downPaymentInput.dataset.previousValue = downpaymentValue.toString();
            } else if (target.dataset.previousValue) {
              target.value = `${target.dataset.previousValue}${symbol}`;
            }
            break;

          case "interest-rate":
            const floatValue = value ? parseFloat(value) : 0.00;
            if (0.1 <= floatValue && floatValue <= 40) {
              interestRateInputSlider.value = floatValue.toFixed(2);
              updateSliderBackground(interestRateInputSlider);
              target.value = `${floatValue.toFixed(2)}%`;
              target.dataset.previousValue = floatValue.toFixed(2);
            } else if (target.dataset.previousValue) {
              target.value = `${parseFloat(target.dataset.previousValue).toFixed(2)}%`;
            }
            break;

          case "property-taxes":
            if (0 <= numericValue && numericValue <= 100000) {
              propertyTaxesInputSlider.value = numericValue.toString();
              updateSliderBackground(propertyTaxesInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "heating-costs":
            if (0 <= numericValue && numericValue <= 5000) {
              heatingCostsInputSlider.value = numericValue.toString();
              updateSliderBackground(heatingCostsInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "condo-fees":
            if (0 <= numericValue && numericValue <= 1500) {
              condoFeesInputSlider.value = numericValue.toString();
              updateSliderBackground(condoFeesInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "extra-payments":
            if (0 <= numericValue) {
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          default:
            break;
        }
        updateResults();
      }
    });
  };

  const updateResults = () => {
    const activeTabElement = document.querySelector('.mortgage-calculator .tab-headers .active') as HTMLElement;
    const rateTypeValueElement = document.querySelector('.interest-rate .fixed-variable-selector .active') as HTMLInputElement;
    const extraPaymentTypeValueElement = document.querySelector('.extra-payments .extra-payment-selectors .active') as HTMLInputElement;

    const activeTab = activeTabElement.textContent?.toLowerCase();

    const inputData: any = {
      purchasePrice: purchasePriceInput.dataset.previousValue ? parseInt(purchasePriceInput.dataset.previousValue) : 0,
      downPaymentAmount: downPaymentInput.dataset.previousValue ? parseInt(downPaymentInput.dataset.previousValue) : 0,
      downPaymentPercentage: downPaymentPecentageInput.dataset.previousValue ? parseInt(downPaymentPecentageInput.dataset.previousValue) : 0,
      interestRate: interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0,
      amortizationPeriod: amortizationPeriodValueElement.textContent ? parseInt(amortizationPeriodValueElement.textContent.replace(" years", "")) : 5,
      paymentFrequency: paymentFrequencyValueElement.textContent ? paymentFrequencyValueElement.textContent.toLowerCase() : "monthly",
      rateType: rateTypeValueElement.textContent ? rateTypeValueElement.textContent.toLowerCase() : "fixed",
      termLength: termLengthValueElement.textContent ? parseInt(termLengthValueElement.textContent.replace(" years", "").replace(" year", "")) : 5,
      propertyTaxes: propertyTaxesInput.dataset.previousValue ? parseInt(propertyTaxesInput.dataset.previousValue) : 0,
      heatingCosts: heatingCostsInput.dataset.previousValue ? parseInt(heatingCostsInput.dataset.previousValue) : 0,
      condoFees: condoFeesInput.dataset.previousValue ? parseInt(condoFeesInput.dataset.previousValue) : 0,
      extraPaymentType: extraPaymentTypeValueElement.textContent ? extraPaymentTypeValueElement.textContent.toLowerCase() : "none",
      extraPaymentAmount: extraPaymentsInput.dataset.previousValue ? parseInt(extraPaymentsInput.dataset.previousValue) : 0,
      extraPaymentFrequency: extraPaymentFrequencyValueElement.textContent ? extraPaymentFrequencyValueElement.textContent.toLowerCase() : "monthly",
    };
    const resultObj = calculateMortgage(inputData);
    const advancedResultObj = calculateAdvancedResults(inputData);

    if (activeTab === "standard") {
      mortgagePaymentResultsElement.textContent = `$${resultObj.monthlyPayment.toLocaleString()}`;
      mortgageAmountResultsElement.textContent = `$${resultObj.mortgageAmount.toLocaleString()}`;
      mortgageInsuranceResultsElement.textContent = `$${resultObj.mortgageInsurance.toLocaleString()}`;

      paymentBreakdownPrincipalResultsElement.textContent = `$${resultObj.principal.toLocaleString()}`;
      paymentBreakdownInterestResultsElement.textContent = `$${resultObj.interest.toLocaleString()}`;

      totalPaymentsOverTimeResultsElement.textContent = `$${resultObj.termPayments.toLocaleString()}`;
      principalPaidDuringTermResultsElement.textContent = `$${resultObj.termPrincipalPaid.toLocaleString()}`;
      interestPaidDuringTermResultsElement.textContent = `$${resultObj.termInterestPaid.toLocaleString()}`;
      balanceRemainingAfterTermResultsElement.textContent = `$${resultObj.remainingPrincipalAtEndOfTerm.toLocaleString()}`;
      principalSlider.value = Math.round((resultObj.termPrincipalPaid / resultObj.mortgageAmount) * 100).toString();
      updateSliderBackground(principalSlider);

      totalMortgagePlusInterestResultsElement.textContent = `$${resultObj.totalMortgagePlusInterest.toLocaleString()}`;
      totalInterestPaidResultsElement.textContent = `$${resultObj.totalInterestPaid.toLocaleString()}`;
      interestPrincipalRatioResultsElement.textContent = `${resultObj.interestPrincipalRatio}%`;
      amortizationResultSlider.value = (100 - resultObj.interestPrincipalRatio).toString();
      updateSliderBackground(amortizationResultSlider);

      termLengthResultsElement.textContent = termLengthValueElement.textContent;
      totalMortgageYearsResultsElement.textContent = amortizationPeriodValueElement.textContent;
    } else {
      totalMortgagePaymentAdvancedResultsElement.textContent = `$${advancedResultObj.totalMonthlyPayment.toLocaleString()}`;
      mortgagePaymentAdvancedResultsElement.textContent = `$${advancedResultObj.mortgagePayment.toLocaleString()}`;
      propertyTaxesAdvancedResultsElement.textContent = `$${advancedResultObj.propertyTaxesMonthly.toLocaleString()}`;
      heatingCostsAdvancedResultsElement.textContent = `$${advancedResultObj.heatingCostsMonthly.toLocaleString()}`;
      condoFeesAdvancedResultsElement.textContent = `$${advancedResultObj.condoFeesMonthly.toLocaleString()}`;

      yearsSavedAdvancedResultsElement.textContent = `${advancedResultObj.yearsSaved} years`;
      interestSavedAdvancedResultsElement.textContent = `$${advancedResultObj.interestSaved.toLocaleString()}`;

      qualifyingRateAdvancedResultsElement.textContent = `${advancedResultObj.qualifyingRate.toFixed(2)}%`;
      stressTestPaymentAdvancedResultsElement.textContent = `$${advancedResultObj.stressTestPayment.toLocaleString()}`;
      incomeRequiredAdvancedResultsElement.textContent = `$${advancedResultObj.incomeRequired.toLocaleString()}`;
    }
  }

  formatInput(purchasePriceInput, '$', 'purchase-price');
  updateSliderBackground(purchasePriceInputSlider);

  formatInput(downPaymentPecentageInput, '%', 'downpayment-percentage');
  formatInput(downPaymentInput, '$', 'downpayment');
  updateSliderBackground(downPaymentPercentageInputSlider);


  formatInput(interestRateInput, '%', 'interest-rate');
  updateSliderBackground(interestRateInputSlider);

  updateSliderBackground(principalSlider);
  updateSliderBackground(amortizationResultSlider);

  formatInput(propertyTaxesInput, '$', 'property-taxes');
  updateSliderBackground(propertyTaxesInputSlider);

  formatInput(heatingCostsInput, '$', 'heating-costs');
  updateSliderBackground(heatingCostsInputSlider);

  formatInput(condoFeesInput, '$', 'condo-fees');
  updateSliderBackground(condoFeesInputSlider);

  formatInput(extraPaymentsInput, '$', 'extra-payments');

  updateResults();
}
