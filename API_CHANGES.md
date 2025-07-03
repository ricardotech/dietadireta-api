# API Changes Summary

## New Endpoints

### 1. Combined Meals Endpoint
- **GET** `/api/meals` - Returns all meal types in a structured JSON format:
```json
{
  "breakfast": [...],
  "morningSnack": [...],
  "lunch": [...],
  "afternoonSnack": [...],
  "dinner": [...]
}
```

### 2. Enhanced Prompt Generation with OpenAI
- **POST** `/api/generatePrompt` - Now integrates with OpenAI GPT-4o to generate nutrition plans
- **GET** `/api/generatePrompt` - Retrieves the most recent generated nutrition plan for the authenticated user

## Database Changes

### New Entity: GeneratedPrompt
- Stores AI-generated nutrition plans
- Links to users via userId
- Includes original prompt, AI response, and user data snapshot

## Environment Variables

Add to your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Migration

Run the database migration to create the new table:
```bash
npm run migration:run
```

## Usage Example

### Generate Nutrition Plan
```bash
curl -X POST http://localhost:3000/api/generatePrompt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": "70.5",
    "height": "175.0",
    "age": "25",
    "goal": "emagrecer",
    "calories": "1800",
    "gender": "m",
    "schedule": "personalizado",
    "activityLevel": "sedentario",
    "workoutPlan": "academia",
    "breakfast": "ovos, pão integral, café",
    "morningSnack": "frutas, iogurte",
    "lunch": "arroz, feijão, frango, salada",
    "afternoonSnack": "nuts, chá",
    "dinner": "peixe, legumes, quinoa"
  }'
```

### Get All Meals
```bash
curl -X GET http://localhost:3000/api/meals
```

### Get Generated Nutrition Plan
```bash
curl -X GET http://localhost:3000/api/generatePrompt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
