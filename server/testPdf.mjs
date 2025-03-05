import fs from "fs";
import pdfParse from "pdf-parse";

const filePath = "C:/React/server/test/data/dummy.pdf"; // Update path if needed

console.log("Checking file:", filePath);

if (fs.existsSync(filePath)) {
    console.log("File found, reading...");
    const dataBuffer = fs.readFileSync(filePath);
    
    pdfParse(dataBuffer)
        .then(data => console.log(" Extracted Text:", data.text.slice(0, 500))) // Show first 500 chars
        .catch(err => console.error(" PDF Parsing Error:", err));
} else {
    console.error(" File does not exist:", filePath);
}
