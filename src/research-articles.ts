import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";

const FIRESTORE_COLLECTION = "research_articles";
const PAGE_SIZE = 9;
let lastDocument: any = null;

export function initResearchArticles(container: HTMLElement) {
    container.innerHTML = `
      <div class="research-articles">
        <div class="section-heading">Research Articles</div>
        <div class="research-articles-list"></div>
      </div>
    `;

    const researchArticlesList = container.querySelector(".research-articles-list") as HTMLUListElement;
    if (!researchArticlesList) return;

    loadResearchArticles(container);

    let isLoading = false;
    
    researchArticlesList.addEventListener("scroll", async () => {
        const { scrollTop, scrollHeight, clientHeight } = researchArticlesList;
        if (!isLoading && scrollTop + clientHeight >= scrollHeight - 100) {
            isLoading = true;
            try {
                await loadResearchArticles(container);
            } finally {
                isLoading = false;
            }
        }
    });
}

async function loadResearchArticles(container: HTMLElement) {
    const researchArticlesList = container.querySelector(".research-articles-list") as HTMLUListElement;
    if (!researchArticlesList) return;

    try {
        const db = await getFirestoreInstance();

        let researchArticlesQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );

        if (lastDocument) {
            researchArticlesQuery = query(researchArticlesQuery, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(researchArticlesQuery);

        if (querySnapshot.empty) {
            console.log("No more research articles to load");
            return;
        }

        querySnapshot.forEach((doc) => {
            const researchArticleData = doc.data();
            console.log("researchArticleData - ", researchArticleData);

            const researchArticleElement = document.createElement("div");
            researchArticleElement.classList.add("research-article");
            researchArticleElement.innerHTML = `
                <div class="thumbnail"></div>
                <div class="date">${researchArticleData.date}</div>
                <div class="title">${researchArticleData.headline?.trim()}</div>
                <div class="description">${researchArticleData.description?.trim()}</div>
                <a class="read-more-link" href="${researchArticleData.source}" target="_blank">Read More</a>
            `;
            researchArticlesList.appendChild(researchArticleElement);
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    } catch (error) {
        console.error("Error loading research articles:", error);
    }
}
