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

const FIRESTORE_COLLECTION = "mortgage_calender";
const PAGE_SIZE = 9;
let lastDocument: any = null;
let selectedCategory = "Interest Rate";

export function initMortgageCalendar(container: HTMLElement) {
    container.innerHTML = `
      <div class="mortgage-calender">
        <div class="section-heading">Mortgage Calender</div>
        <div class="filters">
            <div class="filter selected">Interest Rate</div>
            <div class="filter">Gross domestic product, income, and expenditure</div>
            <div class="filter">Housing</div>
        </div>
        <div class="calendar-content">
            <div class="calendar-header"></div>
            <div class="calendar-events"></div>
        </div>
      </div>
    `;

    const mortgageCalender = container.querySelector(".mortgage-calender") as HTMLElement;
    const sectionHeading = container.querySelector(".section-heading") as HTMLElement;
    const filtersList = container.querySelector(".filters") as HTMLElement;
    const calendarEvents = container.querySelector(".calendar-events") as HTMLElement;
    const calendarHeader = container.querySelector(".calendar-header") as HTMLElement;
    if (!mortgageCalender || !sectionHeading || !calendarEvents) return;

    loadMortgageCalendarEvents(container);

    let isLoading = false;
    let hasMoreData = true;

    const handleScroll = async () => {
        const rect = calendarEvents.getBoundingClientRect();
        const isNearBottom = rect.bottom <= window.innerHeight + 100;

        if (!isLoading && hasMoreData && isNearBottom) {
            isLoading = true;
            try {
                hasMoreData = await loadMortgageCalendarEvents(container);
            } catch (error) {
                console.error("Error loading educational videos:", error);
            } finally {
                isLoading = false;
            }
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

    filtersList.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target.closest(".filter")) {
            const filterElements = filtersList.querySelectorAll(".filter");
            filterElements.forEach(filterElement => {
                filterElement.classList.remove("selected");
            });
            target.classList.add("selected");

            selectedCategory = target.textContent ? target.textContent : "";
            lastDocument = null;

            calendarEvents.innerHTML = "";
            calendarHeader.innerHTML = "";

            loadMortgageCalendarEvents(container);
        }
    });
}

async function loadMortgageCalendarEvents(container: HTMLElement): Promise<boolean> {
    const calendarHeader = container.querySelector(".calendar-header") as HTMLElement;
    const calendarEvents = container.querySelector(".calendar-events") as HTMLElement;
    if (!calendarHeader || !calendarEvents) return false;

    try {
        const db = await getFirestoreInstance();

        let calendarEventsQuery = query(
            collection(db, FIRESTORE_COLLECTION),
            orderBy("schedule_date", "desc"),
            limit(PAGE_SIZE)
        );
        
        // Conditionally apply the "where" clause if categoryToFilter is available
        if (selectedCategory) {
            calendarEventsQuery = query(calendarEventsQuery, where("category", "==", selectedCategory));
        }

        if (lastDocument) {
            calendarEventsQuery = query(calendarEventsQuery, startAfter(lastDocument));
        }

        const querySnapshot = await getDocs(calendarEventsQuery);

        if (querySnapshot.empty) {
            console.log("No more calendar events to load");
            return false;
        }

        querySnapshot.forEach((doc) => {
            const calendarEventData = doc.data();

            const calendarEventElement = document.createElement("div");
            calendarEventElement.classList.add("calendar-event");
            calendarHeader.classList.remove("show", "col-3");
            if (selectedCategory === "Interest Rate") {
                calendarHeader.classList.add("show");
                calendarHeader.innerHTML = `
                    <div class="calendar-header-col">Interest Rate</div>
                    <div class="calendar-header-col">Schedule Date</div>
                `;
                calendarEventElement.innerHTML = `
                    <div class="calendar-event-col">${calendarEventData.title?.trim()}</div>
                    <div class="calendar-event-col date">${formatDate(calendarEventData.schedule_date?.trim())}</div>
                `;
            } else if (selectedCategory === "Gross domestic product, income, and expenditure") {
                calendarHeader.classList.add("show", "col-3");
                calendarHeader.innerHTML = `
                    <div class="calendar-header-col">Gross domestic product, income, and expenditure</div>
                    <div class="calendar-header-col">Release Date</div>
                    <div class="calendar-header-col">Reference Period</div>
                `;
                calendarEventElement.classList.add("col-3");
                calendarEventElement.innerHTML = `
                    <div class="calendar-event-col">${calendarEventData.title?.trim()}</div>
                    <div class="calendar-event-col date">${formatDate(calendarEventData.release_date?.trim())}</div>
                    <div class="calendar-event-col date">${formatDate(calendarEventData.reference_period?.trim())}</div>
                `;
            } else if (selectedCategory === "Housing") {
                calendarHeader.classList.add("show", "col-3");
                calendarHeader.innerHTML = `
                    <div class="calendar-header-col">Housing</div>
                    <div class="calendar-header-col">Release Date</div>
                    <div class="calendar-header-col">Last Published Date</div>
                `;
                calendarEventElement.classList.add("col-3");
                calendarEventElement.innerHTML = `
                    <div class="calendar-event-col">${calendarEventData.title?.trim()}</div>
                    <div class="calendar-event-col date">${formatDate(calendarEventData.release_date?.trim())}</div>
                    <div class="calendar-event-col date">${formatDate(calendarEventData.last_published_date?.trim())}</div>
                `;
            }
            calendarEvents.appendChild(calendarEventElement);
        });

        lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        return true;
    } catch (error) {
        console.error("Error loading educational videos:", error);
        return false;
    }
}
