import { calculateMortgage } from './utils';

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
      <div class="header">
        <div class="title-wrapper">
          <img src="${PurchasePriceIcon}" alt="Purchase Price icon"/>
          <div class="title">Purchase Price</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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
      <div class="header">
        <div class="title-wrapper">
          <img src="${DownPaymentIcon}" alt="Down Payment icon"/>
          <div class="title">Down Payment</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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
          <div class="selector active">Fixed</div>
          <div class="selector">Variable</div>
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
      <div class="header">
        <div class="title-wrapper">
          <img src="${AmortizationPeriodIcon}" alt="Amortization Period icon"/>
          <div class="title">Amortization Period</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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
      <div class="header">
        <div class="title-wrapper">
          <img src="${TermLengthIcon}" alt="Term Length icon"/>
          <div class="title">Term Length</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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
      <div class="header">
        <div class="title-wrapper">
          <img src="${PaymentFrequencyIcon}" alt="Payment Frequency icon"/>
          <div class="title">Payment Frequency</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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
      <div class="section-label">Term Calculations (5 years)</div>
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
      <div class="section-label">Total Mortgage (25 years)</div>
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
    <div class="calculator-input term-length">
      <div class="header">
        <div class="title-wrapper">
          <img src="${TermLengthIcon}" alt="Term Length icon"/>
          <div class="title">Term Length</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
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

    <div class="calculator-input property-taxes">
      <div class="header">
        <div class="title-wrapper">
          <img src="${PropertyTaxesIcon}" alt="Property Taxes icon"/>
          <div class="title">Property Taxes</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
      </div>
      <div class="input-field">
        <input type="text" value="$  9,600" data-previous-value="9600" class="value-input">
        <input type="range" min="0" max="10000" value="9600" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$10,000</span>
        </div>
      </div>
    </div>

    <div class="calculator-input heating-costs">
      <div class="header">
        <div class="title-wrapper">
          <img src="${HeatingCostsIcon}" alt="Heating Costs icon"/>
          <div class="title">Heating Costs</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
      </div>
      <div class="input-field">
        <input type="text" value="$  2,400" data-previous-value="2400" class="value-input">
        <input type="range" min="0" max="3000" value="2400" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$3,000</span>
        </div>
      </div>
    </div>

    <div class="calculator-input condo-fees">
      <div class="header">
        <div class="title-wrapper">
          <img src="${CondoFeesIcon}" alt="Condo Fees icon"/>
          <div class="title">Condo Fees</div>
        </div>
        <img class="info-icon" src="${InfoIcon}" alt="Info icon"/>
      </div>
      <div class="input-field">
        <input type="text" value="$  250" data-previous-value="250" class="value-input">
        <input type="range" min="0" max="1000" value="250" class="slider">
        <div class="range-label">
          <span>$0</span>
          <span>$1,000</span>
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
        <div class="mortgage-amount">
          <div class="label">Mortgage Payment</div>
          <div class="value">$2,902</div>
        </div>
        <div class="mortgage-insurance">
          <div class="label">Property Taxes</div>
          <div class="value">$800</div>
        </div>
        <div class="mortgage-amount">
          <div class="label">Heating Costs</div>
          <div class="value">$200</div>
        </div>
        <div class="mortgage-insurance">
          <div class="label">Condo Fees</div>
          <div class="value">$0</div>
        </div>
      </div>
    </div>

    <div class="extra-payment-impacts">
      <div class="section-label">Impact of Extra Payments</div>
      <div class="section-wrapper">
        <div class="principal">
          <div class="label">Years Saved</div>
          <div class="value">0 years</div>
        </div>
        <div class="interest">
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
        <div class="section-heading">Mortgage Calculator</div>
        <div class="tab-layout">
          <div class="tab-headers">
            <div class="tab-header">Standard</div>
            <div class="tab-header active">Advanced</div>
          </div>
          <div class="tab-content">
            <div class="calculator-inputs">
              ${calculatorInputsHTML}
            </div>
            <div class="calculator-results">
              ${calculatorResultsHTML}
            </div>
          </div>
          <div class="tab-content active">
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

  const dropdownOpts = document.querySelectorAll('.dropdown-opt');

  dropdownOpts.forEach(dropdownOpt => {
    dropdownOpt.addEventListener('click', () => {
      const prevEl = dropdownOpt.parentElement?.previousElementSibling;
      const span = prevEl?.querySelector('span');

      if (span) {
        span.textContent = dropdownOpt.textContent;
      }

      dropdownOpt.parentElement?.classList.remove("expanded");
    });
  });

  document.querySelectorAll('.dropdown-field').forEach(field => {
    field.addEventListener('click', (e) => {
      document.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
        opt.classList.remove('expanded');
      });

      const opts = field.nextElementSibling as HTMLElement;
      opts?.classList.toggle('expanded');

      e.stopPropagation();
    });
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (!target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-opts.expanded').forEach(opt => {
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
    });
  });

  function updateSliderBackground(slider: HTMLInputElement) {
    const value = Number(slider.value); // convert value to number
    const min = Number(slider.min);
    const max = Number(slider.max);
    const percent = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #5f758a ${percent}%, #5f758a2f ${percent}%)`;
  }

  purchasePriceInputSlider.addEventListener("input", () => {
    const inputValue = purchasePriceInputSlider.value.replace(/[^0-9.]/g, '');
    purchasePriceInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    purchasePriceInput.dataset.previousValue = inputValue;
    updateSliderBackground(purchasePriceInputSlider);
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
  });

  interestRateInputSlider.addEventListener("input", () => {
    const inputValue = interestRateInputSlider.value.replace(/[^0-9.]/g, '');
    interestRateInput.value = inputValue ? `${parseFloat(inputValue).toFixed(2)}%` : '';
    interestRateInput.dataset.previousValue = inputValue;
    updateSliderBackground(interestRateInputSlider);
  });

  propertyTaxesInputSlider.addEventListener("input", () => {
    const inputValue = propertyTaxesInputSlider.value.replace(/[^0-9.]/g, '');
    propertyTaxesInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    propertyTaxesInput.dataset.previousValue = inputValue;
    updateSliderBackground(propertyTaxesInputSlider);
  });

  heatingCostsInputSlider.addEventListener("input", () => {
    const inputValue = heatingCostsInputSlider.value.replace(/[^0-9.]/g, '');
    heatingCostsInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    heatingCostsInput.dataset.previousValue = inputValue;
    updateSliderBackground(heatingCostsInputSlider);
  });

  condoFeesInputSlider.addEventListener("input", () => {
    const inputValue = condoFeesInputSlider.value.replace(/[^0-9.]/g, '');
    condoFeesInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    condoFeesInput.dataset.previousValue = inputValue;
    updateSliderBackground(condoFeesInputSlider);
  });

  const formatInput = (inputElement: HTMLInputElement, symbol: string, type: string) => {
    inputElement.addEventListener('input', (event) => {
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
            if (0 <= numericValue && numericValue <= 10000) {
              propertyTaxesInputSlider.value = numericValue.toString();
              updateSliderBackground(propertyTaxesInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "heating-costs":
            if (0 <= numericValue && numericValue <= 3000) {
              heatingCostsInputSlider.value = numericValue.toString();
              updateSliderBackground(heatingCostsInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;
            
          case "condo-fees":
            if (0 <= numericValue && numericValue <= 1000) {
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

      }
    });
  };

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
}
