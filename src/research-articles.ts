import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";
import { formatDate } from './utils';

const FIRESTORE_COLLECTION = "research_articles";
const PAGE_SIZE = 9;
let lastDocument: any = null;
let selectedCategory = "";

export function initResearchArticles(container: HTMLElement) {
    container.innerHTML = `
      <div class="research-articles">
        <div class="section-heading">Research Articles</div>
        <div class="filters">
            <div class="filter selected">All Articles</div>
            <div class="filter">First time home buyer</div>
            <div class="filter">General</div>
            <div class="filter">HELOC</div>
            <div class="filter">Refinance</div>
            <div class="filter">Renewal</div>
        </div>
        <div class="research-articles-list"></div>
      </div>
    `;

    const researchArticles = container.querySelector(".research-articles") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const filtersList = container.querySelector(".filters") as HTMLElement;
    const researchArticlesList = container.querySelector(".research-articles-list") as HTMLUListElement;
    if (!researchArticles || !sectionHeading || !researchArticlesList) return;

    loadResearchArticles(container);

    let isLoading = false;
    let hasMoreData = true;

    const handleScroll = async () => {
        const rect = researchArticlesList.getBoundingClientRect();
        const isNearBottom = rect.bottom <= window.innerHeight + 100;

        if (!isLoading && hasMoreData && isNearBottom) {
            isLoading = true;
            try {
                const hasMore = await loadResearchArticles(container);
                hasMoreData = hasMore;
            } catch (error) {
                console.error("Error loading research articles:", error);
            } finally {
                isLoading = false;
            }
        }

        // const articlesRect = researchArticles.getBoundingClientRect();
        // const isInViewport = articlesRect.top <= 0 && articlesRect.bottom > 0;

        // if (isInViewport) {
        //     sectionHeading.classList.add("sticky");
        // } else {
        //     sectionHeading.classList.remove("sticky");
        // }
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

    filtersList.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target.closest(".filter")) {
            const filterElements = filtersList.querySelectorAll(".filter");
            filterElements.forEach(filterElement => {
                filterElement.classList.remove("selected");
            });
            target.classList.add("selected");

            const text = target.textContent === "All Articles" ? "" : target.textContent;
            selectedCategory = text ? text : "";
            lastDocument = null;

            researchArticlesList.innerHTML = "";

            loadResearchArticles(container);
        }
    });
}

async function loadResearchArticles(container: HTMLElement): Promise<boolean> {
    const researchArticlesList = container.querySelector(".research-articles-list") as HTMLUListElement;
    if (!researchArticlesList) return false;

    try {
        const db = await getFirestoreInstance();

        let researchArticlesQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );
                        
        // Conditionally apply the "where" clause if categoryToFilter is available
        if (selectedCategory) {
            researchArticlesQuery = query(researchArticlesQuery, where("category", "==", selectedCategory));
        }

        if (lastDocument) {
            researchArticlesQuery = query(researchArticlesQuery, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(researchArticlesQuery);

        if (querySnapshot.empty) {
            console.log("No more research articles to load");
            return false;
        }

        querySnapshot.forEach((doc) => {
            const researchArticleData = doc.data();
            const researchArticleElement = document.createElement("div");
            researchArticleElement.classList.add("research-article");
            researchArticleElement.innerHTML = `
                <div class="thumbnail" style="background-image: url('${researchArticleData.img_link}');"></div>
                <div class="date">${formatDate(researchArticleData.date)}</div>
                <div class="title">${researchArticleData.headline?.trim()}</div>
                <div class="description">${researchArticleData.description?.trim()}</div>
                <a class="read-more-link" href="${researchArticleData.source}" target="_blank">Read More</a>
            `;
            researchArticlesList.appendChild(researchArticleElement);
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        return true;
    } catch (error) {
        console.error("Error loading research articles:", error);
        return false;
    }
}
