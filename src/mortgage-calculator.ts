import { calculateMortgage, formatCurrency } from './utils-mortgage-calculator';
import RateIcon from './assets/icons/rate.svg';
import LoadDetailsIcon from './assets/icons/loan-details.svg';
import CalculatorSettingsIcon from './assets/icons/calculator-settings.svg'
import PayMortgageFasterIcon from './assets/icons/pay-mortgage-faster.svg';
import AmortizationPeriodIcon from './assets/icons/amortization-period.svg';
import DropdownIcon from './assets/icons/dropdown-icon.svg';

export function initMortgageCalculator(container: HTMLElement, applyUrl: string) {
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
          <input type="range" min="100000" max="2000000" value="500000" step="10000" class="slider">
          <div class="range-label">
            <span>$100K</span>
            <span>$2M</span>
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
          <input type="range" min="1" max="10" value="6" step="0.1" class="slider">
          <div class="range-label">
            <span>1%</span>
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
            <div class="opt off selected"></div>
            <div class="opt on"></div>
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
          <input type="range" min="0" max="2000" value="0" step="25" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$2,000</span>
          </div>
        </div>
        <div class="input-field one-time-pre-payment">
          <div class="field-label">One time Pre-Payment</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <input type="range" min="0" max="100000" value="0" step="1000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$100K</span>
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



  const purchasePriceInput = document.querySelector('.purchase-price .value-input') as HTMLInputElement;
  const purchasePriceInputSlider = document.querySelector('.purchase-price .slider') as HTMLInputElement;

  const interestRateInput = document.querySelector('.interest-rate .value-input') as HTMLInputElement;
  const interestRateInputSlider = document.querySelector('.interest-rate .slider') as HTMLInputElement;

  const amortizationInput = document.querySelector('.amortization .value-input') as HTMLInputElement;
  const amortizationInputSlider = document.querySelector('.amortization .slider') as HTMLInputElement;

  const paymentIncreaseInput = document.querySelector('.payment-increase .value-input') as HTMLInputElement;
  const paymentIncreaseInputSlider = document.querySelector('.payment-increase .slider') as HTMLInputElement;

  const oneTimePrePaymentInput = document.querySelector('.one-time-pre-payment .value-input') as HTMLInputElement;
  const oneTimePrePaymentInputSlider = document.querySelector('.one-time-pre-payment .slider') as HTMLInputElement;

  const paymentFrequencyValueElement = document.querySelector('.payment-frequency .dropdown-field span') as HTMLInputElement;
  const termLengthValueElement = document.querySelector('.term-length .dropdown-field span') as HTMLInputElement;

  const mortgagePaymentResultsElement = document.querySelector('.mortgage-calculator-results .mortgage-payment .value') as HTMLInputElement;

  const principalPaidResultsElement = document.querySelector('.mortgage-calculator-results .payment-breakdown .principal-paid .value') as HTMLInputElement;
  const interestPaidResultsElement = document.querySelector('.mortgage-calculator-results .payment-breakdown .interest-paid .value') as HTMLInputElement;
  const breakdownTotalPaymentResultsElement = document.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-total-payment .value') as HTMLInputElement;
  const breakdownBarPrincipalResultsElement = document.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-bar-principal') as HTMLInputElement;
  const breakdownBarInterestResultsElement = document.querySelector('.mortgage-calculator-results .payment-breakdown .breakdown-bar-interest') as HTMLInputElement;

  const balanceEndOfTermResultsElement = document.querySelector('.mortgage-calculator-results .balance-amortization .balance .value') as HTMLInputElement;
  const effectiveAmortizationResultsElement = document.querySelector('.mortgage-calculator-results .balance-amortization .amortization .value') as HTMLInputElement;
  const acceleratedResultsTimeSavedResultsElement = document.querySelector('.mortgage-calculator-results .balance-amortization .duration .tag') as HTMLInputElement;


  const fiveYearBreakdownTotalPaidResultsElement = document.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const fiveYearBreakdownInterestPaidResultsElement = document.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(3) .value') as HTMLInputElement;
  const fiveYearBreakdownPrincipalPaidResultsElement = document.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(4) .value') as HTMLInputElement;
  const fiveYearBreakdownBalanceRemainingResultsElement = document.querySelector('.mortgage-calculator-results .five-year-breakdown .info-row:nth-of-type(5) .value') as HTMLInputElement;

  const totalBreakdownPrincipalPaidResultsElement = document.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const totalBreakdownInterestPaidResultsElement = document.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(3) .value') as HTMLInputElement;
  const totalBreakdownTotalCostResultsElement = document.querySelector('.mortgage-calculator-results .total-breakdown .info-row:nth-of-type(4) .value') as HTMLInputElement;

  const savingsWithAcceleratedPaymentsResultsElement = document.querySelector('.savings-with-accelerated-payments') as HTMLInputElement;
  const totalSavingsInterestResultsElement = document.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .info-row:nth-of-type(1) .value') as HTMLInputElement;
  const totalSavingsTimeResultsElement = document.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .info-row:nth-of-type(2) .value') as HTMLInputElement;
  const totalSavingsTotalMoneyResultsElement = document.querySelector('.mortgage-calculator-results .savings-with-accelerated-payments .total-money-saved .btn-value') as HTMLInputElement;

  const paymentIncreasePercentageElement = document.querySelector('.mortgage-calculator-input .payment-increase .percentage-value-input') as HTMLInputElement;

  const calculatorSettingsSelectorElements = document.querySelectorAll('.calculator-settings .btn-group-selector .selector');
  const compoundingValueElement = document.querySelector('.calculator-settings .dropdown-field span') as HTMLInputElement;
  const PayMortgageFasterToggleSelectorElements = document.querySelectorAll('.pay-mortgage-faster .opt');

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

  calculatorSettingsSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      calculatorSettingsSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      updateResults();
    });
  });

  PayMortgageFasterToggleSelectorElements.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      PayMortgageFasterToggleSelectorElements.forEach(h => h.classList.remove('selected'));
      selector.classList.add('selected');

      selector.parentElement?.classList.remove('switched-on');
      selector.parentElement?.parentElement?.parentElement?.nextElementSibling?.classList.remove('expanded');
      if (selector.classList.contains('on')) {
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

  purchasePriceInputSlider.addEventListener("input", () => {
    const inputValue = purchasePriceInputSlider.value.replace(/[^0-9.]/g, '');
    purchasePriceInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    purchasePriceInput.dataset.previousValue = inputValue;
    updateSliderBackground(purchasePriceInputSlider);
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

  paymentIncreaseInputSlider.addEventListener("input", () => {
    const inputValue = paymentIncreaseInputSlider.value.replace(/[^0-9.]/g, '');
    paymentIncreaseInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    paymentIncreaseInput.dataset.previousValue = inputValue;
    updateSliderBackground(paymentIncreaseInputSlider);
    updateResults();
  });

  oneTimePrePaymentInputSlider.addEventListener("input", () => {
    const inputValue = oneTimePrePaymentInputSlider.value.replace(/[^0-9.]/g, '');
    oneTimePrePaymentInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    oneTimePrePaymentInput.dataset.previousValue = inputValue;
    updateSliderBackground(oneTimePrePaymentInputSlider);
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
            if (1 <= numericValue && numericValue <= 40) {
              amortizationInputSlider.value = numericValue.toString();
              updateSliderBackground(amortizationInputSlider);
              target.value = `${parseInt(value).toLocaleString('en-US')} ${symbol}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${parseInt(target.dataset.previousValue).toLocaleString('en-US')} ${symbol}`;
            }
            break;

          case "payment-increase":
            if (0 <= numericValue && numericValue <= 2000) {
              paymentIncreaseInputSlider.value = numericValue.toString();
              updateSliderBackground(paymentIncreaseInputSlider);
              target.value = `${symbol}  ${parseInt(value).toLocaleString('en-US')}`;
              target.dataset.previousValue = value;
            } else if (target.dataset.previousValue) {
              target.value = `${symbol}  ${parseInt(target.dataset.previousValue).toLocaleString('en-US')}`;
            }
            break;

          case "one-time-pre-payment":
            if (0 <= numericValue && numericValue <= 100000) {
              oneTimePrePaymentInputSlider.value = numericValue.toString();
              updateSliderBackground(oneTimePrePaymentInputSlider);
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
    const loanAmountValue = purchasePriceInput.dataset.previousValue ? parseInt(purchasePriceInput.dataset.previousValue) : 0;
    const interestRateValue = interestRateInput.dataset.previousValue ? parseFloat(parseFloat(interestRateInput.dataset.previousValue).toFixed(2)) : 0;
    const amortizationValue = amortizationInput.dataset.previousValue ? parseInt(amortizationInput.dataset.previousValue) : 1;
    const paymentFrequencyValue = paymentFrequencyValueElement.textContent ? paymentFrequencyValueElement.textContent.toLowerCase() : "monthly";
    const paymentIncreaseValue = paymentIncreaseInput.dataset.previousValue ? parseInt(paymentIncreaseInput.dataset.previousValue) : 0;
    const loanTypeActiveSelector = document.querySelector('.calculator-settings .btn-group-selector .selector.active');

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

    const inputData: any = {
      loanAmount: loanAmountValue,
      interestRate: interestRateValue,
      rateTerm: termLengthValueElement.textContent ? parseInt(termLengthValueElement.textContent.replace(" years", "").replace(" year", "")) : 5,
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

    mortgagePaymentResultsElement.textContent = resultObj.acceleratedResults ? formatCurrency(resultObj.acceleratedResults.adjustedPayment) : formatCurrency(resultObj.mortgagePayment);

    principalPaidResultsElement.textContent = formatCurrency(resultObj.principal);
    interestPaidResultsElement.textContent = formatCurrency(resultObj.interest);
    breakdownTotalPaymentResultsElement.textContent = resultObj.acceleratedResults ? formatCurrency(resultObj.acceleratedResults.adjustedPayment) : formatCurrency(resultObj.mortgagePayment);
    breakdownBarPrincipalResultsElement.style.width = `${principalPercent.toString()}%`;
    breakdownBarInterestResultsElement.style.width = `${interestPercent.toString()}%`;

    balanceEndOfTermResultsElement.textContent = formatCurrency(resultObj.balanceEndOfTerm);
    effectiveAmortizationResultsElement.textContent = resultObj.acceleratedResults ? `${Math.floor(resultObj.acceleratedResults.payoffYears)} Years ${Math.round((resultObj.acceleratedResults.payoffYears - Math.floor(resultObj.acceleratedResults.payoffYears)) * 12)} Months` : `${amortizationValue || 25} Years`;
    if (resultObj.acceleratedResults) {
      acceleratedResultsTimeSavedResultsElement.textContent = resultObj.acceleratedResults.timeSaved;
      acceleratedResultsTimeSavedResultsElement.style.display = 'unset';
    } else {
      acceleratedResultsTimeSavedResultsElement.style.display = 'none';
    }

    fiveYearBreakdownTotalPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.totalPaid);
    fiveYearBreakdownInterestPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.interestPaid);
    fiveYearBreakdownPrincipalPaidResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.principalPaid);
    fiveYearBreakdownBalanceRemainingResultsElement.textContent = formatCurrency(resultObj.fiveYearBreakdown.balanceRemaining);

    totalBreakdownPrincipalPaidResultsElement.textContent = formatCurrency(resultObj.loanAmount);
    totalBreakdownInterestPaidResultsElement.textContent = formatCurrency(resultObj.totalInterest);
    totalBreakdownTotalCostResultsElement.textContent = formatCurrency(resultObj.totalCost);

    if (resultObj.acceleratedResults) {
      totalSavingsInterestResultsElement.textContent = formatCurrency(resultObj.acceleratedResults.totalInterestSaved);
      totalSavingsTimeResultsElement.textContent = resultObj.acceleratedResults.timeSaved;
      totalSavingsTotalMoneyResultsElement.textContent = formatCurrency(resultObj.acceleratedResults.totalInterestSaved);
      savingsWithAcceleratedPaymentsResultsElement.style.display = 'unset';
    } else {
      savingsWithAcceleratedPaymentsResultsElement.style.display = 'none';
    }
  }

  formatInput(purchasePriceInput, '$', 'purchase-price');
  updateSliderBackground(purchasePriceInputSlider);


  formatInput(interestRateInput, '%', 'interest-rate');
  updateSliderBackground(interestRateInputSlider);

  formatInput(amortizationInput, 'Years', 'amortization-period');
  updateSliderBackground(amortizationInputSlider);

  formatInput(paymentIncreaseInput, '$', 'payment-increase');
  updateSliderBackground(paymentIncreaseInputSlider);

  formatInput(oneTimePrePaymentInput, '$', 'one-time-pre-payment');
  updateSliderBackground(oneTimePrePaymentInputSlider);

  updateResults();
}
