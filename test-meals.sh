#!/bin/bash

# Test script for Nutri Online API - Meals endpoints
echo "🧪 Testing Nutri Online API - Meals Endpoints"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"
ENDPOINTS=(
  "/api/meals/breakfast"
  "/api/meals/morning-snack"
  "/api/meals/lunch"
  "/api/meals/afternoon-snack"
  "/api/meals/dinner"
)

echo "📊 Server Health Check"
echo "---------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$response" = "200" ]; then
  echo "✅ Server is running (HTTP $response)"
else
  echo "❌ Server is not responding (HTTP $response)"
  exit 1
fi
echo ""

echo "🍽️  Testing Meals Endpoints"
echo "----------------------------"

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: $endpoint"
  
  # Check HTTP status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
  
  if [ "$status" = "200" ]; then
    # Get response and count items
    response=$(curl -s "$BASE_URL$endpoint")
    count=$(echo "$response" | jq '. | length')
    
    echo "✅ Status: $status | Items: $count"
    
    # Validate first item structure
    first_item=$(echo "$response" | jq '.[0]')
    has_id=$(echo "$first_item" | jq 'has("id")')
    has_name=$(echo "$first_item" | jq 'has("name")')
    has_created=$(echo "$first_item" | jq 'has("createdAt")')
    has_updated=$(echo "$first_item" | jq 'has("updatedAt")')
    
    if [ "$has_id" = "true" ] && [ "$has_name" = "true" ] && [ "$has_created" = "true" ] && [ "$has_updated" = "true" ]; then
      echo "✅ Schema validation passed"
    else
      echo "❌ Schema validation failed"
    fi
  else
    echo "❌ Status: $status"
  fi
  echo ""
done

echo "🔍 Testing Error Handling"
echo "-------------------------"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/meals/invalid-endpoint")
if [ "$status" = "404" ]; then
  echo "✅ 404 error handling works correctly"
else
  echo "❌ Error handling not working (got $status, expected 404)"
fi
echo ""

echo "🎉 All tests completed!"
