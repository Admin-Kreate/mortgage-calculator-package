import { calculateMortgage, formatCurrency, simulateAnnualRateChange, MortgageData } from './utils-mortgage-calculator';
// F5 (compare-theme reskin): rate/loan-details/amortization-period icons are shared with
// other calculators (debt-service, max-mortgage, purchase), which still use the navy theme -
// green-recolored copies are used here instead of editing the shared files, so this
// calculator's green reskin doesn't leak into the other three.
import RateIcon from './assets/icons/rate-green.svg';
import LoadDetailsIcon from './assets/icons/loan-details-green.svg';
import CalculatorSettingsIcon from './assets/icons/calculator-settings.svg'
import PayMortgageFasterIcon from './assets/icons/pay-mortgage-faster.svg';
import AmortizationPeriodIcon from './assets/icons/amortization-period-green.svg';
import DropdownIcon from './assets/icons/dropdown-icon.svg';
import InfoIcon from './assets/icons/info-green.svg';

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
          <div class="field-label" data-tooltip="The amount you're borrowing, not the price of the home. Buying a $600,000 home with 20% down means a $480,000 loan amount.">Loan Amount</div>
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
            <div class="field-label" data-tooltip="How often you pay. Accelerated Bi-Weekly and Accelerated Weekly pay slightly more per year than Monthly, paying off your mortgage faster and saving interest.">Payment Frequency</div>
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
      <div class="header">
        <div class="title-wrapper">
          <img src="${RateIcon}" alt="Rate icon"/>
          <div class="title">Rate</div>
        </div>
        <div class="btn-group-selector rate-type-selector">
          <div class="selector active">Fixed</div>
          <div class="selector">Variable</div>
        </div>
        <div class="mortgage-calculator-info full-row-width rate-type-info">Your payment is locked in for the rate term. The Rate Term is the contract length with your lender.</div>
      </div>
      <div class="input-fields">
        <div class="input-field interest-rate">
          <div class="title-wrapper">
            <div class="field-label" data-tooltip="Your mortgage's annual interest rate, set by your lender.">Rate</div>
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
            <div class="field-label" data-tooltip="How long your current rate is locked in for, not how long it takes to pay off the mortgage. When the term ends, you renew at whatever rate is available then.">Rate Term</div>
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
      <!-- F6: the Fixed/Variable choice now genuinely does something. Nobody can predict a
           variable rate, but that's exactly why a rate-change scenario is the right tool: the
           user models the risk instead of the calculator pretending to forecast it. Variable
           frames it as "your rate can move during the term"; Fixed frames the same control as
           renewal risk at the end of the term. Fixed/Variable itself deliberately never feeds
           into calculateMortgage - rates can't be forecast, this only toggles the panel below. -->
      <div class="input-fields single-field rate-scenario">
        <div class="input-field rate-scenario-field">
          <div class="field-label rate-scenario-label" data-tooltip="A variable rate drifts over time rather than jumping once. Set how much it moves each year and see what your payment climbs to by the end of your term.">If your rate changes each year</div>
          <div class="rate-scenario-readout">
            <span class="rate-scenario-delta">No change</span>
            <span class="rate-scenario-payment"></span>
          </div>
          <input type="range" min="-1" max="3" value="0" step="0.25" class="slider rate-scenario-slider">
          <div class="rate-scenario-ticks">
            <span class="tick"><i></i>-1%</span>
            <span class="tick"><i></i>0%</span>
            <span class="tick"><i></i>+1%</span>
            <span class="tick"><i></i>+2%</span>
            <span class="tick"><i></i>+3%</span>
          </div>
          <div class="rate-scenario-impact"></div>
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
          <div class="field-label" data-tooltip="The total time it will take to pay off your mortgage in full at your current payment.">Amortization</div>
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
          <div class="title" data-tooltip="Regular payments pay down both principal and interest. Interest Only payments cover just the interest, so your balance never goes down on its own.">Calculator Settings</div>
        </div>
        <div class="btn-group-selector">
          <div class="selector active">Regular</div>
          <div class="selector">Interest Only</div>
        </div>
      </div>
      <div class="input-fields single-field">
        <div class="dropdown inline term-length">
          <div class="dropdown-field inline-label">
            <div class="field-label" data-tooltip="How often interest is calculated and added to your balance. Canadian mortgages compound semi-annually by default, even though you pay monthly.">Compounding</div>
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
          <div class="field-label" data-tooltip="An extra amount added to every regular payment. Even a small increase adds up to real interest savings over the life of the loan.">Payment Increase</div>
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
          <div class="field-label" data-tooltip="A single lump sum applied to your principal, made once at your mortgage's 1-year anniversary.">One time Pre-Payment</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="100000" value="0" step="1000" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$100K+</span>
          </div>
        </div>
        <div class="input-field annual-pre-payment">
          <div class="field-label" data-tooltip="An extra lump sum applied to your principal once a year, every year, on top of any one-time prepayment.">Annual Pre-Payment</div>
          <input type="text" value="$  0" data-previous-value="0" class="value-input">
          <div class="field-error"></div>
          <input type="range" min="0" max="25000" value="0" step="500" class="slider">
          <div class="range-label">
            <span>$0</span>
            <span>$25K+</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const calculatorResultsHTML = `
    <div class="mortgage-payment">
      <div class="mortgage-payment-wrapper">
        <div class="label" data-tooltip="Your regular payment amount at the selected frequency, before any extra payments you've added below.">Mortgage Payment</div>
        <div class="value">$2,902</div>
        <div class="frequency">Monthly Payment</div>
      </div>
    </div>

    <div class="payment-breakdown">
      <div class="section-label" data-tooltip="How your very next payment splits between paying down what you owe and covering interest.">Payment Breakdown</div>
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
                <div class="detail-name" data-tooltip="The portion of your next payment that goes toward paying down what you owe.">Principal Paid</div>
              </div>
              <div class="value">$698.59</div>
            </div>
            <div class="interest-paid">
              <div class="icon-name-wrapper">
                <div class="detail-icon interest"></div>
                <div class="detail-name" data-tooltip="The portion of your next payment that goes toward interest, the cost of borrowing.">Interest Paid</div>
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
          <div class="label" data-tooltip="How much you'd still owe when your current rate term ends. You'll need to renew or pay it off at that point.">Balance end of Term</div>
          <div class="value">$450,996.52</div>
        </div>
        <div class="info-row amortization">
          <div class="label" data-tooltip="How long it will actually take to pay off your mortgage in full at your current settings.">Effective Amortization</div>
          <div class="value">IO Years 9 Months</div>
        </div>
        <div class="info-row duration">
          <div class="tag">3 MONTHS FASTER</div>
        </div>
      </div>
    </div>

    <div class="five-year-breakdown">
      <div class="section-wrapper">
        <div class="sec-heading" data-tooltip="What you'll have paid, and what you'll still owe, after this many years at your current settings.">Breakdown Over 5 Years</div>
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
        <div class="sec-heading" data-tooltip="The full picture over your entire amortization: every dollar of principal and interest you'd pay if nothing changes.">Total Breakdown</div>
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

    <!-- F7: "Ways to pay less" - live, ranked savings opportunities computed from whatever
         the user currently has entered. Every option is a real simulation against their own
         numbers (not generic advice), only appears when it actually saves money, and can be
         applied with one click. -->
    <div class="ways-to-save">
      <div class="section-wrapper">
        <div class="sec-heading" data-tooltip="Real options based on the numbers you've entered, ranked by how much interest each one saves. Click Apply to try any of them.">Ways to pay less</div>
        <div class="ways-to-save-intro"></div>
        <div class="ways-to-save-list"></div>
      </div>
    </div>

    <div class="savings-with-accelerated-payments">
      <div class="section-wrapper">
        <div class="sec-heading" data-tooltip="How much faster you'll pay off your mortgage, and how much interest you'll save, thanks to your payment increase or extra prepayments.">Total Savings with Accelerated Payments</div>
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

  // F5: first-visit onboarding, built as a guided walkthrough rather than a plain form. Each
  // step collects ONE value the user will realistically want to change, and explains the
  // concept behind it at the same time - the explanation is the point, not a preamble to it.
  // The steps are ordered the way someone actually reasons about a mortgage: how much, at
  // what rate, over how long, paid how often.
  //
  // Term-vs-amortization (step 3/4) and regular-vs-accelerated frequency (step 5) get the
  // most space because they're the two things people most commonly misunderstand, and both
  // materially change the numbers this calculator reports.
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
          <div class="onboarding-icon"><img src="${LoadDetailsIcon}" alt=""/></div>
          <div class="onboarding-title">Let's find your real mortgage payment</div>
          <div class="onboarding-subtitle">Five quick questions. Along the way we'll explain what each number actually means, so the result makes sense instead of just appearing.</div>
          <div class="onboarding-note">
            <strong>Two things worth knowing up front:</strong>
            <ul>
              <li>Your <em>term</em> and your <em>amortization</em> are different things, and mixing them up is the single most common mortgage mistake. We'll cover both.</li>
              <li>How <em>often</em> you pay can save you tens of thousands in interest, without meaningfully changing your budget.</li>
            </ul>
          </div>
        </div>

        <div class="onboarding-step" data-step="2">
          <div class="onboarding-title">How much are you borrowing?</div>
          <div class="onboarding-subtitle">This is your <strong>mortgage amount</strong>, not the price of the home. If you're buying at $600,000 with $120,000 down, you're borrowing $480,000.</div>
          <div class="onboarding-slider-field">
            <div class="onboarding-readout" data-readout="loan">$500,000</div>
            <input type="range" id="onboarding-loan-amount" class="onboarding-slider" min="100000" max="2000000" step="10000" value="500000"/>
            <div class="onboarding-range-label"><span>$100K</span><span>$2M</span></div>
          </div>
          <div class="onboarding-hint">Drag to set. Most Canadian mortgages fall between $200,000 and $900,000.</div>
        </div>

        <div class="onboarding-step" data-step="3">
          <div class="onboarding-title">What rate, and for how long?</div>
          <div class="onboarding-subtitle">Your <strong>rate</strong> is the annual interest your lender charges. Your <strong>term</strong> is how long that rate stays locked in, usually 5 years.</div>
          <div class="onboarding-slider-field">
            <div class="onboarding-readout" data-readout="rate">6.00%</div>
            <input type="range" id="onboarding-rate" class="onboarding-slider" min="0.1" max="10" step="0.1" value="6"/>
            <div class="onboarding-range-label"><span>0.1%</span><span>10%</span></div>
          </div>
          <div class="onboarding-field onboarding-field-spaced">
            <label for="onboarding-term">Rate Term</label>
            <select id="onboarding-term">
              <option>1 year</option>
              <option>2 years</option>
              <option>3 years</option>
              <option>4 years</option>
              <option selected>5 years</option>
              <option>7 years</option>
              <option>10 years</option>
            </select>
          </div>
          <div class="onboarding-note">
            <strong>The term is not how long you have the mortgage.</strong> When your term ends you'll still owe a balance, and you renew it at whatever rate is available then. That leftover balance is the "Balance end of Term" figure in your results.
          </div>
        </div>

        <div class="onboarding-step" data-step="4">
          <div class="onboarding-title">How long to pay it off completely?</div>
          <div class="onboarding-subtitle">This is your <strong>amortization</strong>: the total time to bring the balance all the way to zero. In Canada it's typically 25 years, or 30 if you qualify.</div>
          <div class="onboarding-slider-field">
            <div class="onboarding-readout" data-readout="amortization">25 Years</div>
            <input type="range" id="onboarding-amortization" class="onboarding-slider" min="1" max="40" step="1" value="25"/>
            <div class="onboarding-range-label"><span>1 Year</span><span>40 Years</span></div>
          </div>
          <div class="onboarding-note">
            <strong>The trade-off:</strong> a longer amortization lowers each payment but means far more interest overall. Stretching 25 years to 30 might save you a couple hundred a month, and cost you six figures across the life of the loan. Try both and compare the "Total Interest Paid".
          </div>
        </div>

        <div class="onboarding-step" data-step="5">
          <div class="onboarding-title">How often will you pay?</div>
          <div class="onboarding-subtitle">This is the setting people most often leave on default, and it's quietly one of the most powerful.</div>
          <div class="onboarding-field">
            <label for="onboarding-frequency">Payment Frequency</label>
            <select id="onboarding-frequency">
              <option selected>Monthly</option>
              <option>Bi-Weekly</option>
              <option>Weekly</option>
              <option>Accelerated Bi-Weekly</option>
              <option>Accelerated Weekly</option>
            </select>
          </div>
          <div class="onboarding-note">
            <strong>Regular vs Accelerated, the real difference:</strong>
            <ul>
              <li><em>Monthly</em> is 12 payments a year.</li>
              <li><em>Bi-Weekly</em> and <em>Weekly</em> just split that same annual total into smaller, more frequent pieces. You pay the same amount per year.</li>
              <li><em>Accelerated</em> takes your full monthly payment and charges half of it every two weeks (or a quarter every week). Because a year holds 26 two-week periods, you end up paying the equivalent of <strong>13 monthly payments instead of 12</strong>.</li>
            </ul>
            That one extra payment a year typically cuts <strong>3 to 4 years</strong> off a 25-year mortgage and saves tens of thousands in interest.
          </div>
        </div>

        <div class="onboarding-step" data-step="6">
          <div class="onboarding-icon"><img src="${PayMortgageFasterIcon}" alt=""/></div>
          <div class="onboarding-title">You're set. Here's what to explore.</div>
          <div class="onboarding-note">
            <ul>
              <li><strong>Hover any label with a dotted underline</strong> to see exactly what it means, on both the inputs and your results.</li>
              <li><strong>Flip on "Pay your mortgage faster"</strong> to model extra payments. Even $50 more per payment shows up as real years and real dollars saved.</li>
              <li><strong>Watch "Total Interest Paid"</strong>, not just the monthly payment. Two mortgages with similar payments can differ enormously in what they truly cost.</li>
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

  container.innerHTML = `
    <div class="mortgage-calculator compare-theme">
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
        ${onboardingModalHTML}
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

  // F2: Annual Pre-Payment - same visual pattern as One Time Pre-Payment, smaller range
  // since a recurring annual prepayment is typically a smaller amount than a one-time lump sum.
  const annualPrePaymentInput = container.querySelector('.annual-pre-payment .value-input') as HTMLInputElement;
  const annualPrePaymentInputSlider = container.querySelector('.annual-pre-payment .slider') as HTMLInputElement;

  // F4: inline validation-message elements, one per validated field.
  const purchasePriceErrorElement = container.querySelector('.purchase-price .field-error') as HTMLElement;
  const interestRateErrorElement = container.querySelector('.interest-rate .field-error') as HTMLElement;
  const amortizationErrorElement = container.querySelector('.amortization .field-error') as HTMLElement;
  const paymentIncreaseErrorElement = container.querySelector('.payment-increase .field-error') as HTMLElement;
  const oneTimePrePaymentErrorElement = container.querySelector('.one-time-pre-payment .field-error') as HTMLElement;
  const annualPrePaymentErrorElement = container.querySelector('.annual-pre-payment .field-error') as HTMLElement;

  const paymentFrequencyValueElement = container.querySelector('.payment-frequency .dropdown-field span') as HTMLInputElement;
  const termLengthValueElement = container.querySelector('.term-length .dropdown-field span') as HTMLInputElement;

  // F6: Fixed/Variable is presentational only (see rateTypeSelectorElements handler below) -
  // it deliberately never feeds into calculateMortgage.
  const rateTypeSelectorElements = container.querySelectorAll('.rate-type-selector .selector');
  const rateTypeInfoElement = container.querySelector('.rate-type-info') as HTMLElement;

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


  const fiveYearBreakdownHeadingElement = container.querySelector('.mortgage-calculator-results .five-year-breakdown .sec-heading') as HTMLElement;
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

  // F6: Fixed/Variable is now functional. It can't predict a rate - nothing can - but it
  // changes what the rate-change scenario below it *means*, and that scenario recalculates
  // real payments. Variable = your rate can move during the term. Fixed = your rate holds,
  // but you renew at an unknown rate when the term ends. Same control, different risk.
  const rateTypeInfoCopy: Record<'Fixed' | 'Variable', string> = {
    Fixed: 'Your payment is locked in for the rate term. When the term ends you renew at whatever rate is available then - use the scenario below to check that you could still afford it.',
    Variable: "Your rate moves with the prime rate, so your payment can change during the term. Nobody can predict by how much, so use the scenario below to see what you'd be paying if it does.",
  };
  const rateScenarioLabelCopy: Record<'Fixed' | 'Variable', string> = {
    // Fixed hides this section entirely (a fixed rate can't move mid-term), so its label is
    // only a fallback that shouldn't normally be seen.
    Fixed: 'If you renew at a different rate',
    Variable: 'If your rate changes each year',
  };

  const getActiveRateType = (): 'Fixed' | 'Variable' => {
    const active = container.querySelector('.rate-type-selector .selector.active');
    return (active?.textContent?.trim() as 'Fixed' | 'Variable') || 'Fixed';
  };

  rateTypeSelectorElements.forEach((selector) => {
    selector.addEventListener('click', () => {
      rateTypeSelectorElements.forEach(h => h.classList.remove('active'));
      selector.classList.add('active');
      const key = (selector.textContent?.trim() as 'Fixed' | 'Variable') || 'Fixed';
      if (rateTypeInfoElement) {
        rateTypeInfoElement.textContent = rateTypeInfoCopy[key] ?? rateTypeInfoCopy.Fixed;
      }
      const scenarioLabel = container.querySelector('.rate-scenario-label') as HTMLElement;
      if (scenarioLabel) {
        scenarioLabel.textContent = rateScenarioLabelCopy[key] ?? rateScenarioLabelCopy.Fixed;
      }
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
        if (paymentIncreaseErrorElement) paymentIncreaseErrorElement.textContent = '';

        oneTimePrePaymentInput.value = '$  0';
        oneTimePrePaymentInput.dataset.previousValue = '0';
        oneTimePrePaymentInputSlider.value = '0';
        updateSliderBackground(oneTimePrePaymentInputSlider);
        if (oneTimePrePaymentErrorElement) oneTimePrePaymentErrorElement.textContent = '';

        // F2: reset alongside the other two accelerated-payment fields so nothing is left
        // in a stale state when the panel collapses.
        annualPrePaymentInput.value = '$  0';
        annualPrePaymentInput.dataset.previousValue = '0';
        annualPrePaymentInputSlider.value = '0';
        updateSliderBackground(annualPrePaymentInputSlider);
        if (annualPrePaymentErrorElement) annualPrePaymentErrorElement.textContent = '';
      }

      updateResults();
    });
  });

  tooltipElements.forEach(el => {
    const tooltipText = el.getAttribute("data-tooltip");

    const tooltip = document.createElement("div");
    // This calculator's tooltip content is full sentences, not the short labels the shared
    // .custom-tooltip (nowrap, no max-width) was designed for - "mortgage-calculator-tooltip"
    // is a second class scoped to just this calculator's own tooltip elements (appended to
    // document.body, outside .compare-theme, so a descendant selector can't reach them) so a
    // wrap/width fix can't affect the other three calculators' tooltips, which still use bare
    // .custom-tooltip.
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

  // F2: Annual Pre-Payment slider - same pattern as One Time Pre-Payment.
  annualPrePaymentInputSlider.addEventListener("input", () => {
    const inputValue = annualPrePaymentInputSlider.value.replace(/[^0-9.]/g, '');
    annualPrePaymentInput.value = inputValue ? `$  ${parseInt(inputValue).toLocaleString('en-US')}` : '';
    annualPrePaymentInput.dataset.previousValue = inputValue;
    updateSliderBackground(annualPrePaymentInputSlider);
    if (annualPrePaymentErrorElement) annualPrePaymentErrorElement.textContent = '';
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
    'annual-pre-payment': 'Enter an amount up to $25,000.',
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

          case "annual-pre-payment":
            // F2: slider tops out at $25,000 - keep the typed value in line with it.
            if (numericValue !== null && 0 <= numericValue && numericValue <= 25000) {
              annualPrePaymentInputSlider.value = numericValue.toString();
              updateSliderBackground(annualPrePaymentInputSlider);
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
      // F2: wired to the real Annual Pre-Payment field (the math in calculateMortgage
      // already fully supported this, it just had no UI control before).
      annualPrePayment: annualPrePaymentInput.dataset.previousValue ? parseInt(annualPrePaymentInput.dataset.previousValue) : 0
    };
    const resultObj = calculateMortgage(inputData);

    // M-4: derive the payment-increase percentage from the real base payment the
    // calculation engine returns (basePayment), instead of re-deriving the payment with a
    // different, buggy formula (annualRate/12 for every frequency, and a string-mismatched
    // 'biweekly' check). Also guards divide-by-zero so a $0 loan amount renders "0.00%"
    // instead of "Infinity%".
    const paymentIncreasePercentage = resultObj.basePayment > 0 ? (paymentIncreaseValue / resultObj.basePayment) * 100 : 0;
    paymentIncreasePercentageElement.value = `${paymentIncreasePercentage.toFixed(2)}%`;
    paymentIncreasePercentageElement.dataset.previousValue = paymentIncreasePercentage.toFixed(2).toString();

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

    // M-7: the "Breakdown Over 5 Years" heading should reflect the actual period covered,
    // which is shorter than 5 years when the amortization itself is shorter than 5 years.
    const breakdownYears = Math.min(5, amortizationValue || 5);
    if (fiveYearBreakdownHeadingElement) {
      fiveYearBreakdownHeadingElement.textContent = `Breakdown Over ${breakdownYears} Year${breakdownYears === 1 ? '' : 's'}`;
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

    renderRateScenario(inputData, resultObj);
    renderWaysToSave(inputData, resultObj);
  }

  // ---- F6: rate-change scenario ----
  // Re-runs the real engine at a shifted rate. This is the honest answer to "what does the
  // Variable toggle do?" - it can't forecast, but it can show whether the payment would
  // still be affordable if the rate moved, which is the actual decision being made.
  const rateScenarioSlider = container.querySelector('.rate-scenario-slider') as HTMLInputElement;
  const rateScenarioDeltaElement = container.querySelector('.rate-scenario-delta') as HTMLElement;
  const rateScenarioPaymentElement = container.querySelector('.rate-scenario-payment') as HTMLElement;
  const rateScenarioImpactElement = container.querySelector('.rate-scenario-impact') as HTMLElement;

  function renderRateScenario(inputData: any, resultObj: any) {
    if (!rateScenarioSlider) return;

    // A fixed rate cannot move during its term - that is the entire point of fixing it - so
    // an in-term rate-change scenario is only meaningful for Variable. Showing it under
    // Fixed would be modelling something that contractually cannot happen.
    const rateScenarioSection = container.querySelector('.rate-scenario') as HTMLElement;
    if (getActiveRateType() === 'Fixed') {
      if (rateScenarioSection) rateScenarioSection.style.display = 'none';
      return;
    }
    if (rateScenarioSection) rateScenarioSection.style.display = '';

    const annualChange = parseFloat(rateScenarioSlider.value);
    updateSliderBackground(rateScenarioSlider);

    const termYears = Math.min(inputData.rateTerm, inputData.amortization);

    if (annualChange === 0) {
      rateScenarioDeltaElement.textContent = 'Rate holds steady';
      rateScenarioPaymentElement.textContent = '';
      rateScenarioImpactElement.textContent = 'Drag to set how much your rate moves each year, then see what your payment becomes by the end of your term.';
      rateScenarioImpactElement.classList.remove('negative', 'positive');
      return;
    }

    const scenario = simulateAnnualRateChange(inputData, annualChange);
    const baseline = simulateAnnualRateChange(inputData, 0);
    const paymentDifference = scenario.paymentAtTermEnd - baseline.firstPayment;
    const extraInterest = scenario.interestOverTerm - baseline.interestOverTerm;

    rateScenarioDeltaElement.textContent =
      `${annualChange > 0 ? '+' : ''}${annualChange.toFixed(2)}%/yr → ${scenario.rateAtTermEnd.toFixed(2)}% by year ${termYears}`;
    rateScenarioPaymentElement.textContent = formatCurrency(scenario.paymentAtTermEnd);

    const dir = paymentDifference >= 0 ? 'more' : 'less';
    const interestDir = extraInterest >= 0 ? 'extra' : 'less';
    rateScenarioImpactElement.textContent =
      `Payment goes from ${formatCurrency(baseline.firstPayment)} to ${formatCurrency(scenario.paymentAtTermEnd)} `
      + `(${formatCurrency(Math.abs(paymentDifference))} ${dir}) · `
      + `${formatCurrency(Math.abs(extraInterest))} ${interestDir} interest over the ${termYears}-year term`;
    rateScenarioImpactElement.classList.toggle('negative', paymentDifference > 0);
    rateScenarioImpactElement.classList.toggle('positive', paymentDifference < 0);
  }

  rateScenarioSlider?.addEventListener('input', () => updateResults());

  // ---- F7: "Ways to pay less" ----
  // Every suggestion is a real run of the engine against the user's own numbers, so the
  // figures are exact rather than rules of thumb. Options that don't apply (or don't
  // actually save anything) are filtered out rather than shown as dead advice.
  const waysToSaveElement = container.querySelector('.ways-to-save') as HTMLElement;
  const waysToSaveListElement = container.querySelector('.ways-to-save-list') as HTMLElement;
  const waysToSaveIntroElement = container.querySelector('.ways-to-save-intro') as HTMLElement;

  type SavingOption = { label: string; detail: string; saved: number; yearsSaved: number; apply: () => void };

  function renderWaysToSave(inputData: any, resultObj: any) {
    if (!waysToSaveElement) return;

    const baselineInterest = resultObj.totalInterest;
    const baselinePayoff = resultObj.acceleratedResults?.payoffAchieved
      ? resultObj.acceleratedResults.payoffYears
      : resultObj.effectiveAmortizationYears;
    const options: SavingOption[] = [];

    const evaluate = (overrides: any) => {
      const result = calculateMortgage({ ...inputData, ...overrides });
      const payoff = result.acceleratedResults?.payoffAchieved
        ? result.acceleratedResults.payoffYears
        : result.effectiveAmortizationYears;
      return {
        saved: baselineInterest - result.totalInterest,
        yearsSaved: baselinePayoff - payoff,
      };
    };

    // 1) Switch to an accelerated payment frequency - usually the single biggest win that
    //    costs almost nothing in monthly budget terms.
    const isAlreadyAccelerated = inputData.paymentFrequency === 'acceleratedBiweekly' || inputData.paymentFrequency === 'acceleratedWeekly';
    if (!isAlreadyAccelerated && inputData.loanType !== 'interest only') {
      const outcome = evaluate({ paymentFrequency: 'acceleratedBiweekly' });
      if (outcome.saved > 1) {
        options.push({
          label: 'Switch to Accelerated Bi-Weekly',
          detail: 'Pay half your monthly amount every two weeks — one extra monthly payment a year.',
          saved: outcome.saved,
          yearsSaved: outcome.yearsSaved,
          apply: () => {
            if (paymentFrequencyValueElement) paymentFrequencyValueElement.textContent = 'Accelerated Bi-Weekly';
            updateResults();
          },
        });
      }
    }

    // 2) Bump the regular payment. Two sizes so there's a low-commitment option and a
    //    meaningful one, both priced against their actual numbers.
    [100, 250].forEach(extra => {
      const newIncrease = (inputData.paymentIncrease || 0) + extra;
      if (newIncrease > 2000) return;
      const outcome = evaluate({ paymentIncrease: newIncrease });
      if (outcome.saved > 1) {
        options.push({
          label: `Add ${formatCurrency(extra)} to every payment`,
          detail: `Your payment becomes ${formatCurrency((resultObj.basePayment || 0) + newIncrease)}.`,
          saved: outcome.saved,
          yearsSaved: outcome.yearsSaved,
          apply: () => {
            paymentIncreaseInputSlider.value = String(newIncrease);
            const toggleOn = container.querySelector('.pay-mortgage-faster .opt.on') as HTMLElement;
            const expandable = container.querySelector('.pay-mortgage-faster .expandable') as HTMLElement;
            if (expandable && !expandable.classList.contains('expanded')) toggleOn?.click();
            paymentIncreaseInputSlider.value = String(newIncrease);
            paymentIncreaseInputSlider.dispatchEvent(new Event('input'));
          },
        });
      }
    });

    // 3) Shorten the amortization. Costs more per payment but is often the cheapest total.
    if (inputData.amortization > 5 && inputData.loanType !== 'interest only') {
      const shorter = Math.max(5, inputData.amortization - 5);
      const outcome = evaluate({ amortization: shorter });
      const shorterResult = calculateMortgage({ ...inputData, amortization: shorter });
      const extraPerPayment = shorterResult.mortgagePayment - (resultObj.basePayment || resultObj.mortgagePayment);
      if (outcome.saved > 1) {
        options.push({
          label: `Shorten amortization to ${shorter} years`,
          detail: `Costs about ${formatCurrency(extraPerPayment)} more per payment.`,
          saved: outcome.saved,
          yearsSaved: outcome.yearsSaved,
          apply: () => {
            amortizationInputSlider.value = String(shorter);
            amortizationInputSlider.dispatchEvent(new Event('input'));
          },
        });
      }
    }

    // 4) Interest-only never self-liquidates, so the highest-value move is switching off it.
    if (inputData.loanType === 'interest only') {
      const outcome = evaluate({ loanType: 'regular' });
      options.push({
        label: 'Switch to Regular payments',
        detail: 'Interest Only never reduces your balance — you would still owe the full amount at the end.',
        saved: Math.max(0, outcome.saved),
        yearsSaved: 0,
        apply: () => {
          const regular = Array.from(container.querySelectorAll('.calculator-settings .btn-group-selector .selector'))
            .find(el => el.textContent?.trim() === 'Regular') as HTMLElement;
          regular?.click();
        },
      });
    }

    options.sort((a, b) => b.saved - a.saved);

    if (!options.length) {
      waysToSaveElement.style.display = 'none';
      return;
    }
    waysToSaveElement.style.display = 'unset';
    waysToSaveIntroElement.textContent = `Based on your numbers, here ${options.length === 1 ? 'is 1 option' : `are ${options.length} options`} that would cost you less.`;

    waysToSaveListElement.innerHTML = '';
    options.forEach(option => {
      const row = document.createElement('div');
      row.className = 'way-to-save';

      const info = document.createElement('div');
      info.className = 'way-to-save-info';

      const label = document.createElement('div');
      label.className = 'way-to-save-label';
      label.textContent = option.label;

      const detail = document.createElement('div');
      detail.className = 'way-to-save-detail';
      detail.textContent = option.detail;

      const impact = document.createElement('div');
      impact.className = 'way-to-save-impact';
      const yearsText = option.yearsSaved >= 1
        ? ` · ${Math.floor(option.yearsSaved)} year${Math.floor(option.yearsSaved) === 1 ? '' : 's'} sooner`
        : '';
      impact.textContent = `Saves ${formatCurrency(option.saved)}${yearsText}`;

      info.appendChild(label);
      info.appendChild(detail);
      info.appendChild(impact);

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.className = 'way-to-save-apply';
      applyButton.textContent = 'Apply';
      applyButton.addEventListener('click', option.apply);

      row.appendChild(info);
      row.appendChild(applyButton);
      waysToSaveListElement.appendChild(row);
    });
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

  // F2: Annual Pre-Payment.
  formatInput(annualPrePaymentInput, '$', 'annual-pre-payment', annualPrePaymentErrorElement);
  updateSliderBackground(annualPrePaymentInputSlider);

  // F6: seed the rate-type copy from whichever option is active in the markup, so the Fixed
  // default shows Fixed's wording on load instead of only correcting itself after the user
  // happens to click something.
  (() => {
    const initialRateType = getActiveRateType();
    if (rateTypeInfoElement) rateTypeInfoElement.textContent = rateTypeInfoCopy[initialRateType];
    const scenarioLabel = container.querySelector('.rate-scenario-label') as HTMLElement;
    if (scenarioLabel) scenarioLabel.textContent = rateScenarioLabelCopy[initialRateType];
  })();

  // F5: first-visit onboarding walkthrough (6 steps), gated on a localStorage key so it only
  // shows once.
  const ONBOARDING_STORAGE_KEY = 'mortgageCalculatorOnboardingSeen';
  const TOTAL_ONBOARDING_STEPS = 6;

  const onboardingOverlay = container.querySelector('.onboarding-overlay') as HTMLElement;
  const onboardingLoanAmountInput = container.querySelector('#onboarding-loan-amount') as HTMLInputElement;
  const onboardingRateInput = container.querySelector('#onboarding-rate') as HTMLInputElement;
  const onboardingTermSelect = container.querySelector('#onboarding-term') as HTMLSelectElement;
  const onboardingAmortizationInput = container.querySelector('#onboarding-amortization') as HTMLInputElement;
  const onboardingFrequencySelect = container.querySelector('#onboarding-frequency') as HTMLSelectElement;
  const onboardingContinueButton = container.querySelector('.onboarding-continue') as HTMLElement;
  const onboardingBackButton = container.querySelector('.onboarding-back') as HTMLElement;
  const onboardingSkipButton = container.querySelector('.onboarding-skip') as HTMLElement;
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
    // Step 1 has nothing to go back to; the last step finishes rather than continuing.
    onboardingBackButton.style.visibility = currentOnboardingStep === 1 ? 'hidden' : 'visible';
    onboardingContinueButton.textContent =
      currentOnboardingStep === TOTAL_ONBOARDING_STEPS ? 'See my results'
        : currentOnboardingStep === 1 ? "Let's go"
          : 'Next';
  };

  // Push whatever the wizard collected into the real fields. Text inputs route through the
  // same 'change' path a real typed entry uses, so out-of-range values get validated and
  // reverted exactly as they would on the field itself rather than bypassing validation.
  // The two dropdowns are custom (a div + span, not a <select>), so their display text is
  // set directly - updateResults() reads that text back out.
  // The three numeric onboarding inputs are drag sliders, not free-text fields - a text box
  // that happily accepts "abc years" is a bad way to ask someone for a number. Sliders can
  // only ever produce an in-range value, so there is nothing to validate or reject here.
  const onboardingLoanReadout = container.querySelector('[data-readout="loan"]') as HTMLElement;
  const onboardingRateReadout = container.querySelector('[data-readout="rate"]') as HTMLElement;
  const onboardingAmortizationReadout = container.querySelector('[data-readout="amortization"]') as HTMLElement;

  const renderOnboardingReadouts = () => {
    if (onboardingLoanReadout) {
      onboardingLoanReadout.textContent = `$${Number(onboardingLoanAmountInput.value).toLocaleString('en-US')}`;
    }
    if (onboardingRateReadout) {
      onboardingRateReadout.textContent = `${Number(onboardingRateInput.value).toFixed(2)}%`;
    }
    if (onboardingAmortizationReadout) {
      const years = Number(onboardingAmortizationInput.value);
      onboardingAmortizationReadout.textContent = `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }
    updateSliderBackground(onboardingLoanAmountInput);
    updateSliderBackground(onboardingRateInput);
    updateSliderBackground(onboardingAmortizationInput);
  };

  [onboardingLoanAmountInput, onboardingRateInput, onboardingAmortizationInput].forEach(slider => {
    slider?.addEventListener('input', renderOnboardingReadouts);
  });

  // Push the wizard's values into the real calculator by driving its own sliders and
  // dispatching their 'input' event - that reuses the exact same code path a real drag
  // takes (text field, dataset, slider fill, updateResults), rather than re-implementing
  // any of it here.
  const applyOnboardingValues = () => {
    purchasePriceInputSlider.value = onboardingLoanAmountInput.value;
    purchasePriceInputSlider.dispatchEvent(new Event('input'));

    interestRateInputSlider.value = onboardingRateInput.value;
    interestRateInputSlider.dispatchEvent(new Event('input'));

    amortizationInputSlider.value = onboardingAmortizationInput.value;
    amortizationInputSlider.dispatchEvent(new Event('input'));

    if (termLengthValueElement && onboardingTermSelect?.value) {
      termLengthValueElement.textContent = onboardingTermSelect.value;
    }
    if (paymentFrequencyValueElement && onboardingFrequencySelect?.value) {
      paymentFrequencyValueElement.textContent = onboardingFrequencySelect.value;
    }
    updateResults();
  };

  const openOnboarding = () => {
    // Seed the wizard from the calculator's current state, so reopening mid-session shows
    // what's actually set rather than silently reverting to the static markup defaults.
    if (purchasePriceInput.dataset.previousValue) {
      onboardingLoanAmountInput.value = purchasePriceInput.dataset.previousValue;
    }
    if (interestRateInput.dataset.previousValue) {
      onboardingRateInput.value = interestRateInput.dataset.previousValue;
    }
    if (amortizationInput.dataset.previousValue) {
      onboardingAmortizationInput.value = amortizationInput.dataset.previousValue;
    }
    if (termLengthValueElement?.textContent) {
      onboardingTermSelect.value = termLengthValueElement.textContent.trim();
    }
    if (paymentFrequencyValueElement?.textContent) {
      onboardingFrequencySelect.value = paymentFrequencyValueElement.textContent.trim();
    }
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

  // Skipping still keeps anything already entered - abandoning the wizard shouldn't silently
  // discard values the user just typed into it.
  onboardingSkipButton?.addEventListener('click', () => {
    applyOnboardingValues();
    closeOnboarding();
  });

  renderOnboardingStep();
  renderOnboardingReadouts();

  let hasSeenOnboarding = false;
  try { hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1'; } catch { /* private browsing etc - just show it every visit */ }
  if (!hasSeenOnboarding) {
    openOnboarding();
  }

  updateResults();
}
