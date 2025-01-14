import './styles.scss';
import { initCalculator } from './calculator';
import { initMarketTrendVideos } from './market-trend-videos';

interface InitParams {
  containerId: string;
  product: "calculator" | "market-trend-videos";
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
    default:
      console.error(`Unknown product: ${initParams.product}`);
  }
}
