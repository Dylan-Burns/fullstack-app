// db/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if ((global as any)._mongoClientPromise) { // Adding type assertion
        return (global as any)._mongoClientPromise; // Adding type assertion
    }

    const client = new MongoClient(MONGODB_URI);
    (global as any)._mongoClientPromise = client.connect().then((client): { client: MongoClient; db: Db } => {
        return { client, db: client.db() };
    });
    return (global as any)._mongoClientPromise; // Adding type assertion
}

export default connectToDatabase;
