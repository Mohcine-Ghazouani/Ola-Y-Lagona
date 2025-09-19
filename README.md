# Hola Laguna





## Installation


1. Clone the repository:
   

3. Install dependencies:

    ```sh
    npm install
    ```
    
4. prisma generate:

    ```sh
    npx prisma generate 
    ```

5. Start the server:

    ```sh
    npm run dev
    ```
6. prisma studio (optional) :

    ```sh
    npx prisma studio 
    ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./kite-sports.db"

# JWT Secret for authentication
JWT_SECRET="your-secret-key-change-in-production"

# OpenWeatherMap API Key for live weather data (optional)
# Get your free API key at: https://openweathermap.org/api
OPENWEATHER_API_KEY="your-openweathermap-api-key-here"

# Next.js specific
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Weather API Setup (Optional)

To enable live weather data on the home page:

1. Visit [OpenWeatherMap](https://openweathermap.org/api) and sign up for a free account
2. Get your API key from the dashboard
3. Add `OPENWEATHER_API_KEY=your-api-key` to your `.env.local` file
4. Restart the development server

Without the API key, the weather widget will show demo data for Dakhla, Morocco.

## Running the Application

- The server will run on `http://localhost:3000`.
- The prisma studio server will run on `http://localhost:5555`.

