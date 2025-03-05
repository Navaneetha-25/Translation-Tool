import React, { useState } from "react";
import { pdfjs } from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

const PDFTextExtractor = ({ onTextExtracted }) => {
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                const typedArray = new Uint8Array(reader.result);
                const pdf = await pdfjs.getDocument(typedArray).promise;
                let extractedText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
                }

                onTextExtracted(extractedText); // Pass extracted text to parent
            };
        } catch (error) {
            console.error("Error extracting text:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" accept="application/pdf" onChange={handleFileUpload} />
            {loading && <p>Extracting text from PDF...</p>}
        </div>
    );
};

export default PDFTextExtractor;
