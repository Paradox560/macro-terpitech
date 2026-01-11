from flask import Flask, request, jsonify
from flask_cors import CORS
from ingredient_filtering import filter_ingredients
from gemini_route import generate
import json

app = Flask(__name__)
CORS(app, origins="http://localhost:5000")

# Test API
@app.route('/api/test', methods=['POST'])
def test():
    if request.method == 'POST':
        data = request.json.get("data")
        return jsonify(data), 200
    else:
        return None
    
# Run the web scraping script
@app.route('/api/scrape', methods=['POST'])
def scrape():
    if request.method == 'POST':
        # Here you would call your web scraping function
        # For example: result = web_scraping_function()
        dining_hall = request.json.get("diningHall")
        for i in range(len(dining_hall)):
            if (dining_hall[i] == "Yahentamitsi"):
                dining_hall[i] = "y"
            elif (dining_hall[i] == "South"):
                dining_hall[i] = "south"
        allergens = request.json.get("allergens")
        for i in range(len(allergens)):
            allergens[i] = allergens[i].lower()
        diets = request.json.get("diets")
        for i in range(len(diets)):
            if (diets[i] == "Vegetarian"):
                diets[i] = "vegetarian"
            elif (diets[i] == "Vegan"):
                diets[i] = "vegan"
        meals = request.json.get("meals")
        # print(dining_hall, allergens, diets, meals)
        result = filter_ingredients(dining_hall, allergens, diets, meals)
        # print(result)
        return jsonify(result), 200
    else:
        return None
    
@app.route('/api/gemini', methods=['POST'])
def gemini():
    # let userPrompt = `
    #     Here's my food list for specifically the ${foodList[i].meal} meal, do not create plans for any other meals besides the one specified: ${JSON.stringify(f)}
      
    #     Please create a list of foods and quantities as specified by the JSON format with these nutritional targets:
    #     - Calories: ${Number(inputValueCalories) / len}`;

    #     if (inputValueProtein) {
    #       userPrompt += `\n- Protein: ${Number(inputValueProtein) / len}`;
    #     }

    #     if (inputValueCarbs) {
    #       userPrompt += `\n- Carbs: ${Number(inputValueCarbs) / len}`;
    #     }

    #     if (inputValueFat) {
    #       userPrompt += `\n- Fat: ${Number(inputValueFat) / len}`;
    #     }
    if request.method == 'POST':
        dining_hall = request.json.get("diningHall")
        if (dining_hall == "Yahentamitsi"):
            dining_hall = "y"
        elif (dining_hall == "South"):
            dining_hall = "south"

        allergens = request.json.get("allergens")
        for i in range(len(allergens)):
            allergens[i] = allergens[i].lower()

        diets = request.json.get("diets")
        for i in range(len(diets)):
            if (diets[i] == "Vegetarian"):
                diets[i] = "vegetarian"
            elif (diets[i] == "Vegan"):
                diets[i] = "vegan"

        meals = request.json.get("meals")
        req_number = int(request.json.get("requestNumber"))

        # print(dining_hall, allergens, diets, meals)
        result = filter_ingredients(dining_hall, allergens, diets, meals)

        user_prompts = []
        user_calories = request.json.get("calories")
        user_protein = request.json.get("protein")
        user_fat = request.json.get("fat")
        user_carbs = request.json.get("carbs")

        number_of_meals = int(request.json.get("mealNumber"))

        for _ in range(req_number):
            for m in result:
                ingredients = result[m]

                temp_user_prompt = f"Here's my food list for specifically the {m} meal, do not create plans for any other meals besides the one specified: {ingredients} \n Please create a list of foods and quantities as specified by the JSON format with these nutritional targets: \n - Calories: {float(user_calories) / number_of_meals} "

                if (user_protein):
                    temp_user_prompt += f"\n - Protein: {float(user_protein) / number_of_meals} "
                if (user_carbs):
                    temp_user_prompt += f"\n - Carbs: {float(user_carbs) / number_of_meals} "
                if (user_fat):
                    temp_user_prompt += f"\n - Fat: {float(user_fat) / number_of_meals} "
                
                user_prompts.append(temp_user_prompt)

        gemini_response = [generate(user_prompt) for user_prompt in user_prompts]
        return jsonify(gemini_response), 200
    else:
        return None

if __name__ == "__main__":
    app.run(debug=True)