import { JSDOM } from "jsdom"
import { DirectoryModel } from "../Models/directory.model.mjs";
import keyword_extractor from "keyword-extractor"
import { escapeRegExp } from "../Lib/url.mjs";
import { getHtmlFromUrl } from "../Lib/fetch.mjs";
import { ai } from "../Lib/ai.mjs";
import { QueryModel } from "../Models/search.model.mjs";

const getMyWebsites = async (request, response) => {
    try {
        const { user } = request.query;
        if (!user) return response.status(400).send({
            message: "Please enter a valid user id"
        })
        const websites = await DirectoryModel.find({
            added: user,
            deleted: {
                $ne: true 
            }
        })
        if (!websites) throw new Error("Error while fetching websites. Please try again.")
        return response.status(200).send({
            websites
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while fetching websites. Please try again."
        })
    }
}

const deleteMyWebsite = async (request, response) => {
    try {
        const { id } = request.params;
        if (!id) return response.status(400).send({
            message: "Please enter a valid website id"    
        })
        const website = await DirectoryModel.findOneAndUpdate({
            _id: id,
            deleted: {
                $ne: true 
            }
        }, { $set: { deleted: true } })
        if (!website) return response.status(400).send({
            message: "Website not found"
        })
        return response.status(200).send({
            message: "Website deleted successfully"
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while deleting website. Please try again."    
        })
    }
}

const getUrlComponents = async (request, response) => {
    try {
        const { url } = request.query;
        if(!url) {
            return response.status(400).send({
                message: "Please enter a valid url"
            })
        }
        let descriptionText;
        const html = await getHtmlFromUrl(url);
        const dom = new JSDOM(html);
        const doc = dom.window.document;
    
        descriptionText = doc.getElementsByTagName("p")?.[0]?.textContent;
        const owl = doc.querySelector('meta[name="owl-directory"]')?.content || "";
        const title = doc.querySelector("title")?.textContent || url;
        const metaDesc = doc.querySelector('meta[name="description"]')?.content
        let description = metaDesc ? metaDesc.slice(0,150) + `${metaDesc.endsWith("...") ? "" : "..."}` : descriptionText ? descriptionText?.replace(/(\s\s+)/g, " ")?.slice(0,150) + "..." : "No information is available for this page.";
        const keywords = doc.querySelector('meta[name="keywords"]')?.content || "";
        const icons = Array.from(doc.querySelectorAll('link[rel*="icon"]')).map((link) => new URL(link.getAttribute('href'), url).href);
        return response.status(200).send({
            title,
            description,
            keywords,
            owl,
            icon: icons?.[0] || `${process.env.SERVER}/assets/favicon.png`
        })
    } catch (error) {
        
        return response.status(500).send({
            message: error.message || "Error while fetching website. Please try again."
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
        const keywords = keyword_extractor.extract(q, {
            remove_digits: true,
            remove_duplicates: true
        })
        const titleCheck = keywords.map(keyword => ({ title: { $regex: escapeRegExp(keyword), $options: "i" } }))

        const searchQuery = {
            $or: [
                { keywords: { $in: keywords } },
                { keywords: { $elemMatch: {$regex: escapeRegExp(q), $options: "i"} } },
                { title: { $regex: escapeRegExp(q), $options: "i" } },
                { description: { $regex: escapeRegExp(q), $options: "i" } },
                { host_name: { $regex: escapeRegExp(q), $options: "i" } },
                { origin: { $regex: escapeRegExp(q), $options: "i" } },
                { url: { $regex: escapeRegExp(q), $options: "i" } },
                ...titleCheck
            ],
            deleted: {
                $ne: true 
            }
        }
        await QueryModel.create({ query: q })
        const results = await DirectoryModel.find(searchQuery).skip(skip).limit(limit)
        const total = await DirectoryModel.countDocuments(searchQuery)
        return response.status(200).send({results, total_results: total, is_previous_available: skip > 0, is_next_available: total > (skip + limit)})
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while fetching website. Please try again."
        })
    }
}

const getAiResponse = async (request, response) => {
    try {
        const { message } = request.body;
        if(!message) {
            return response.status(400).send({
                message: "Please enter a valid message"
            })
        }
        const res = await ai.ask(message)
        return response.status(200).send(res)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error happend (ai). Please try again."
        })
    }
}

export default {
    getMyWebsites,
    deleteMyWebsite,
    getUrlComponents,
    addToDirectory,
    getSearch,
    getAiResponse
}