# FinPlanner

A financial planning + investing recommendation platform.

## Features
- **Profile Management**: Track salary, savings, and location.
- **Goal CRUD**: Manage multiple time-horizon-based goals.
- **AI Recommendation Engine**: Intelligent asset allocation using Gemini 3.
- **AI Coaching**: Personal financial coaching notes.
- **Data Export**: Export your generated investment plan as a CSV.

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Create a `.env` file based on `.env.example`.
   - Add your `API_KEY` for the Gemini API.

3. **Database (Reference)**
   - The provided implementation is an SPA using `localStorage` for immediate usability.
   - For a production Next.js deployment, use the provided `prisma/schema.prisma`:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

## Seed Data Suggestions
For testing, try these profiles:
- **Young Professional**: 25yr, $110k salary, Aggressive goals, $2k monthly investable.
- **Established Family**: 40yr, $200k salary, Moderate goals, $5k monthly investable.
- **Conservative Saver**: 55yr, $90k salary, Low risk, $1k monthly investable.

## Disclaimer
FinPlanner is an educational tool. It does not provide certified financial advice.