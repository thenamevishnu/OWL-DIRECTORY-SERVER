import puppeteer from "puppeteer";

export const openBrowser = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
         }); 
        const page = await browser.newPage();
        return { browser, page };
    } catch (err) {
        return null
    }
}