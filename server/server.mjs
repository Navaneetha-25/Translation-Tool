/*server.mjs*/
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createWorker } from "tesseract.js";
import fs from "fs";
import path from "path";
import pkg from 'pdf-extract';
import {Document} from "docx";
import upload from "./multerConfig.mjs";
import countries from "../client/src/components/data.js";

const {PDFExtract}=pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT||5000

app.use(cors());
app.use(express.json());

const tesseractLangMap = {
    "ar-SA": "ara",
    "bn-IN": "ben",
    "da-DK": "dan",
    "nl-NL": "nld",
    "en-GB": "eng",
    "fi-FI": "fin",
    "fr-FR": "fra",
    "de-DE": "deu",
    "el-GR": "ell",
    "gu-IN": "guj",
    "hi-IN": "hin",
    "hu-HU": "hun",
    "id-ID": "ind",
    "it-IT": "ita",
    "ja-JP": "jpn",
    "kn-IN": "kan",
    "ko-KR": "kor",
    "la-VA": "lat",
    "ms-MY": "msa",
    "ne-NP": "nep",
    "ur-PK": "urd",
    "fa-IR": "fas",
    "pa-IN": "pan",
    "pl-PL": "pol",
    "pt-PT": "por",
    "ro-RO": "ron",
    "ru-RU": "rus",
    "es-ES": "spa",
    "ta-LK": "tam",
    "te-IN": "tel",
    "th-TH": "tha",
    "bo-CN": "bod",
    "tr-TR": "tur",
    "vi-VN": "vie"
};

// Translation Endpoint
app.post("/translate", async (req, res) => {
    const { text, source, target } = req.body;

    if (!text || !source || !target) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const response = await fetch(
            `https://microsoft-translator-text-api3.p.rapidapi.com/translate?to=${target}&from=${source}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "microsoft-translator-text-api3.p.rapidapi.com",
                },
                body: JSON.stringify([{ Text: text }]),
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data[0]?.translations[0]?.text || "Translation error";

        res.json({ translatedText });
    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});

app.post("/extract-text", upload.single("file"), async (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received fields:', req.body);
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }    
        const { language,targetLang,sourceLang } = req.body;
        if (!language || !tesseractLangMap[language]||!targetLang||!sourceLang) {
            return res.status(400).json({ error: "Missing or invalid fields(languages,targetLang,sourceLang)" });
        } 
    const ocrLang = tesseractLangMap[language];
    const filePath=path.resolve(req.file.path);
    let extractedText="";
    try { 
        if(req.file.mimetype==='application/pdf'){
            const pdfExtract=new PDFExtract();
            const options = {
                layout: true,
                pagerender: (pageData) => {
                    // Custom rendering logic
                    return pageData;
                },
                normalizeWhitespace: true,
                disableCombineTextItems: false,
                firstPage: 1,
                lastPage: 10
            };
            const data=await pdfExtract.extract(filePath,options);
            extractedText=data.text;
        }  else if(req.file.mimetype==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'||req.file.mimetype==='application/msword'){
            try{
                const arrayBuffer=fs.readFileSync(filePath);
                const doc=await Document.load(arrayBuffer);
                const body = doc.getBody();
                console.log("DOCX Body content:", body);
                extractedText = body.map(block => block.text).join('\n');
            }catch(docxError){
                console.error("DOCX/DOC parsing error:",docxError);
                extractedText="Error parsing DOCX/DOC file.Simple text extraction failed.";
            }
        }else if(req.file.mimetype.startsWith('image/')){
            const worker=await createWorker();
            await worker.load();
            await worker.loadLanguage(ocrLang);
            await worker.initialize(ocrLang);
            const { data: { text } } = await worker.recognize(req.file.path);
            console.log("OCR recognized text:", text);
            await worker.terminate();
            extractedText=text;
        }else if (req.file.mimetype === 'text/plain') {  // Handle .txt files
            extractedText = fs.readFileSync(filePath, 'utf-8');
        } else {
            return res.status(400).json({ error: "Unsupported file type for extraction." });
        }         
        if(!extractedText.trim()){
            return res.status(400).json({error:"No text detected in image"});
        }
        console.log( "Extracted Text (first 200 chars):", extractedText.slice(0, 200)); 
        const translateResponse = await fetch(
            `https://microsoft-translator-text-api3.p.rapidapi.com/translate?to=${targetLang}&from=${sourceLang}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "microsoft-translator-text-api3.p.rapidapi.com",
                },
                body: JSON.stringify([{ Text:extractedText }])
            }
        );
        if(!translateResponse.ok){
            const errorData = await translateResponse.json();
            console.error("Translation API error data:", errorData);
            throw new Error(`API request failed with status:${translateResponse.status} - ${errorData?.message || translateResponse.statusText}`);
        }
        const translationData=await translateResponse.json();
        console.log("Translation API response data:", translationData);
        const translatedText=translationData[0]?.translations[0]?.text||"Translation error";
        res.json({ extractedText,translatedText});
    } catch (error) {
        console.error("Full file processing error:", error); 
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Error response:", error.response.data);
        }
        res.status(500).json({ error: "Failed to extract text" });
    } finally {
        if (req.file) {
            fs.unlinkSync(filePath); // Clean up
        }
    }
}); 
// Fetch Available Languages
app.get("/languages", async (req, res) => {
    try {
        res.json(countries);
    } catch (error) {
        console.error("Language Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch languages" });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});