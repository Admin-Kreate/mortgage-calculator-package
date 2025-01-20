import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    orderBy,
    getDocs,
} from "firebase/firestore";

import chevronDown from './assets/icons/chevron-down.svg';

const FIRESTORE_COLLECTION = "faqs";

export function initFaqs(container: HTMLElement) {
    container.innerHTML = `
      <div class="faqs">
        <div class="section-heading">Frequently Asked Questions</div>
        <div class="faq-list"></div>
      </div>
    `;

    const faqs = container.querySelector(".faqs") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const faqList = container.querySelector(".faq-list") as HTMLUListElement;
    if (!faqs || !sectionHeading || !faqList) return;

    loadFaqs(container);

    const handleScroll = async () => {
        const faqsRect = faqs.getBoundingClientRect();
        const isInViewport = faqsRect.top <= 0 && faqsRect.bottom > 0;

        if (isInViewport) {
            sectionHeading.classList.add("sticky");
        } else {
            sectionHeading.classList.remove("sticky");
        }
    };

    const throttle = (func: Function, limit: number) => {
        let lastCall = 0;
        return (...args: any[]) => {
            const now = Date.now();
            if (now - lastCall >= limit) {
                lastCall = now;
                func(...args);
            }
        };
    };

    window.addEventListener("scroll", throttle(handleScroll, 200));
}

async function loadFaqs(container: HTMLElement) {
    const faqList = container.querySelector(".faq-list") as HTMLUListElement;
    if (!faqList) return;

    try {
        const db = await getFirestoreInstance();

        let faqsQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("question", "asc")
        );

        const querySnapshot = await getDocs(faqsQuery);

        if (querySnapshot.empty) {
            console.log("No FAQs available");
            return;
        }

        querySnapshot.forEach((doc) => {
            const faqData = doc.data();
            console.log("faqData - ", faqData);

            const faqElement = document.createElement("div");
            faqElement.classList.add("faq");
            faqElement.innerHTML = `
                <div class="content-wrapper">
                    <div class="question">${faqData.question?.trim()}</div>
                    <div class="answer">${faqData.answer?.trim()}</div>
                </div>
                <div class="expand-collapse-wrapper">
                    <img src="${chevronDown}" alt="Expand/Collapse" />
                </div>
            `;
            faqList.appendChild(faqElement);
        });

        faqList.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;

            if (target.closest(".expand-collapse-wrapper")) {
                const faqElement = target.closest(".faq") as HTMLElement;
                if (faqElement.classList.contains("expand")) {
                    faqElement.classList.remove("expand");
                } else {
                    faqElement.classList.add("expand");
                }
            }
        });
    } catch (error) {
        console.error("Error loading faqs:", error);
    }
}
