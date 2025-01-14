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

    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!videosList) return;

    loadTrendingVideos(container);

    let isLoading = false;
    
    videosList.addEventListener("scroll", async () => {
        const { scrollTop, scrollHeight, clientHeight } = videosList;
        if (!isLoading && scrollTop + clientHeight >= scrollHeight - 100) {
            isLoading = true;
            try {
                await loadTrendingVideos(container);
            } finally {
                isLoading = false;
            }
        }
    });
}

async function loadTrendingVideos(container: HTMLElement) {
    const videosList = container.querySelector(".videos") as HTMLUListElement;
    if (!videosList) return;

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
            return;
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
                        console.log("videoURL: ", videoUrl);
                        showVideoModal(videoUrl);
                    }
                }
            }
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    } catch (error) {
        console.error("Error loading trending videos:", error);
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

