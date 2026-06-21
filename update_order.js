const { MongoClient } = require('mongodb');

const uri = "mongodb://prettyfresh_emon:PrettyFresh234145331%24%24%23%23%40%23%23@ac-de1zlyv-shard-00-00.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-01.xzbetch.mongodb.net:27017,ac-de1zlyv-shard-00-02.xzbetch.mongodb.net:27017/prettyfresh?ssl=true&replicaSet=atlas-o9pkjk-shard-0&authSource=admin&appName=PrettyFresh";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("prettyfresh");
        
        // Let's find the current status first
        const order = await db.collection("orders").findOne({ orderId: "PF-96153881" });
        console.log("Current order details:", order);

        // Update the status to 'Delivered'
        const result = await db.collection("orders").updateOne(
            { orderId: "PF-96153881" },
            { $set: { status: "Delivered", updatedAt: new Date() } }
        );
        console.log("Database update result:", result);
    } catch (e) {
        console.error("Error updating order:", e);
    } finally {
        await client.close();
    }
}

run();
