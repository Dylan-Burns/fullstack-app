// pages/api/users.js

// Import the function to connect to the database and ObjectId for MongoDB documents.
import connectToDatabase from '../../db/mongodb';
import { ObjectId } from 'mongodb';

// The handler for the API endpoint.
export default async function handler(req, res) {
    // Only allow POST requests to this endpoint for creating new user records.
    if (req.method !== 'POST') {
        // If request is not POST, return 405 Method Not Allowed.
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Extract `name` and `fileSize` from the request body.
    const { name, fileSize } = req.body;

    // Validate the input; both `name` and `fileSize` should be provided.
    if (!name || !fileSize) {
        // If validation fails, return 400 Bad Request with an error message.
        return res.status(400).json({ message: 'Name and fileSize are required' });
    }

    try {
        // Establish a connection to the database.
        const { db } = await connectToDatabase();

        // Create a new record in the 'photos' collection with the provided data.
        const result = await db.collection('photos').insertOne({
            _id: new ObjectId(), // Generate a new ObjectId for this document.
            name, // Name of the user or photo label.
            fileSize, // Size of the file uploaded.
            createdAt: new Date(), // Timestamp for when the record was created.
        });

        // If insertion is successful, return 201 Created with a success message and the inserted ID.
        return res.status(201).json({ message: 'Photo submitted successfully', _id: result.insertedId });
    } catch (error) {
        // Log the error to the server console for debugging.
        console.error('Request error', error);
        // Return 500 Internal Server Error with the error message if the try block fails.
        return res.status(500).json({ error: 'Error processing request' });
    }
}
