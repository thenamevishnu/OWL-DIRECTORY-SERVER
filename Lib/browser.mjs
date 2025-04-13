import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const openBrowser = async () => {
    try {
        let browser;
    if(process.env.NODE_ENV === "PROD") {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        })
    }
    if(process.env.NODE_ENV === "DEV") {
        browser = await puppeteer.launch({ headless: "new", executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
    }
    const page = await browser.newPage();
    return { browser, page };
    } catch (err) {
        console.log(err);
        return null
    }
}