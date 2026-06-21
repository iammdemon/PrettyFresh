const { MongoClient } = require('mongodb');

const uri = "mongodb://prettyfresh_emon:PrettyFresh234145331%24%24%23%23%40%23%23@ac-de1zlyv-shard-00-00.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-01.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-02.xzbetch.mongodb.net:27017/prettyfresh?ssl=true&replicaSet=atlas-o9pkjk-shard-0&authSource=admin&appName=PrettyFresh";

const rawData = `Miniket Rice 25kg|2350|grocery
Nazirshail Rice 25kg|2450|grocery
Premium Basmati Rice 5kg|850|grocery
Red Lentil (Masoor Dal) 1kg|145|grocery
Mung Dal 1kg|180|grocery
Chola Dal 1kg|140|grocery
Soybean Oil 5L|920|grocery
Mustard Oil 1L|240|grocery
Sunflower Oil 1L|320|grocery
Salt 1kg|45|grocery
Sugar 1kg|135|grocery
Flour (Ata) 2kg|150|grocery
Maida 1kg|75|grocery
Suji 500g|55|grocery
Potatoes 1kg|55|vegetables
Onions 1kg|85|vegetables
Tomatoes 1kg|95|vegetables
Green Chili 250g|40|vegetables
Garlic 500g|90|vegetables
Ginger 500g|120|vegetables
Cucumber 1kg|70|vegetables
Carrot 1kg|90|vegetables
Cauliflower (Piece)|60|vegetables
Cabbage (Piece)|55|vegetables
Brinjal 1kg|80|vegetables
Pumpkin (Piece)|180|vegetables
Bottle Gourd (Piece)|70|vegetables
Spinach Bundle|30|vegetables
Coriander Leaves Bundle|20|vegetables
Lemon (4 pcs)|25|vegetables
Banana (Dozen)|120|fruits
Apple 1kg|280|fruits
Orange 1kg|260|fruits
Guava 1kg|90|fruits
Pomegranate 1kg|420|fruits
Mango 1kg|180|fruits
Papaya 1kg|60|fruits
Watermelon (Piece)|220|fruits
Pineapple (Piece)|90|fruits
Coconut (Piece)|70|fruits
Farm Eggs 12 pcs|145|dairy
Duck Eggs 6 pcs|90|dairy
Broiler Chicken 1kg|240|meat
Sonali Chicken 1kg|420|meat
Beef 1kg|850|meat
Mutton 1kg|1100|meat
Rui Fish 1kg|380|meat
Katla Fish 1kg|420|meat
Tilapia Fish 1kg|240|meat
Pangas Fish 1kg|220|meat
Fresh Milk 1L|95|dairy
Yogurt 500g|90|dairy
Butter 200g|180|dairy
Cheese Slice Pack|220|dairy
Powder Milk 500g|420|dairy
Tea Leaves 200g|140|grocery
Instant Coffee 100g|320|grocery
Biscuits Family Pack|120|grocery
Toast Biscuits 300g|95|grocery
Noodles Pack|35|grocery
Vermicelli 200g|45|grocery
Tomato Ketchup 500g|140|grocery
Chili Sauce 300g|95|grocery
Soy Sauce 300ml|110|grocery
Vinegar 250ml|70|grocery
Turmeric Powder 200g|85|grocery
Chili Powder 200g|95|grocery
Coriander Powder 200g|80|grocery
Cumin Powder 100g|110|grocery
Garam Masala 100g|130|grocery
Black Pepper 100g|150|grocery
Dishwashing Liquid 500ml|120|cleaning
Dishwashing Bar|35|cleaning
Laundry Detergent 1kg|180|cleaning
Fabric Softener 500ml|140|cleaning
Toilet Cleaner 750ml|130|cleaning
Floor Cleaner 1L|180|cleaning
Hand Wash 250ml|120|cleaning
Bath Soap Pack (4 pcs)|180|cleaning
Shampoo 340ml|320|cleaning
Toothpaste 150g|140|cleaning
Toothbrush|45|cleaning
Tissue Box|95|cleaning
Kitchen Tissue Roll|120|cleaning
Garbage Bag Pack|80|cleaning
Baby Diaper Small Pack|420|cleaning
Baby Wipes Pack|180|cleaning
Mineral Water 5L|90|beverages
Soft Drink 2L|140|beverages
Energy Drink Can|90|beverages
Fruit Juice 1L|150|beverages
Honey 500g|320|grocery
Peanut Butter 350g|280|grocery
Oats 500g|180|grocery
Cornflakes 500g|320|grocery
Chia Seeds 250g|220|grocery
Almonds 250g|380|grocery
Cashew Nuts 250g|450|grocery
Raisins 250g|180|grocery
Dates 500g|320|grocery`;

async function seed() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB.");
        const db = client.db("prettyfresh");

        // Prepare Categories
        const categoryMap = {
            "grocery": "Grocery & Staples",
            "vegetables": "Fresh Vegetables",
            "fruits": "Fresh Fruits",
            "dairy": "Dairy & Eggs",
            "meat": "Meat & Fish",
            "cleaning": "Household & Cleaning",
            "beverages": "Beverages"
        };

        const existingCategories = await db.collection("categories").find({}).toArray();
        const catIdMap = {};

        for (const [code, name] of Object.entries(categoryMap)) {
            let cat = existingCategories.find(c => c.code === code);
            if (!cat) {
                const res = await db.collection("categories").insertOne({ name, code });
                catIdMap[code] = res.insertedId.toString();
                console.log(`Created category ${name}`);
            } else {
                catIdMap[code] = cat._id.toString();
            }
        }

        const lines = rawData.split('\n').filter(l => l.trim() !== "");
        const newProducts = lines.map(line => {
            const [rawName, priceStr, categoryCode] = line.split('|');
            const price = Number(priceStr);

            // Extract weight (last token or inside parenthesis)
            let weight = "1 unit";
            let cleanName = rawName.trim();
            const match = rawName.match(/\s(\d+kg|\d+g|\d+L|\d+ml|\(Piece\)|\d+\spcs|Bundle|Small Pack|Family Pack)$/i);
            if (match) {
                weight = match[1].replace('(', '').replace(')', '');
                cleanName = rawName.replace(match[0], '').trim();
            }

            return {
                name: rawName,
                category: catIdMap[categoryCode] || categoryCode,
                image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&auto=format&fit=crop&q=80",
                variants: [
                    { weight, price }
                ],
                badge: "Fresh",
                freshness: "100% Quality Assured",
                createdAt: new Date()
            };
        });

        const result = await db.collection("products").insertMany(newProducts);
        console.log(`Inserted ${result.insertedCount} products!`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

seed();
