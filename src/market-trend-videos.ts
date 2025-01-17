import { getFirestoreInstance } from "./firebase";

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";

import playIcon from './assets/icons/play.svg';

const FIRESTORE_COLLECTION = "market_trend_videos";
const PAGE_SIZE = 9;
let lastDocument: any = null;

export function initMarketTrendVideos(container: HTMLElement) {
    container.innerHTML = `
      <div class="market-trend-videos">
        <div class="section-heading">Market Trend Videos</div>
        <div class="videos"></div>
        <div id="video-player" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close">&times;</span>
                <iframe id="video-frame" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
      </div>
    `;

    const marketTrendVideos = container.querySelector(".market-trend-videos") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!marketTrendVideos || !sectionHeading || !videosList) return;

    loadTrendingVideos(container);

    let isLoading = false;
    let hasMoreData = true;

    const handleScroll = async () => {
        const rect = videosList.getBoundingClientRect();
        const isNearBottom = rect.bottom <= window.innerHeight + 100;

        if (!isLoading && hasMoreData && isNearBottom) {
            isLoading = true;
            try {
                const hasMore = await loadTrendingVideos(container);
                hasMoreData = hasMore;
            } catch (error) {
                console.error("Error loading market trend videos:", error);
            } finally {
                isLoading = false;
            }
        }

        const trendRect = marketTrendVideos.getBoundingClientRect();
        const isInViewport = trendRect.top <= 0 && trendRect.bottom > 0;

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

async function loadTrendingVideos(container: HTMLElement): Promise<boolean> {
    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!videosList) return false;

    try {
        const db = await getFirestoreInstance();

        let videosQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );

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
            console.log("videoData - ", videoData);

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
                <div class="date">${videoData.date?.trim()}</div>
                <div class="title">${videoData.headline?.trim()}</div>
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
        console.error("Error loading trending videos:", error);
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

