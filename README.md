# Translation-Tool
Overview

The Translation Tool is a web-based application that allows users to translate text from one language to another. It supports text input as well as file uploads (PDF and Word documents up to 100MB). The tool ensures accurate translations using LibreTranslate (self-hosted or free online) and RapidAPI's Microsoft Text Translator.

Features

Text Translation: Instantly translate text between supported languages.

File Translation: Upload PDF or Word files (up to 100MB) to extract and translate text.

Language Support: Translations are restricted to the languages listed in the data.js file.

Login & Authentication:

Email format validation.

"Continue with Google" and "Continue with Microsoft" options.

Responsive login page with navigation to the translation tool.

Dark Mode & Light Mode: User-friendly interface with theme switching.

Logout Functionality: Logout option available in the sidebar.

Self-hosted API Support: Uses LibreTranslate (via Docker) and integrates with RapidAPI’s Microsoft Text Translator.

Installation

Prerequisites

Ensure you have the following installed:

Node.js

Docker (for LibreTranslate, if using self-hosted translation API)

Steps to Set Up

Clone the repository:

git clone <repository-url>
cd translation-tool

Install dependencies:

npm install

Set up LibreTranslate (Optional for self-hosted API):

docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate

Configure API Keys:

Set up .env file with the required API keys for LibreTranslate and Microsoft Translator.

LIBRETRANSLATE_API_KEY=<your-api-key>
RAPIDAPI_MICROSOFT_TRANSLATOR_KEY=<your-api-key>

Run the application:

npm start

Access the application:

Open your browser and go to http://localhost:3000.

Usage

Login to the application.

Enter text manually or upload a PDF/Word file for translation.

Select source and target languages from the dropdown menu.

Click "Translate" to process and view the translated output.

Download or copy the translated text as needed.

Technologies Used

Frontend: JavaScript, HTML, CSS

Backend: Node.js, Express.js

Translation APIs: LibreTranslate (Self-hosted & free online), RapidAPI’s Microsoft Text Translator

File Processing: PDF and Word text extraction

Authentication: Google and Microsoft OAuth

Contributing

If you’d like to contribute:

Fork the repository.

Create a new branch: git checkout -b feature-name

Make your changes and commit: git commit -m 'Add new feature'

Push to the branch: git push origin feature-name

Submit a pull request.

License

This project is licensed under the MIT License.

Contact

For issues or suggestions, please create a GitHub issue or contact the project maintainer.

