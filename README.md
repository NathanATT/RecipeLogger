# Recipe Cost & Management Logger

A full-stack MERN application designed to help home cooks, bakers, and small food businesses accurately calculate the cost of their recipes. By tracking ingredient purchases and prices, this tool provides precise per-unit costing, recipe scaling, and profit margin analysis.

## Core Features

*   **Ingredient Management:** Full CRUD (Create, Read, Update, Delete) functionality for a master list of ingredients.
*   **Purchase Logging:** Keep a historical record of all ingredient purchases to track price fluctuations. The latest purchase automatically updates the ingredient's unit price.
*   **Dynamic Unit Conversion:**
    *   A global settings page to define custom, density-based conversions (e.g., `1 cup flour = 120g`).
    *   Integrated with a standard conversion library to handle universal units (`kg`, `lb`, `oz`, `g`, etc.).
*   **Smart Recipe Creation:**
    *   Create recipes by simply pasting a block of text (e.g., `all-purpose flour 250 g`).
    *   The system intelligently parses multi-word ingredients, finds existing ingredients, or creates new ones on the fly.
*   **Recipe Scaling & Costing:** View any recipe and dynamically scale the ingredient quantities up or down based on desired servings.
*   **Profit Calculator:** On the recipe detail page, input a selling price and number of items to instantly calculate total revenue, production cost, net profit, and profit margin.
*   **Advanced Data Views:** A fully filterable and sortable purchase history page with pagination to easily track expenses over time.
*   **Modular Front-End:** Built with reusable, type-safe React components for maintainability and scalability.

## Tech Stack

### Frontend
*   **React** (with Vite)
*   **TypeScript**
*   **React Router** for client-side routing
*   **Axios** for API communication
*   **CSS Modules** for component-scoped styling

### Backend
*   **Node.js**
*   **Express.js** for the REST API
*   **MongoDB** as the NoSQL database
*   **Mongoose** as the Object Data Modeler (ODM)
*   **CORS** & **Dotenv**

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Node.js** (v16 or later recommended)
*   **npm** or **yarn**
*   **MongoDB** (A local instance or a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AbsoluteChangeMan/RecipeLogger
    cd RecipeLogger
    ```

2.  **Setup the Backend:**
    *   Navigate to the backend directory: `cd backend`
    *   Install dependencies: `npm install`
    *   Create a `.env` file in the `backend` directory and add your configuration:
        ```env
        # The port your server will run on
        PORT=5000

        # Your MongoDB connection string
        MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/recipe-db?retryWrites=true&w=majority
        ```
    *   Start the backend server:
        ```bash
        npm start
        # Or for development with nodemon: npm run serve
        ```
        The server should now be running on `http://localhost:5000`.

3.  **Setup the Frontend:**
    *   Open a new terminal and navigate to the frontend directory: `cd recipe-frontend`
    *   Install dependencies: `npm install`
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```
        The React application should now be running on `http://localhost:5173` (or another port specified by Vite).

## API Endpoints

The backend provides the following RESTful API endpoints:

| Endpoint                  | Method | Description                                                |
| ------------------------- | ------ | ---------------------------------------------------------- |
| `/api/ingredients`        | `GET`  | Get a list of all ingredients.                             |
| `/api/ingredients`        | `POST` | Create a new master ingredient.                            |
| `/api/ingredients/:id`    | `PUT`  | Update an existing ingredient.                             |
| `/api/ingredients/:id`    | `DELETE`| Delete an ingredient.                                      |
| `/api/recipes`            | `GET`  | Get a summary list of all recipes.                         |
| `/api/recipes/:id`        | `GET`  | Get the full details of a single recipe.                   |
| `/api/recipes/from-text`  | `POST` | Create a new recipe from a text-based ingredient list.     |
| `/api/recipes/:id`        | `PUT`  | Update a recipe using a text-based ingredient list.        |
| `/api/recipes/:id`        | `DELETE`| Delete a recipe.                                           |
| `/api/recipes/:id/cost`   | `GET`  | Calculate the total cost of a single recipe.               |
| `/api/purchases`          | `GET`  | Get a list of all purchases (supports filter/sort/paginate). |
| `/api/purchases`          | `POST` | Log a new ingredient purchase and update its price.        |
| `/api/settings`           | `GET`  | Get the global custom conversion settings.                 |
| `/api/settings`           | `PUT`  | Update the global custom conversion settings.              |

## Future Improvements

*   **User Authentication:** Implement user accounts (JWT, Passport.js) so multiple users can manage their own private recipes and ingredient lists.
*   **Data Visualization:** Add a dashboard with charts to visualize spending trends, most expensive ingredients, and recipe cost breakdowns.
*   **Shopping List Generation:** Automatically generate a shopping list based on a planned recipe.
*   **Inventory Management:** Track ingredient stock levels, deducting amounts when a recipe is "made".
*   **Containerization:** Add a `Dockerfile` and `docker-compose.yml` for easy deployment.
