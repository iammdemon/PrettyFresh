const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = "mongodb://prettyfresh_emon:PrettyFresh234145331%24%24%23%23%40%23%23@ac-de1zlyv-shard-00-00.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-01.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-02.xzbetch.mongodb.net:27017/prettyfresh?ssl=true&replicaSet=atlas-o9pkjk-shard-0&authSource=admin&appName=PrettyFresh";

async function seed() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("prettyfresh");
        const password = "Password123!";
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        
        const user = {
            name: "Emon Super Admin",
            phone: "01712345678",
            email: "seo.mdemon@gmail.com",
            password: hashedPassword,
            avatar: "/assets/default-avatar.png",
            gender: "Not Specified",
            dob: "",
            address: "Not Provided",
            provider: "Email & Password",
            role: "super_admin",
            createdAt: new Date()
        };

        const result = await db.collection("users").updateOne(
            { email: "seo.mdemon@gmail.com" },
            { $set: user },
            { upsert: true }
        );
        console.log("Seeded user:", result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

seed();
