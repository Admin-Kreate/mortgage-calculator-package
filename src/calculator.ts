import { calculateMortgage } from './utils';

export function initCalculator(container: HTMLElement, applyUrl: string) {
    container.innerHTML = `
    <div class="mortgage-calculator">
        <div class="section-heading"><span>Mortgage</span> Payment <span>Calculator</span></div>
        <div class="calculator-fields">
          <div class="mortgage-amount-wrapper">
            <div class="calculator-floating-label-field">
              <label>Mortgage Amount</label>
              <input type="text" id="mortgage-amount-field" />
            </div>
          </div>
          <div class="rate-amortization-period-wrapper">
            <div class="calculator-fixed-label-field">
              <label>Rates</label>
              <input type="text" id="rate-field" />
            </div>
            <div class="calculator-fixed-label-field">
              <label>Amortization</label>
              <select id="amortization-field">
                <option value="10">10 years</option>
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="25">25 years</option>
              </select>
            </div>
            <div class="calculator-fixed-label-field">
              <label>Payment Period</label>
              <select id="payment-period-field">
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div class="apply-wrapper">
            <div id="mortagage-payment"></div>
            <a class="mortgage-apply-link disabled" href="${applyUrl}" target="_blank">Apply</button>
          </div>
        </div>
    </div>
  `;

    const mortgageAmountInput = document.getElementById('mortgage-amount-field') as HTMLInputElement;
    const rateInput = document.getElementById('rate-field') as HTMLInputElement;
    const amortizationSelect = document.getElementById('amortization-field') as HTMLSelectElement;
    const paymentPeriodSelect = document.getElementById('payment-period-field') as HTMLSelectElement;

    // Reusable function for handling dollar sign and percentage symbol formatting
    const formatInput = (inputElement: HTMLInputElement, symbol: string) => {
        inputElement.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            if (target) {
                let value = target.value;
                value = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters

                // Reapply the symbol (either $ or %)
                target.value = value ? symbol === '$' ? `${symbol}${parseInt(value).toLocaleString('en-US')}` : `${value}${symbol}` : '';
            }
        });
    };

    // Add formatting for currency and percentage inputs
    formatInput(mortgageAmountInput, '$');
    formatInput(rateInput, '%');

    // Attach event listeners to each input/select field to auto-calculate on change
    mortgageAmountInput.addEventListener('input', handleCalculation);
    rateInput.addEventListener('input', handleCalculation);
    amortizationSelect.addEventListener('change', handleCalculation);
    paymentPeriodSelect.addEventListener('change', handleCalculation);

    rateInput.addEventListener("focus", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.add("child-input-focused");
    });
    rateInput.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.remove("child-input-focused");
    });

    amortizationSelect.addEventListener("focus", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.add("child-input-focused");
    });
    amortizationSelect.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.remove("child-input-focused");
    });

    paymentPeriodSelect.addEventListener("focus", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.add("child-input-focused");
    });
    paymentPeriodSelect.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        target.parentElement?.classList.remove("child-input-focused");
    });
}

function handleCalculation() {
    const mortgageAmountInput = document.getElementById('mortgage-amount-field') as HTMLInputElement;
    const rateInput = document.getElementById('rate-field') as HTMLInputElement;
    const amortizationSelect = document.getElementById('amortization-field') as HTMLSelectElement;
    const paymentPeriodSelect = document.getElementById('payment-period-field') as HTMLSelectElement;
    const mortagagePaymentElement = document.getElementById('mortagage-payment') as HTMLParagraphElement;
    const applyLink = document.querySelector('.mortgage-apply-link') as HTMLAnchorElement;

    const mortgageAmount = parseFloat(mortgageAmountInput.value.replace(/\$/g, '').replace(/\,/g, ''));
    const rate = parseFloat(rateInput.value.replace(/%/g, ''));
    const amortization = parseInt(amortizationSelect.value);
    const paymentPeriod = paymentPeriodSelect.value;

    if (isNaN(mortgageAmount) || isNaN(rate) || isNaN(amortization) || !paymentPeriod) {
        mortagagePaymentElement.textContent = "";
        if (!applyLink.classList.contains("disabled")) {
            applyLink.classList.add("disabled");
        }
        return;
    }

    const payment = calculateMortgage(mortgageAmount, rate, amortization, paymentPeriod);
    mortagagePaymentElement.textContent = `$${parseFloat(payment.toFixed(2)).toLocaleString('en-US')}`;

    if (applyLink.classList.contains("disabled")) {
        applyLink.classList.remove("disabled");
    }
}
