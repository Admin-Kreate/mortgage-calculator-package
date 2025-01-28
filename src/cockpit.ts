export function initCockpit(container: HTMLElement) {
    const iframeWidth = window.innerWidth < 992 ? window.innerWidth - 32 : 600;
    const iframeheight = window.innerWidth < 992 ? 350: 450;
    const modules: any[] = [
        {
            id: "housing-indicators",
            name: "Housing Indicators",
            description: "The Canadian housing market is influenced by a range of important indicators that provide insights into the overall economic health and housing trends.",
            stats: [
                { title: 'Residential sales activity', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/4c4cf585-74d2-4d90-938c-ec3ca0ddf85f/page/48IDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Residential Average Price', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/918ac56b-3efc-4f8c-b455-9fe2be8c9e0c/page/HEJDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Residential Market Balance', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/0e5fee3d-3c53-4469-9baa-36cb60aac28d/page/KHJDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Residential New Listings', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/5994b7fe-d4ac-4a8d-b17d-4aee90fc1958/page/4CJDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Residential Average Price (year over year percentage change )', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/0bbb457e-e130-4164-92ad-1f313f3d1d1c/page/6EJDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'MLS HPI Benchmark Price', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/5d0b79b4-7ae4-4f92-bdfb-1fbcc70b4ffb/page/IGJDE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Housing affordability index', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/643969af-c85b-4b53-bd43-ad2c35ea3dbf/page/56FHE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
            ]
        },
        {
            id: "economic-indicators",
            name: "Economic Indicators",
            description: "Canadian economic indicators provide valuable insights into the health and performance of the country’s economy. These indicators are used by policymakers, economists, businesses, and investors to assess economic conditions and make informed decisions.",
            stats: [
                { title: 'Retail sales increase ', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/e78b80fa-b1bc-4f2c-a021-e2de7308134e/page/CgeGE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Employment rate', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/53c524e5-ebfb-475c-81c8-94b461482a6d/page/hyeGE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'Quarterly population estimate', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/55188dfc-ba3d-48fb-865f-f30869596420/page/C0eGE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
                { title: 'CPI and CPI excluding gasoline', embed_code: `<iframe width="${iframeWidth}" height="${iframeheight}" src="https://lookerstudio.google.com/embed/reporting/bf06875f-f5f4-4a3a-8a3b-82c11a1346a6/page/g2eGE" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>` },
            ]
        },
        {
            id: "mortgage-indicators",
            name: "Mortgage Indicators",
            description: "",
            stats: []
        },
        {
            id: "key-rates",
            name: "Key Rates",
            description: "",
            stats: []
        },
    ];

    let cockpitHTML = `
      <div class="cockpit">
        <div class="header-wrapper">
            <div class="tab-selectors">
            `;
    let index = 0;
    for(let module of modules) {
        cockpitHTML += `<div class="tab-selector ${ index === 0 ? 'selected' : ''}" data-tab-id="${module.id}">${module.name}</div>`;
        index++;
    }
    
    cockpitHTML += `
            </div>`;
    
    index = 0;
    for(let module of modules) {
        cockpitHTML += `
            <div id="tab-content-${module.id}" class="tab-content ${ index === 0 ? 'selected' : ''}">
                <div class="title">${module.name}</div>
                <div class="description">${module.description}</div>
            </div>`;
        index++;
    }

    cockpitHTML += `
        </div>
        <div class="stats"></div>
      </div>
    `;

    container.innerHTML = cockpitHTML;

    const cockpit = container.querySelector(".cockpit") as HTMLElement;
    const tabSelectors = container.querySelector(".tab-selectors") as HTMLElement;
    const headerWrapper = container.querySelector(".header-wrapper") as HTMLElement;
    const stats = container.querySelector(".stats") as HTMLElement;
    
    const defaultModuleData = modules.filter((module) => {
        return module.id === "housing-indicators";
    })[0];

    let defaultModuleStatsHTML = "";
    for(let stat of defaultModuleData.stats) {
        defaultModuleStatsHTML += `
            <div class="stat">
                <div class="title">${stat.title}</div>
                <div class="stat-graph">${stat.embed_code}</div>
            </div>
        `;
    }
    stats.innerHTML = defaultModuleStatsHTML;

    // const handleScroll = async () => {
        // const cockpitRect = cockpit.getBoundingClientRect();
        // const isInViewport = cockpitRect.top <= 0 && cockpitRect.bottom > 0;

        // if (isInViewport) {
        //     headerWrapper.classList.add("sticky");
        // } else {
        //     headerWrapper.classList.remove("sticky");
        // }
    // };

    // const throttle = (func: Function, limit: number) => {
    //     let lastCall = 0;
    //     return (...args: any[]) => {
    //         const now = Date.now();
    //         if (now - lastCall >= limit) {
    //             lastCall = now;
    //             func(...args);
    //         }
    //     };
    // };

    cockpit.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target.closest(".tab-selector")) {
            tabSelectors.querySelector(".selected")?.classList.remove("selected");
            target.classList.add("selected");

            const tabContentElements = cockpit.querySelectorAll(".tab-content");
            tabContentElements.forEach(tabContentElement => {
                tabContentElement.classList.remove("selected");
            });
            document.getElementById(`tab-content-${target.dataset.tabId}`)?.classList.add("selected");

            const selectedModuleData = modules.filter((module) => {
                return module.id === target.dataset.tabId;
            })[0];

            let selectModuleStatsHTML = "";
            for(let stat of selectedModuleData.stats) {
                selectModuleStatsHTML += `
                    <div class="stat">
                        <div class="title">${stat.title}</div>
                        <div class="stat-graph">${stat.embed_code}</div>
                    </div>
                `;
            }
            stats.innerHTML = selectModuleStatsHTML;
        }
    });

    // window.addEventListener("scroll", throttle(handleScroll, 200));
}
