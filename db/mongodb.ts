// db/mongodb.ts

// Imports necessary MongoDB classes.
import { MongoClient, Db } from 'mongodb';

// Retrieve MongoDB URI from environment variables.
const MONGODB_URI = process.env.MONGODB_URI as string;

// Check if the MongoDB URI is provided, throw an error if not.
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Function to connect to the MongoDB database.
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    // Check if there's already a connection promise in the global scope to prevent multiple connections.
    if ((global as any)._mongoClientPromise) {
        return (global as any)._mongoClientPromise; // Use existing connection if it's already established.
    }

    // Create a new MongoDB client with the provided URI.
    const client = new MongoClient(MONGODB_URI);

    // Store the connection promise in the global scope so it can be reused throughout the application.
    (global as any)._mongoClientPromise = client.connect().then((client): { client: MongoClient; db: Db } => {
        // When the connection is successful, return the client and database instances.
        return { client, db: client.db() };
    });

    // Return the connection promise.
    return (global as any)._mongoClientPromise;
}

// Export the connectToDatabase function for use in API routes or other server-side logic.
export default connectToDatabase;
