import './styles.scss';
import { calculateMortgage } from './calculator';

export function init(options: { containerId: string }) {
    const container = document.getElementById(options.containerId);

    if (!container) {
        console.error('Mortgage Calculator container not found');
        return;
    }

    container.innerHTML = `
    <div class="mortgage-calculator">
      <input type="number" id="principal" placeholder="Mortgage Amount" />
      <input type="number" id="interest" placeholder="Interest Rate (%)" />
      <select id="years">
        <option value="10">10 years</option>
        <option value="15">15 years</option>
        <option value="20">20 years</option>
        <option value="25">25 years</option>
      </select>
      <select id="frequency">
        <option value="12">Monthly</option>
        <option value="6">Bi-Annually</option>
        <option value="1">Annually</option>
      </select>
      <button id="calculate-btn">Calculate</button>
      <p id="result"></p>
    </div>
  `;

    const principalInput = document.getElementById('principal') as HTMLInputElement;
    const interestInput = document.getElementById('interest') as HTMLInputElement;
    const yearsSelect = document.getElementById('years') as HTMLSelectElement;
    const frequencySelect = document.getElementById('frequency') as HTMLSelectElement;
    const result = document.getElementById('result') as HTMLParagraphElement;

    document.getElementById('calculate-btn')!.addEventListener('click', () => {
        const principal = parseFloat(principalInput.value);
        const interest = parseFloat(interestInput.value);
        const years = parseInt(yearsSelect.value);
        const frequency = parseInt(frequencySelect.value);

        if (isNaN(principal) || isNaN(interest) || isNaN(years) || isNaN(frequency)) {
            result.textContent = 'Please fill all fields correctly.';
            return;
        }

        const payment = calculateMortgage(principal, interest, years, frequency);
        result.textContent = `Your payment is $${payment.toFixed(2)}.`;
    });
}
