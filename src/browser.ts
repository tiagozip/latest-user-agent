import { Browser, Builder } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as edge from "selenium-webdriver/edge";
import * as firefox from "selenium-webdriver/firefox";

interface BrowserConfig {
  platform: NodeJS.Platform;
}

interface DriverConfig {
  headless: boolean;
  path?: string;
}

export const setUpBrowser = (config: BrowserConfig) => {
  const chromeDriver = ({ headless, path }: DriverConfig) => {
    const options = new chrome.Options();
    if (headless) options.addArguments("--headless=new");
    if (config.platform === "linux") options.addArguments("--no-sandbox");
    if (path) options.setChromeBinaryPath(path);
    return new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
  };

  const edgeDriver = ({ headless, path }: DriverConfig) => {
    const options = new edge.Options();
    if (headless) options.addArguments("--headless=new");
    if (config.platform === "linux") options.addArguments("--no-sandbox");
    if (path) options.setEdgeChromiumBinaryPath(path);
    return new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();
  };

  const firefoxDriver = ({ headless, path }: DriverConfig) => {
    const options = new firefox.Options();
    if (headless) options.addArguments("-headless");
    if (path) options.setBinary(path);
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
