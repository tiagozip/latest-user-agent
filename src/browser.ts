import { Browser, Builder } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as edge from "selenium-webdriver/edge";
import * as firefox from "selenium-webdriver/firefox";

interface BrowserConfig {
  platform: NodeJS.Platform;
}

interface DriverConfig {
  headless: boolean;
}

export const setUpBrowser = (config: BrowserConfig) => {
  const chromeDriver = ({ headless }: DriverConfig) => {
    const options = new chrome.Options();
    options.setBrowserVersion("stable");
    options.addArguments("--disable-gpu");
    if (headless) options.addArguments("--headless=new");
    if (config.platform === "linux") options.addArguments("--no-sandbox");
    return new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
  };

  const edgeDriver = ({ headless }: DriverConfig) => {
    const options = new edge.Options();
    options.setBrowserVersion("stable");
    options.addArguments("--disable-gpu");
    if (headless) options.addArguments("--headless=new");
    if (config.platform === "linux") options.addArguments("--no-sandbox");
    return new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();
  };

  const firefoxDriver = ({ headless }: DriverConfig) => {
    const options = new firefox.Options();
    options.setBrowserVersion("stable");
    if (headless) options.addArguments("-headless");
    return new Builder()
      .forBrowser(Browser.FIREFOX)
      .setFirefoxOptions(options)
      .build();
  };

  const safariDriver = () => {
    return new Builder().forBrowser(Browser.SAFARI).build();
  };

  return { chromeDriver, edgeDriver, firefoxDriver, safariDriver };
};
