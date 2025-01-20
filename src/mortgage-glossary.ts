import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    orderBy,
    getDocs,
} from "firebase/firestore";

import arrowLeft from './assets/icons/arrow-left.svg';
import arrowRight from './assets/icons/arrow-right.svg';

const FIRESTORE_COLLECTION = "mortgage_glossary";

export function initMortgageGlossary(container: HTMLElement) {
    container.innerHTML = `
      <div class="mortgage-glossary">
        <div class="header-wrapper">
            <div class="section-heading">Mortgage Glossary</div>
            <div class="glossary-controls">
                <div class="arrow-left"><img src="${arrowLeft}" alt="Expand/Collapse" /></div>
                <div class="alphabets"></div>
                <div class="arrow-right"><img src="${arrowRight}" alt="Expand/Collapse" /></div>
            </div>
        </div>
        <div class="glossary-list"></div>
      </div>
    `;

    const mortgageGlossary = container.querySelector(".mortgage-glossary") as HTMLElement;
    const headerWrapper = container.querySelector(".header-wrapper") as HTMLElement;
    const glossaryList = container.querySelector(".glossary-list") as HTMLUListElement;
    if (!mortgageGlossary || !headerWrapper || !glossaryList) return;

    loadMortgageGlossary(container);

    const handleScroll = async () => {
        const glossaryRect = mortgageGlossary.getBoundingClientRect();
        const isInViewport = glossaryRect.top <= 0 && glossaryRect.bottom > 0;

        if (isInViewport) {
            headerWrapper.classList.add("sticky");
        } else {
            headerWrapper.classList.remove("sticky");
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

async function loadMortgageGlossary(container: HTMLElement) {
    const mortgageGlossary = container.querySelector(".mortgage-glossary") as HTMLElement;
    const glossaryList = container.querySelector(".glossary-list") as HTMLUListElement;
    const alphabets = container.querySelector(".alphabets") as HTMLElement;
    if (!glossaryList) return;

    try {
        const db = await getFirestoreInstance();

        let glossaryQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("term", "asc")
        );

        const querySnapshot = await getDocs(glossaryQuery);

        if (querySnapshot.empty) {
            console.log("No mortgage glossary available");
            return;
        }

        let groupedGlossary: any = {};
        querySnapshot.forEach((doc) => {
            const glossaryData = doc.data();

            const firstLetter = glossaryData.term.charAt(0).toUpperCase();
            let isFirstLetterItem = false;
            if (!groupedGlossary[firstLetter]) {
                groupedGlossary[firstLetter] = [];
                isFirstLetterItem = true;
            }
            groupedGlossary[firstLetter].push(glossaryData);

            const glossaryElement = document.createElement("div");
            glossaryElement.classList.add("glossary-item");
            if (isFirstLetterItem) glossaryElement.setAttribute("data-glosssary-control-letter", firstLetter);
            glossaryElement.innerHTML = `
                <div class="term">${glossaryData.term?.trim()}</div>
                <div class="definition">${glossaryData.definition?.trim()}</div>
            `;
            glossaryList.appendChild(glossaryElement);
        });

        console.log(groupedGlossary, " - groupedGlossary");

        const alphabetKeys = Object.keys(groupedGlossary);
        let alphabetsHTMLString = "";
        alphabetKeys.forEach((alphabet) => {
            alphabetsHTMLString += `<div class="alphabet">${alphabet}</div>`;
        });
        alphabets.innerHTML = alphabetsHTMLString;

        mortgageGlossary.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;
            if (target.closest(".arrow-right")) {
                alphabets.scrollLeft += 150;
            } else if (target.closest(".arrow-left ")) {
                alphabets.scrollLeft -= 150;
            } else if (target.closest(".alphabet")) {
                const firstLetterElement = document.querySelector(`[data-glosssary-control-letter="${target.textContent}"]`) as HTMLElement;
                if (firstLetterElement) {
                    const elementOffsetTop = firstLetterElement.getBoundingClientRect().top + window.scrollY;
                    const offset = window.innerWidth < 992 ? 200 : 275;
                    window.scrollTo({
                        top: elementOffsetTop - offset,
                        behavior: "smooth",
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error loading mortgage glossary:", error);
    }
}
