import './styles.scss';
import { initCalculator } from './calculator';
import { initMarketTrendVideos } from './market-trend-videos';
import { initFaqs } from './faqs';
import { initResearchArticles } from './research-articles';
import { initMortgageNews } from './mortgage-news';
import { initMortgageGlossary } from './mortgage-glossary';
import { initEducationalVideos } from './educational-videos';
import { initCockpit } from './cockpit';
import { initFreeGuides } from './free-guides';
import { initMortgageCalendar } from './mortgage-calendar';

interface InitParams {
  containerId: string;
  product: "calculator" | "market-trend-videos" | "faqs" | "research-articles" | "mortgage-news" | "mortgage-glossary" | "educational-videos" | "cockpit" | "free-guides" | "mortgage-calender";
  options?: {
    applyUrl?: string;
  };
}

export function init(initParams: InitParams) {
  const container = document.getElementById(initParams.containerId);

  if (!container) {
    console.error('Container not found');
    return;
  }

  switch (initParams.product) {
    case "calculator":
      initCalculator(container, initParams.options?.applyUrl || "");
      break;
    case "cockpit":
      initCockpit(container);
      break;
    case "educational-videos":
      initEducationalVideos(container);
      break;
    case "faqs":
      initFaqs(container);
      break;
    case "free-guides":
      initFreeGuides(container);
      break;
    case "market-trend-videos":
      initMarketTrendVideos(container);
      break;
    case "mortgage-calender":
      initMortgageCalendar(container);
      break;
    case "mortgage-glossary":
      initMortgageGlossary(container);
      break;
    case "mortgage-news":
      initMortgageNews(container);
      break;
    case "research-articles":
      initResearchArticles(container);
      break;
    default:
      console.error(`Unknown product: ${initParams.product}`);
  }
}
