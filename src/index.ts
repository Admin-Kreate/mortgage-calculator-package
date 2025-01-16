import './styles.scss';
import { initCalculator } from './calculator';
import { initMarketTrendVideos } from './market-trend-videos';
import { initFaqs } from './faqs';
import { initResearchArticles } from './research-articles';
import { initMortgageNews } from './mortgage-news';

interface InitParams {
  containerId: string;
  product: "calculator" | "market-trend-videos" | "faqs" | "research-articles" | "mortgage-news";
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
    case "market-trend-videos":
      initMarketTrendVideos(container);
      break;
    case "faqs":
      initFaqs(container);
      break;
    case "research-articles":
      initResearchArticles(container);
      break;
    case "mortgage-news":
      initMortgageNews(container);
      break;
    default:
      console.error(`Unknown product: ${initParams.product}`);
  }
}
