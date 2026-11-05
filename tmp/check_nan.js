const { MongoClient } = require('mongodb');

async function check() {
    const client = new MongoClient("mongodb://localhost:27017");
    try {
        await client.connect();
        const db = client.db("web_admissionx_upgrade"); // Based on previous conversations
        const profiles = await db.collection("collegeprofile").find({}).toArray();
        console.log("Total profiles:", profiles.length);
        profiles.forEach(p => {
            if (Number.isNaN(p.users_id)) console.log("NaN users_id in", p._id);
            if (Number.isNaN(p.ranking)) console.log("NaN ranking in", p._id);
            if (Number.isNaN(p.rating)) console.log("NaN rating in", p._id);
            if (Number.isNaN(p.topUniversityRank)) console.log("NaN topUniversityRank in", p._id);
            if (Number.isNaN(p.registeredAddressCityId)) console.log("NaN registeredAddressCityId in", p._id);
        });
    } finally {
        await client.close();
    }
}

check();
