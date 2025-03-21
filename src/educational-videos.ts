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

import playIcon from './assets/icons/play.svg';
import { formatDate } from './utils';

const FIRESTORE_COLLECTION = "educational_videos";
const PAGE_SIZE = 9;
let lastDocument: any = null;
let selectedCategory = "";

export function initEducationalVideos(container: HTMLElement) {
    container.innerHTML = `
      <div class="educational-videos">
        <div class="section-heading">Educational Videos</div>
        <div class="filters">
            <div class="filter selected">All Videos</div>
            <div class="filter">First time home buyers in Canada</div>
            <div class="filter">Mortgage Fundamentals</div>
            <div class="filter">Renewal</div>
            <div class="filter">Mortgage Repayment</div>
        </div>
        <div class="videos"></div>
        <div id="video-player" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close">&times;</span>
                <iframe id="video-frame" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
      </div>
    `;

    const educationalVideos = container.querySelector(".educational-videos") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const filtersList = container.querySelector(".filters") as HTMLElement;
    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!educationalVideos || !sectionHeading || !videosList) return;

    loadEducationalVideos(container);

    let isLoading = false;
    let hasMoreData = true;

    const handleScroll = async () => {
        const rect = videosList.getBoundingClientRect();
        const isNearBottom = rect.bottom <= window.innerHeight + 100;

        if (!isLoading && hasMoreData && isNearBottom) {
            isLoading = true;
            try {
                const hasMore = await loadEducationalVideos(container);
                hasMoreData = hasMore;
            } catch (error) {
                console.error("Error loading educational videos:", error);
            } finally {
                isLoading = false;
            }
        }

        // const educationalRect = educationalVideos.getBoundingClientRect();
        // const isInViewport = educationalRect.top <= 0 && educationalRect.bottom > 0;

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

            const text = target.textContent === "All Videos" ? "" : target.textContent;
            selectedCategory = text ? text : "";
            lastDocument = null;

            videosList.innerHTML = "";

            loadEducationalVideos(container);
        }
    });
}

async function loadEducationalVideos(container: HTMLElement): Promise<boolean> {
    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!videosList) return false;

    try {
        const db = await getFirestoreInstance();

        let videosQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );
        
        // Conditionally apply the "where" clause if categoryToFilter is available
        if (selectedCategory) {
            videosQuery = query(videosQuery, where("category", "==", selectedCategory));
        }

        if (lastDocument) {
            videosQuery = query(videosQuery, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(videosQuery);

        if (querySnapshot.empty) {
            console.log("No more videos to load");
            return false;
        }

        querySnapshot.forEach((doc) => {
            const videoData = doc.data();
            const videoElement = document.createElement("div");
            videoElement.classList.add("video");
            videoElement.setAttribute("data-video-url", videoData.video_link);
            videoElement.innerHTML = `
                <div class="thumbnail" style="background-image: url('${videoData.img_link}');">
                    <div class="thumbnail-overlay" style="">
                        <div class="play-icon">
                            <img src="${playIcon}" alt="Play Video" />
                        </div>
                    </div>
                </div>
                <div class="date">${formatDate(videoData.date?.trim())}</div>
                <div class="title">${videoData.headline?.trim()}</div>
                <div class="source">Source: <span>${videoData.source?.trim()}</span></div>
            `;
            videosList.appendChild(videoElement);
        });

        videosList.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;

            if (target.closest(".play-icon")) {
                const videoElement = target.closest(".video") as HTMLElement;
                if (videoElement) {
                    const videoUrl = videoElement.getAttribute("data-video-url");
                    if (videoUrl) {
                        showVideoModal(videoUrl);
                    }
                }
            }
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        return true;
    } catch (error) {
        console.error("Error loading educational videos:", error);
        return false;
    }
}

function showVideoModal(videoUrl: string) {
    const modal = document.querySelector("#video-player") as HTMLElement;
    const iframe = modal.querySelector("#video-frame") as HTMLIFrameElement;
    const closeButton = modal.querySelector(".close") as HTMLElement;

    if (!modal || !iframe || !closeButton) return;

    iframe.src = videoUrl;
    modal.style.display = "flex";

    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        iframe.src = "";
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            iframe.src = "";
        }
    });
}

