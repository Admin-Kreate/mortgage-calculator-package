import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";
import { formatDate } from './utils';

import chevronRight from './assets/icons/chevron-right.svg';

const FIRESTORE_COLLECTION = "mortgage_news";
const PAGE_SIZE = 9;
let lastDocument: any = null;

export function initMortgageNews(container: HTMLElement) {
    container.innerHTML = `
      <div class="mortgage-news">
        <div class="section-heading">Mortgage News</div>
        <div class="mortgage-news-list"></div>
      </div>
    `;

    const mortgageNews = container.querySelector(".mortgage-news") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const mortgageNewsList = container.querySelector(".mortgage-news-list") as HTMLUListElement;
    if (!mortgageNews || !sectionHeading || !mortgageNewsList) return;

    loadMortgageNews(container);

    let isLoading = false;
    let hasMoreData = true;
    
    const handleScroll = async () => {
        const rect = mortgageNewsList.getBoundingClientRect();
        const isNearBottom = rect.bottom <= window.innerHeight + 100;

        if (!isLoading && hasMoreData && isNearBottom) {
            isLoading = true;
            try {
                const hasMore = await loadMortgageNews(container);
                hasMoreData = hasMore;
            } catch (error) {
                console.error("Error loading mortgage news:", error);
            } finally {
                isLoading = false;
            }
        }

        // const newsRect = mortgageNews.getBoundingClientRect();
        // const isInViewport = newsRect.top <= 0 && newsRect.bottom > 0;

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
}

async function loadMortgageNews(container: HTMLElement): Promise<boolean> {
    const mortgageNewsList = container.querySelector(".mortgage-news-list") as HTMLElement;
    if (!mortgageNewsList) return false;

    try {
        const db = await getFirestoreInstance();

        let mortgageNewsQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );

        if (lastDocument) {
            mortgageNewsQuery = query(mortgageNewsQuery, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(mortgageNewsQuery);

        if (querySnapshot.empty) {
            console.log("No more mortgage news to load");
            return false;
        }

        querySnapshot.forEach((doc) => {
            const mortgageNewsData = doc.data();
            console.log("mortgageNewsData - ", mortgageNewsData);

            const mortgageNewsElement = document.createElement("div");
            mortgageNewsElement.classList.add("mortgage-news-item");
            mortgageNewsElement.innerHTML = `
                <div class="thumbnail" style="background-image: url('${mortgageNewsData.img_link}');"></div>
                <div class="date">${formatDate(mortgageNewsData.date)}</div>
                <div class="title">${mortgageNewsData.headline}</div>
                <a class="read-more-link" href="${mortgageNewsData.source}" target="_blank">
                    Read More
                    <div class="read-more-icon">
                        <img src="${chevronRight}" alt="Read More" />
                    </div>
                </a>
            `;
            mortgageNewsList.appendChild(mortgageNewsElement);
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        return true;
    } catch (error) {
        console.error("Error loading mortgage news:", error);
        return false;
    }
}
