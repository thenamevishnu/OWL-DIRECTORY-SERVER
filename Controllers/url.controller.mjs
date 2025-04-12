import { JSDOM } from "jsdom"
import puppeteer, { executablePath } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { DirectoryModel } from "../Models/directory.model.mjs";
import { SearchModel } from "../Models/search.model.mjs";

const getUrlComponents = async (request, response) => {
    try {
        const { url } = request.query;
        if(!url) {
            return response.status(400).send({
                message: "Please enter a valid url"
            })
        }
        const getHtmlWithPuppeteer = async (url) => {
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
            await page.goto(url, { waitUntil: "domcontentloaded" });
            const html = await page.content();
            await browser.close();
            return html;
        };
        const html = await getHtmlWithPuppeteer(url);
        const dom = new JSDOM(html);
        const doc = dom.window.document;
    
        const title = doc.querySelector('title')?.textContent || 'website';
        let description = doc.querySelector('meta[name="description"]')?.content || doc.querySelector("p")?.innerText || doc.querySelector("div")?.innerText || "There is no description for this website.";
        const keywords = doc.querySelector('meta[name="keywords"]')?.content || "";
        const icons = Array.from(doc.querySelectorAll('link[rel*="icon"]')).map((link) => new URL(link.getAttribute('href'), url).href);
    
        return response.status(200).send({
            title,
            description,
            keywords,
            icon: icons?.[0] || `${process.env.SERVER}/assets/favicon.png`
        })
    } catch (error) {
        console.log(error);
        return response.status(500).send({
            message: "Error while fetching website. Please try again."
        })   
    }
}

const addToDirectory = async (request, response) => {
    try {
        const { title, keywords, description, origin, url, host_name, icon, added } = request.body;
        if (!title) throw new Error("Please enter a valid title");
        if (!description) throw new Error("Please enter a valid description");
        if (!origin) throw new Error("Please enter a valid origin");
        if (!url) throw new Error("Please enter a valid url");
        if (!host_name) throw new Error("Please enter a valid host name");
        if (!icon) throw new Error("Please enter a valid icon");
        if (!added) throw new Error("Please enter added user id");
        const exist = await DirectoryModel.findOne({ url });
        if (exist) throw new Error("Website already exists");
        const directory = await DirectoryModel.create({ title, keywords: keywords?.split(",").map(item => item.trim()), description, origin, url, host_name, icon, added });
        if(!directory?._id) throw new Error("Error while adding website. Please try again.");
        return response.status(200).send({
            message: "Website added successfully"
        })
    } catch (error) {
        return response.status(500).send({
            message: error.message || "Error while adding website. Please try again."
        })   
    }
}

const getSearch = async (request, response) => {
    try {
        const { q, page, limit: lmt } = request.query;
        const limit = Number(lmt)
        if (!q) {
            return response.status(200).send({
                results: []
            })
        }
        const skip = (page - 1) * limit
        const keywords = q.split(" ");
        const titleSearch = [...keywords].map(item => ({ title: { $regex: item, $options: "i" } }))
        const descriptionSearch = [...keywords].map(item => ({ description: { $regex: item, $options: "i" } }))
        const hostNameSearch = [...keywords].map(item => ({ host_name: { $regex: item, $options: "i" } }))
        const originSearch = [...keywords].map(item => ({ origin: { $regex: item, $options: "i" } }))
        const urlSearch = [...keywords].map(item => ({ url: { $regex: item, $options: "i" } }))
        
        const searchQuery = {
            $or: [
                { keywords: { $in: keywords } },
                { keywords: { $elemMatch: {$regex: q, $options: "i"} } },
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { host_name: { $regex: q, $options: "i" } },
                { origin: { $regex: q, $options: "i" } },
                { url: { $regex: q, $options: "i" } },
                ...titleSearch,
                ...descriptionSearch,
                ...hostNameSearch,
                ...originSearch,
                ...urlSearch
            ]
        }
        const results = await DirectoryModel.find(searchQuery).skip(skip).limit(limit)
        if (results.length > 0) {
            const exist = await SearchModel.findOne({ query: { $regex: q, $options: "i" } })
            if (!exist) {
                await SearchModel.create({ query: q })
            }
        }
        const total = await DirectoryModel.countDocuments(searchQuery)
        return response.status(200).send({results, total_results: total, is_previous_available: skip > 0, is_next_available: total > (skip + limit)})
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while fetching website. Please try again."
        })
    }
}

const searchSuggestions = async (request, response) => {
    try {
        const { q } = request.query;
        if(!q){
            return response.status(200).send([])
        }
        const results = await SearchModel.find({ query: { $regex: q, $options: "i" } }).sort({ createdAt: -1 }).limit(10)
        return response.status(200).send(results)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while fetching website. Please try again."
        })
    }
}

export default {
    getUrlComponents,
    addToDirectory,
    getSearch,
    searchSuggestions
}