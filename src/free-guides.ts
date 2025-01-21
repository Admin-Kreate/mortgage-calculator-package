import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "./firebase";
import freeGuidesIcon from './assets/icons/free-guides.svg';

interface SendGuideResponse {
    success: boolean;
    message: string;
}

export function initFreeGuides(container: HTMLElement) {
    let freeGuidesHTML = `
      <div class="free-guides">
        <div class="section-heading">Free guides</div>
        <div class="free-guides-form">
            <div class="icon-wrapper">
                <img src="${freeGuidesIcon}" alt="Free guides icon"/>
            </div>
            <div class="form-wrapper">
                <div class="info">Get your first time homebuyer free guide with you</div>
                <div class="fields">
                    <input type="text" class="name-field" placeholder="Name" />
                    <input type="email" class="email-field" placeholder="Email" />
                    <div class="submit-button disabled">Yes, I want this</div>
                </div>
                <div class="consent-wrapper">
                    <input type="checkbox" id="consent-checkbox" name="consent" value="Promotional emails consent">
                    <label for="consent-checkbox">I consent to use my details here for future promotional emails.</label>
                </div>
            </div>
        </div>
      </div>
    `;

    container.innerHTML = freeGuidesHTML;

    const formWrapper = container.querySelector(".free-guides-form .form-wrapper") as HTMLInputElement;
    const fields = container.querySelector(".free-guides-form .fields") as HTMLInputElement;
    const consentWrapper = container.querySelector(".free-guides-form .consent-wrapper") as HTMLElement;
    const nameField = container.querySelector(".free-guides-form .name-field") as HTMLInputElement;
    const emailField = container.querySelector(".free-guides-form .email-field") as HTMLInputElement;
    const consentField = container.querySelector(".free-guides-form #consent-checkbox") as HTMLInputElement;
    const submitBtn = container.querySelector(".free-guides-form .submit-button") as HTMLInputElement;

    const validateForm = async () => {
        const name = nameField.value;
        const email = emailField.value;
        const consent = consentField.checked;

        if (name && email && consent && validateEmail(email)) {
            submitBtn.classList.remove("disabled");
        } else {
            submitBtn.classList.add("disabled");
        }
    };

    const validateEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    nameField.addEventListener("change", (event) => {
        validateForm()
    });
    emailField.addEventListener("change", (event) => {
        validateForm()
    });
    consentField.addEventListener("change", (event) => {
        validateForm()
    });
    submitBtn.addEventListener("click", async (event) => {
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const consent = consentField.checked;

        try {
            submitBtn.textContent = "Processing...";
            submitBtn.disabled = true;
            submitBtn.classList.toggle("disabled");

            const functions = await getFirebaseFunctions();
            const sendGuideEmail = httpsCallable(functions, "sendGuideEmail");
            
            const response = await sendGuideEmail({ name, email, consent, file: "test-1.pdf" });
            const responseData = response.data as SendGuideResponse;
            if (responseData.success) {
                fields.remove();
                consentWrapper.remove();

                const statusElement = document.createElement("div");
                statusElement.classList.add("status");
                statusElement.classList.add("success");
                statusElement.textContent = "Your homebuyer free guide has been emailed to you!";
                formWrapper.appendChild(statusElement);
            } else {
                submitBtn.textContent = "Yes, I want this";
                submitBtn.disabled = false;
                submitBtn.classList.toggle("disabled");

                const statusElement = document.createElement("div");
                statusElement.classList.add("status");
                statusElement.classList.add("error");
                statusElement.textContent = responseData.message;
                formWrapper.appendChild(statusElement);
            }
        } catch (error) {
            submitBtn.textContent = "Yes, I want this";
            submitBtn.disabled = false;
            submitBtn.classList.toggle("disabled");

            console.error("Error sending email:", error);
            const errorString = error as string;
            const statusElement = document.createElement("div");
            statusElement.classList.add("status");
            statusElement.classList.add("error");
            statusElement.textContent = errorString;
            formWrapper.appendChild(statusElement);
        }
    })
}
