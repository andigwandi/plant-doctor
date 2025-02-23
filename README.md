# The Plant Doctor

## Overview

This project is a web application built with Next.js that allows users to identify plants from images. It uses the Gemini API to analyze uploaded images and provide details about the plant, including its common name, scientific name, trivia, health status, and care instructions.

## Features

-   **Image Upload:** Users can upload images of plants to be identified.
-   **Plant Identification:** Utilizes the Gemini API to analyze the uploaded image and identify the plant.
-   **Detailed Information:** Provides detailed information about the identified plant, including common name, scientific name, trivia, health status, and care instructions.
-   **Progress Indicator:** Displays a progress indicator during image upload.
-   **Responsive Design:** The application is designed to be responsive and work well on both desktop and mobile devices.

## Technologies Used

-   [Next.js](https://nextjs.org/): A React framework for building web applications.
-   [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for styling the application.
-   [Gemini API](https://ai.google.dev/): Used for analyzing images and providing plant information.

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager
-   A Gemini API key. You can obtain one from [Google AI Studio](https://makersuite.google.com/).

## Installation

1.  Clone the repository:

    ```
    git clone [repository-url]
    cd plant-identifier
    ```

2.  Install dependencies:

    ```
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables:

    -   Create a `.env.local` file in the root directory.
    -   Add your Gemini API key:

        ```
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```

## Running the Application

1.  Start the development server:

    ```
    npm run dev
    # or
    yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## Deployment

To deploy the application to a production environment, you can use platforms like Vercel, Netlify, or AWS. Here's how to deploy to Vercel:

1.  Push your code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  Import your project into Vercel.
3.  Add the `GEMINI_API_KEY` environment variable in the Vercel project settings.
4.  Deploy the project.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License

[Your License] - e.g., MIT License

## Contact

Sanjeev Kumar
andigwandi@gmail.com
