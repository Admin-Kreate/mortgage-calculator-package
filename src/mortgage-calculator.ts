import { calculateMortgage, formatCurrency, MortgageData } from './utils-mortgage-calculator';
import RateIcon from './assets/icons/rate.svg';
import LoadDetailsIcon from './assets/icons/loan-details.svg';
import CalculatorSettingsIcon from './assets/icons/calculator-settings.svg'
import PayMortgageFasterIcon from './assets/icons/pay-mortgage-faster.svg';
import AmortizationPeriodIcon from './assets/icons/amortization-period.svg';
import DropdownIcon from './assets/icons/dropdown-icon.svg';

export function initMortgageCalculator(container: HTMLElement) {
  const calculatorInputsHTML = `
    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${LoadDetailsIcon}" alt="Loan Details icon"/>
          <div class="title">Loan Details</div>
        </div>
      </div>
      <div class="input-fields">
        <div class="input-field purchase-price">
          <div class="field-label">Loan Amount</div>
          <input type="text" value="$  500,000" data-previous-value="500000" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="100000" max="2000000" value="500000" step="10000" class="slider">
          <div class="range-label">
            <span>$100K</span>
            <span>$2M+</span>
          </div>
        </div>
        <div class="dropdown inline payment-frequency">
          <div class="dropdown-field inline-label">
            <div class="field-label">Payment Frequency</div>
            <span>Monthly</span>
            <img class="info-icon" src="${DropdownIcon}" alt="Dropdown icon"/>
          </div>
          <div class="dropdown-opts payment-frequency-dd">
            <div class="dropdown-opt">Monthly</div>
            <div class="dropdown-opt">Bi-Weekly</div>
            <div class="dropdown-opt">Weekly</div>
            <div class="dropdown-opt">Accelerated Bi-Weekly</div>
            <div class="dropdown-opt">Accelerated Weekly</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="calculator-input mortgage-calculator-input">
      <div class="header stacked">
        <div class="title-wrapper">
          <img src="${RateIcon}" alt="Rate icon"/>
          <div class="title">Rate</div>
        </div>
        <div class="mortgage-calculator-info">Your mortgage interest rate can either be Fixed for the term or Variable (which changes with the prime rate). The Rate Term is the contract length with a lender.</div>
      </div>
      <div class="input-fields">
        <div class="input-field interest-rate">
          <div class="title-wrapper">
            <div class="field-label">Rate</div>
          </div>
          <input type="text" value="6.00%" data-previous-value="6.00" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0.1" max="10" value="6" step="0.1" class="slider">
          <div class="range-label">
            <span>0.1%</span>
            <span>10%</span>
          </div>
        </div>
        <div class="dropdown inline term-length">
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
          <img src="${AmortizationPeriodIcon}" alt="Amortization icon"/>
          <div class="title">Amortization</div>
        </div>
        <div class="mortgage-calculator-info">Amortization is the total time it takes to pay off your mortgage in full. New mortgages usually start with an amortization of 25 years or 30 years in Canada.</div>
      </div>
      <div class="input-fields single-field">
        <div class="input-field amortization">
          <div class="field-label">Amortization</div>
          <input type="text" value="25 Years" data-previous-value="25" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="1" max="40" value="25" step="1" class="slider">
          <div class="range-label">
            <span>1 Year</span>
            <span>40 Years</span>
          </div>
        </div>
      </div>
    </div>

    <div class="calculator-input mortgage-calculator-input calculator-settings">
      <div class="header">
        <div class="title-wrapper">
          <img src="${CalculatorSettingsIcon}" alt="Calculator Settings icon"/>
          <div class="title">Calculator Settings</div>
        </div>
        <div class="btn-group-selector">
          <div class="selector active">Regular</div>
          <div class="selector">Interest Only</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline term-length">
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
    </div>

    <div class="calculator-input mortgage-calculator-input pay-mortgage-faster">
      <div class="header stacked">
        <div class="title-toggle-wrapper">
          <div class="title-wrapper">
            <img src="${PayMortgageFasterIcon}" alt="Pay your mortgage faster icon"/>
            <div class="title">Pay your mortgage faster</div>
          </div>
          <div class="toggle">
            <div class="opt off selected" data-value="off"></div>
            <div class="opt on" data-value="on"></div>
          </div>
        </div>
        <div class="mortgage-calculator-info">Increasing your mortgage payments or paying a lump sum towards your principal have a huge impact. You'll pay off your mortgage much sooner and save tons of interest.</div>
      </div>
      <div class="input-fields single-field expandable">
        <div class="input-field payment-increase">
          <div class="field-label">Payment Increase</div>
          <div class="downpayment-percentage-wrapper">
            <input type="text" value="$  0" data-previous-value="0" class="value-input">
            <input type="text" value="0%" data-previous-value="0" class="percentage-value-input" disabled>
          </div>
          <div class="field-error"></div>
          <input type="range" min="0" max="2000" value="0" step="25" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$2,000+</span>
          </div>
        </div>
        <div class="input-field one-time-pre-payment">
          <div class="field-label">One time Pre-Payment</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="100000" value="0" step="1000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$100K+</span>
          </div>
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
    </div>

    <div class="payment-breakdown">
      <div class="section-label">Payment Breakdown</div>
      <div class="section-wrapper">
        <div class="breakdown-details">
          <div class="breakdown-detail">
            <div class="breakdown-bar-container">
              <div class="breakdown-bar-principal"></div>
              <div class="breakdown-bar-interest"></div>
            </div>
            <div class="principal-paid">
              <div class="icon-name-wrapper">
                <div class="detail-icon principal"></div>
                <div class="detail-name">Principal Paid</div>
              </div>
              <div class="value">$698.59</div>
            </div>
            <div class="interest-paid">
              <div class="icon-name-wrapper">
                <div class="detail-icon interest"></div>
                <div class="detail-name">Interest Paid</div>
              </div>
              <div class="value">$2,587.14</div>
            </div>
          </div>
          <div class="breakdown-total-payment">
            <div class="label">Total payment</div>
            <div class="value">$3,285.72</div>
          </div>
        </div>
      </div>
    </div>

    <div class="balance-amortization">
      <div class="section-wrapper">
        <div class="info-row balance">
          <div class="label">Balance end of Term</div>
          <div class="value">$450,996.52</div>
        </div>
        <div class="info-row amortization">
          <div class="label">Effective Amortization</div>
          <div class="value">IO Years 9 Months</div>
        </div>
        <div class="info-row duration">
          <div class="tag">3 MONTHS FASTER</div>
        </div>
      </div>
    </div>

    <div class="five-year-breakdown">
      <div class="section-wrapper">
        <div class="sec-heading">Breakdown Over 5 Years</div>
        <div class="info-row">
          <div class="label">Total Paid</div>
          <div class="value">$481,277</div>
        </div>
        <div class="info-row">
          <div class="label">Interest Paid</div>
          <div class="value">$160,562</div>
        </div>
        <div class="info-row">
          <div class="label">Principal Paid</div>
          <div class="value">$320,715</div>
        </div>
        <div class="info-row">
          <div class="label">Balance Remaining</div>
          <div class="value">$479,285</div>
        </div>
      </div>
    </div>

    <div class="total-breakdown">
      <div class="section-wrapper">
        <div class="sec-heading">Total Breakdown</div>
        <div class="info-row">
          <div class="label">Total Principal Paid</div>
          <div class="value">$232,688</div>
        </div>
        <div class="info-row">
          <div class="label">Total Interest Paid</div>
          <div class="value">$1,032,688</div>
        </div>
        <div class="info-row">
          <div class="label">Total Cost</div>
          <div class="value">$1,032,688</div>
        </div>
      </div>
    </div>

    <div class="savings-with-accelerated-payments">
      <div class="section-wrapper">
        <div class="sec-heading">Total Savings with Accelerated Payments</div>
        <div class="info-wrapper">
          <div class="info-row">
            <div class="label">Interest Savings</div>
            <div class="value">$53,765</div>
          </div>
          <div class="info-row">
            <div class="label">Time Saved</div>
            <div class="value">3 YEARS, 8 MONTHS FASTER</div>
          </div>
          <div class="total-money-saved">
            <div class="btn-label">Total Money Saved</div>
            <div class="btn-value">$6,321</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading">Mortgage Calculator</div>
        <div class="tab-layout">
          <div class="tab-content active">
            <div class="calculator-inputs">
              ${calculatorInputsHTML}
            </div>
            <div class="calculator-results mortgage-calculator-results">
              ${calculatorResultsHTML}
            </div>
          </div>
        </div>
    </div>
  `;



  const purchasePriceInput = container.querySelector('.purchase-price .value-input') as HTMLInputElement;
  const purchasePriceInputSlider = container.querySelector('.purchase-price .slider') as HTMLInputElement;

  const interestRateInput = container.querySelector('.interest-rate .value-input') as HTMLInputElement;
  const interestRateInputSlider = container.querySelector('.interest-rate .slider') as HTMLInputElement;

  const amortizationInput = container.querySelector('.amortization .value-input') as HTMLInputElement;
  const amortizationInputSlider = container.querySelector('.amortization .slider') as HTMLInputElement;

  const paymentIncreaseInput = container.querySelector('.payment-increase .value-input') as HTMLInputElement;
  const paymentIncreaseInputSlider = container.querySelector('.payment-increase .slider') as HTMLInputElement;

  const oneTimePrePaymentInput = container.querySelector('.one-time-pre-payment .value-input') as HTMLInputElement;
  const oneTimePrePaymentInputSlider = container.querySelector('.one-time-pre-payment .slider') as HTMLInputElement;

  // F4: inline validation-message elements, one per validated field.
  const purchasePriceErrorElement = container.querySelector('.purchase-price .field-error') as HTMLElement;
  const interestRateErrorElement = container.querySelector('.interest-rate .field-error') as HTMLElement;
  const amortizationErrorElement = container.querySelector('.amortization .field-error') as HTMLElement;
  const paymentIncreaseErrorElement = container.querySelector('.payment-increase .field-error') as HTMLElement;
  const oneTimePrePaymentErrorElement = container.querySelector('.one-time-pre-payment .field-error') as HTMLElement;

  const paymentFrequencyValueElement = container.querySelector('.payment-frequency .dropdown-field span') as HTMLInputElement;
  const termLengthValueElement = container.querySelector('.term-length .dropdown-field span') as HTMLInputElement;

  const mortgagePaymentResultsElement = container.querySelector('.mortgage-calculator-results .mortgage-payment .value') as HTMLInputElement;
  const mortgagePaymentFrequencyLabelElement = container.querySelector('.mortgage-calculator-results .mortgage-payment .frequency') as HTMLElement;

  const principalPaidResultsElement = container.querySelector('.mortgage-calculator-results .payment-breakdown .principal-paid .value') as HTMLInputElement;
  const interestPaidResultsElement = container.querySelector('.mortgage-calculator-results .payment-breakdown .interest-paid .value') as HTMLInputElement;
  const breakdownTotalPaymentResultsElement = container.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-total-payment .value') as HTMLInputElement;
  const breakdownBarPrincipalResultsElement = container.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-bar-principal') as HTMLInputElement;
  const breakdownBarInterestResultsElement = container.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-bar-interest') as HTMLInputElement;

  const balanceEndOfTermResultsElement = container.querySelector('.mortgage-calculator-results .balance-amortization .balance .value') as HTMLInputElement;
  const effectiveAmortizationResultsElement = container.querySelector('.mortgage-calculator-results .balance-amortization .amortization .value') as HTMLInputElement;
  const acceleratedResultsTimeSavedResultsElement = container.querySelector('.mortgage-calculator-results .balance-amortization .duration .tag') as HTMLInputElement;


  const fiveYearBreakdownTotalPaidResultsElement = container.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const fiveYearBreakdownInterestPaidResultsElement = container.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(3) .value') as HTMLInputElement;
  const fiveYearBreakdownPrincipalPaidResultsElement = container.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(4) .value') as HTMLInputElement;
  const fiveYearBreakdownBalanceRemainingResultsElement = container.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(5) .value') as HTMLInputElement;

  const totalBreakdownPrincipalPaidResultsElement = container.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const totalBreakdownInterestPaidResultsElement = container.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(3) .value') as HTMLInputElement;
  const totalBreakdownTotalCostResultsElement = container.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(4) .value') as HTMLInputElement;

  const savingsWithAcceleratedPaymentsResultsElement = container.querySelector('.savings-with-accelerated-payments') as HTMLInputElement;
  const totalSavingsInterestResultsElement = container.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .info-row:nth-of-type(1) .value') as HTMLInputElement;
  const totalSavingsTimeResultsElement = container.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const totalSavingsTotalMoneyResultsElement = container.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .total-money-saved .btn-value') as HTMLInputElement;

  const paymentIncreasePercentageElement = container.querySelector('.mortgage-calculator-input .payment-increase .percentage-value-input') as HTMLInputElement;

  const calculatorSettingsSelectorElements = container.querySelectorAll('.calculator-settings .btn-group-selector .selector');
  const compoundingValueElement = container.querySelector('.calculator-settings .dropdown-field span') as HTMLInputElement;
  const PayMortgageFasterToggleSelectorElements = container.querySelectorAll('.pay-mortgage-faster .opt');

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
        // field.classList.remove('dropdown-expanded');
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

  calculatorSettingsSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      calculatorSettingsSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  PayMortgageFasterToggleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      const prevValue = (container.querySelector('.title-toggle-wrapper .toggle .selected') as HTMLElement)?.dataset?.value;
      const newValue = prevValue === 'off' ? 'on' : 'off';

      PayMortgageFasterToggleSelectorElements.forEach(h => h.classList.remove('selected'));

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
        paymentIncreaseInput.value = '$  0';
        paymentIncreaseInput.dataset.previousValue = '0';
        paymentIncreaseInputSlider.value = '0';
        updateSliderBackground(paymentIncreaseInputSlider);

        oneTimePrePaymentInput.value = '$  0';
        oneTimePrePaymentInput.dataset.previousValue = '0';
        oneTimePrePaymentInputSlider.value = '0';
        updateSliderBackground(oneTimePrePaymentInputSlider);
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

  // F4: dragging a slider always produces a value already within bounds, so it's also a
  // "next valid entry" for that field - clear any lingering error message from a previous
  // rejected typed entry so nothing goes stale.
  purchasePriceInputSlider.addEventListener("input", () => {
    const inputValue = purchasePriceInputSlider.value.replace(/[^0-9.]/g, '');
    purchasePriceInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    purchasePriceInput.dataset.previousValue = inputValue;
    updateSliderBackground(purchasePriceInputSlider);
    if (purchasePriceErrorElement) purchasePriceErrorElement.textContent = '';
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

  paymentIncreaseInputSlider.addEventListener("input", () => {
    const inputValue = paymentIncreaseInputSlider.value.replace(/[^0-9.]/g, '');
    paymentIncreaseInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    paymentIncreaseInput.dataset.previousValue = inputValue;
    updateSliderBackground(paymentIncreaseInputSlider);
    if (paymentIncreaseErrorElement) paymentIncreaseErrorElement.textContent = '';
    updateResults();
  });

  oneTimePrePaymentInputSlider.addEventListener("input", () => {
    const inputValue = oneTimePrePaymentInputSlider.value.replace(/[^0-9.]/g, '');
    oneTimePrePaymentInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    oneTimePrePaymentInput.dataset.previousValue = inputValue;
    updateSliderBackground(oneTimePrePaymentInputSlider);
    if (oneTimePrePaymentErrorElement) oneTimePrePaymentErrorElement.textContent = '';
    updateResults();
  });

  // X-1/X-2: parse a typed value once, properly, instead of the old
  // `value.replace(/[^0-9.]/g, '')` + parseInt/parseFloat pattern repeated per field below -
  //  - preserve a leading minus sign instead of stripping it,
  //  - use parseFloat (not parseInt) so cents aren't truncated,
  //  - and treat empty/non-finite (NaN/Infinity) input as INVALID (null) rather than
  //    silently coercing it to 0.
  const parseTypedNumber = (rawValue: string): number | null => {
    const trimmed = rawValue.trim();
    const cleaned = trimmed.replace(/[^0-9.\-+eE]/g, '');
    if (!cleaned) return null;
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  };

  // F4: one validation message per validated field, reflecting its actual current bounds.
  // Shown the instant a typed entry is rejected, cleared the instant a valid one lands.
  const validationMessages: Record<string, string> = {
    'purchase-price': 'Enter an amount between $100,000 and $2,000,000.',
    'interest-rate': 'Enter a rate between 0.1% and 10%.',
    'amortization-period': 'Enter a term between 1 and 40 years.',
    'payment-increase': 'Enter an amount up to $2,000.',
    'one-time-pre-payment': 'Enter an amount up to $100,000.',
  };

  const formatInput = (inputElement: HTMLInputElement, symbol: string, type: string, errorElement?: HTMLElement) => {
    const showError = () => {
      if (errorElement) errorElement.textContent = validationMessages[type] ?? '';
    };
    const clearError = () => {
      if (errorElement) errorElement.textContent = '';
    };

    inputElement.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target) {
        const parsedValue = parseTypedNumber(target.value);
        // Dollar/year fields are whole numbers - round (not truncate) cents away. The
        // interest-rate field keeps full decimal precision, handled separately below.
        const numericValue = parsedValue === null ? null : Math.round(parsedValue);

        const restorePrevious = (suffix: 'currency' | 'years') => {
          if (target.dataset.previousValue === undefined) return;
          const previous = parseInt(target.dataset.previousValue);
          target.value = suffix === 'currency'
            ? `${symbol}  ${previous.toLocaleString('en-US')}`
            : `${previous.toLocaleString('en-US')} ${symbol}`;
        };

        if (parsedValue === null) {
          // Non-numeric / cleared input: fall back to the previous valid value instead of
          // rendering "$ NaN".
          showError();
          if (type === 'amortization-period') {
            restorePrevious('years');
          } else if (type === 'interest-rate') {
            if (target.dataset.previousValue) {
              target.value = `${parseFloat(target.dataset.previousValue).toFixed(2)}%`;
            }
          } else {
            restorePrevious('currency');
          }
          updateResults();
          return;
        }

        switch (type) {
          case "purchase-price":
            // F3: keep the typed value consistent with the slider's own bounds (previously
            // only the lower bound was enforced, so a typed value could exceed $2M).
            if (numericValue !== null && 100000 <= numericValue && numericValue <= 2000000) {
              purchasePriceInputSlider.value = numericValue.toString();
              updateSliderBackground(purchasePriceInputSlider);
              target.value = `${symbol}  ${numericValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = numericValue.toString();
              clearError();
            } else {
              restorePrevious('currency');
              showError();
            }
            break;

          case "interest-rate": {
            const floatValue = parsedValue;
            if (0.1 <= floatValue && floatValue <= 10) {
              interestRateInputSlider.value = floatValue.toFixed(2);
              updateSliderBackground(interestRateInputSlider);
              target.value = `${floatValue.toFixed(2)}%`;
              target.dataset.previousValue = floatValue.toFixed(2);
              clearError();
            } else {
              if (target.dataset.previousValue) {
                target.value = `${parseFloat(target.dataset.previousValue).toFixed(2)}%`;
              }
              showError();
            }
            break;
          }

          case "amortization-period":
            if (numericValue !== null && 1 <= numericValue && numericValue <= 40) {
              amortizationInputSlider.value = numericValue.toString();
              updateSliderBackground(amortizationInputSlider);
              target.value = `${numericValue.toLocaleString('en-US')} ${symbol}`;
              target.dataset.previousValue = numericValue.toString();
              clearError();
            } else {
              restorePrevious('years');
              showError();
            }
            break;

          case "payment-increase":
            // F3: slider tops out at $2,000 - keep the typed value in line with it.
            if (numericValue !== null && 0 <= numericValue && numericValue <= 2000) {
              paymentIncreaseInputSlider.value = numericValue.toString();
              updateSliderBackground(paymentIncreaseInputSlider);
              target.value = `${symbol}  ${numericValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = numericValue.toString();
              clearError();
            } else {
              restorePrevious('currency');
              showError();
            }
            break;

          case "one-time-pre-payment":
            // F3: slider tops out at $100,000 - keep the typed value in line with it.
            if (numericValue !== null && 0 <= numericValue && numericValue <= 100000) {
              oneTimePrePaymentInputSlider.value = numericValue.toString();
              updateSliderBackground(oneTimePrePaymentInputSlider);
              target.value = `${symbol}  ${numericValue.toLocaleString('en-US')}`;
              target.dataset.previousValue = numericValue.toString();
              clearError();
            } else {
              restorePrevious('currency');
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

  const updateResults = () => {
    const loanAmountValue = purchasePriceInput.dataset.previousValue ? parseInt(purchasePriceInput.dataset.previousValue) : 0;
    const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
    const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 1;
    // M-1 (extended for F1): normalise the dropdown's display text to the paymentFrequency
    // value the rest of the code (and MortgageData's type) expects. Every dropdown-opt string
    // has an explicit entry here so a future renamed/reworded option falls through to
    // 'monthly' loudly (via the map miss) rather than silently.
    const paymentFrequencyMap: Record<string, MortgageData['paymentFrequency']> = {
      'monthly': 'monthly',
      'bi-weekly': 'biweekly',
      'weekly': 'weekly',
      'accelerated bi-weekly': 'acceleratedBiweekly',
      'accelerated weekly': 'acceleratedWeekly',
    };
    const rawPaymentFrequency = paymentFrequencyValueElement.textContent ? paymentFrequencyValueElement.textContent.toLowerCase() : 'monthly';
    const paymentFrequencyValue: MortgageData['paymentFrequency'] = paymentFrequencyMap[rawPaymentFrequency] ?? 'monthly';
    const paymentIncreaseValue = paymentIncreaseInput.dataset.previousValue ? parseInt(paymentIncreaseInput.dataset.previousValue) : 0;
    const loanTypeActiveSelector = container.querySelector('.calculator-settings .btn-group-selector .selector.active');

    // if (paymentIncreaseValue === 0) return 0;

    // Calculate the original base payment without any acceleration
    const annualRate = interestRateValue / 100;
    const monthlyRate = annualRate / 12;
    const totalPayments = amortizationValue * 12;

    let basePayment;
    if (paymentFrequencyValue === 'monthly') {
      basePayment = loanAmountValue * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else if (paymentFrequencyValue === 'biweekly') {
      const biweeklyRate = annualRate / 26;
      const biweeklyPayments = amortizationValue * 26;
      basePayment = loanAmountValue * (biweeklyRate * Math.pow(1 + biweeklyRate, biweeklyPayments)) / (Math.pow(1 + biweeklyRate, biweeklyPayments) - 1);
    } else { // weekly
      const weeklyRate = annualRate / 52;
      const weeklyPayments = amortizationValue * 52;
      basePayment = loanAmountValue * (weeklyRate * Math.pow(1 + weeklyRate, weeklyPayments)) / (Math.pow(1 + weeklyRate, weeklyPayments) - 1);
    }

    const paymentIncreasePercentage = ((paymentIncreaseValue / basePayment) * 100);
    paymentIncreasePercentageElement.value = `${paymentIncreasePercentage.toFixed(2)}%`
    paymentIncreasePercentageElement.dataset.previousValue = paymentIncreasePercentage.toFixed(2).toString();

    // M-9: a rate term longer than the amortization period is nonsensical - clamp it here
    // too so the label/selection shown to the user lines up with what the math actually uses.
    const rawRateTerm = termLengthValueElement.textContent ? parseInt(termLengthValueElement.textContent.replace(" years", "").replace(" year", "")) : 5;
    const rateTermValue = Math.min(rawRateTerm, amortizationValue);

    const inputData: any = {
      loanAmount: loanAmountValue,
      interestRate: interestRateValue,
      rateTerm: rateTermValue,
      amortization: amortizationValue,
      paymentFrequency: paymentFrequencyValue,
      loanType: loanTypeActiveSelector?.textContent?.toLowerCase(),
      compounding: compoundingValueElement.textContent ? compoundingValueElement.textContent.toLocaleLowerCase() : 'semi-annual',
      paymentIncrease: paymentIncreaseValue,
      paymentIncreaseType: 'dollar',
      oneTimePrePayment: oneTimePrePaymentInput.dataset.previousValue ? parseInt(oneTimePrePaymentInput.dataset.previousValue) : 0,
      annualPrePayment: 0
    };
    const resultObj = calculateMortgage(inputData);

    const principalPercent = (resultObj.principal / resultObj.mortgagePayment) * 100;
    const interestPercent = 100 - principalPercent;

    // console.log("resultObj - ", resultObj, principalPercent, interestPercent);

    // M-1 (extended for F1): keep the "Monthly Payment" label in sync with the selected
    // frequency - accelerated bi-weekly/weekly get their own distinct label rather than
    // falling through to the plain "Bi-Weekly Payment" / "Weekly Payment" text.
    const frequencyLabelMap: Record<MortgageData['paymentFrequency'], string> = {
      monthly: 'Monthly Payment',
      biweekly: 'Bi-Weekly Payment',
      weekly: 'Weekly Payment',
      acceleratedBiweekly: 'Accelerated Bi-Weekly Payment',
      acceleratedWeekly: 'Accelerated Weekly Payment',
    };
    if (mortgagePaymentFrequencyLabelElement) {
      mortgagePaymentFrequencyLabelElement.textContent = frequencyLabelMap[paymentFrequencyValue];
    }

    mortgagePaymentResultsElement.textContent = resultObj.acceleratedResults ? formatCurrency(resultObj.acceleratedResults.adjustedPayment) : formatCurrency(resultObj.mortgagePayment);

    principalPaidResultsElement.textContent = formatCurrency(resultObj.principal);
    interestPaidResultsElement.textContent = formatCurrency(resultObj.interest);
    breakdownTotalPaymentResultsElement.textContent = resultObj.acceleratedResults ? formatCurrency(resultObj.acceleratedResults.adjustedPayment) : formatCurrency(resultObj.mortgagePayment);
    breakdownBarPrincipalResultsElement.style.width = `${principalPercent.toString()}%`;
    breakdownBarInterestResultsElement.style.width = `${interestPercent.toString()}%`;

    balanceEndOfTermResultsElement.textContent = formatCurrency(resultObj.balanceEndOfTerm);

    // M-2: an interest-only loan never amortizes on its own - say so instead of showing a
    // misleading "N Years" countdown that implies the balance is being paid down.
    const isInterestOnly = inputData.loanType === 'interest only';

    // Formats a fractional-years number as "N Years" (whole) or "N Years M Months", guarding
    // against rounding a fraction like 24.999 up into a stray "24 Years 12 Months".
    const formatYearsMonths = (years: number): string => {
      let wholeYears = Math.floor(years);
      let months = Math.round((years - wholeYears) * 12);
      if (months === 12) { months = 0; wholeYears += 1; }
      return months > 0 ? `${wholeYears} Years ${months} Months` : `${wholeYears} Years`;
    };

    if (resultObj.acceleratedResults) {
      // M-3: don't report a payoff time when the accelerated loan never actually clears
      // within the simulation.
      effectiveAmortizationResultsElement.textContent = resultObj.acceleratedResults.payoffAchieved
        ? formatYearsMonths(resultObj.acceleratedResults.payoffYears)
        : 'Does Not Pay Off';
      acceleratedResultsTimeSavedResultsElement.textContent = resultObj.acceleratedResults.payoffAchieved
        ? resultObj.acceleratedResults.timeSaved
        : '';
      acceleratedResultsTimeSavedResultsElement.style.display = resultObj.acceleratedResults.payoffAchieved ? 'unset' : 'none';
    } else if (isInterestOnly) {
      effectiveAmortizationResultsElement.textContent = 'Never (Interest Only)';
      acceleratedResultsTimeSavedResultsElement.style.display = 'none';
    } else {
      // F1: for monthly / true bi-weekly / true weekly, effectiveAmortizationYears always
      // equals amortizationValue exactly, so this renders identically to the old flat
      // "${amortizationValue} Years" text. For the two accelerated frequencies it's
      // genuinely shorter than amortizationValue.
      effectiveAmortizationResultsElement.textContent = formatYearsMonths(resultObj.effectiveAmortizationYears || amortizationValue || 25);
      acceleratedResultsTimeSavedResultsElement.style.display = 'none';
    }

    fiveYearBreakdownTotalPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.totalPaid);
    fiveYearBreakdownInterestPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.interestPaid);
    fiveYearBreakdownPrincipalPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.principalPaid);
    fiveYearBreakdownBalanceRemainingResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.balanceRemaining);

    // M-10: this used to print resultObj.loanAmount (the original loan amount) unconditionally
    // rather than the principal actually paid down - nearly a no-op for regular loans but
    // materially wrong for interest-only loans, which show $0 actually paid, not the full
    // loan amount.
    totalBreakdownPrincipalPaidResultsElement.textContent = formatCurrency(resultObj.totalPrincipalPaid);
    totalBreakdownInterestPaidResultsElement.textContent = formatCurrency(resultObj.totalInterest);
    totalBreakdownTotalCostResultsElement.textContent = formatCurrency(resultObj.totalCost);

    if (resultObj.acceleratedResults && resultObj.acceleratedResults.payoffAchieved) {
      totalSavingsInterestResultsElement.textContent = formatCurrency(resultObj.acceleratedResults.totalInterestSaved);
      totalSavingsTimeResultsElement.textContent = resultObj.acceleratedResults.timeSaved;
      totalSavingsTotalMoneyResultsElement.textContent = formatCurrency(resultObj.acceleratedResults.totalInterestSaved);
      savingsWithAcceleratedPaymentsResultsElement.style.display = 'unset';
    } else {
      // M-3: never show a payoff-time / savings panel (and never a negative "savings"
      // figure) when the accelerated loan didn't actually clear within the simulation.
      savingsWithAcceleratedPaymentsResultsElement.style.display = 'none';
    }
  }

  formatInput(purchasePriceInput, '$', 'purchase-price', purchasePriceErrorElement);
  updateSliderBackground(purchasePriceInputSlider);


  formatInput(interestRateInput, '%', 'interest-rate', interestRateErrorElement);
  updateSliderBackground(interestRateInputSlider);

  formatInput(amortizationInput, 'Years', 'amortization-period', amortizationErrorElement);
  updateSliderBackground(amortizationInputSlider);

  formatInput(paymentIncreaseInput, '$', 'payment-increase', paymentIncreaseErrorElement);
  updateSliderBackground(paymentIncreaseInputSlider);

  formatInput(oneTimePrePaymentInput, '$', 'one-time-pre-payment', oneTimePrePaymentErrorElement);
  updateSliderBackground(oneTimePrePaymentInputSlider);

  updateResults();
}
