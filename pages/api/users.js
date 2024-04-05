// pages/api/users.js
import connectToDatabase from '../../db/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, fileSize } = req.body;

    // Validate the input
    if (!name || !fileSize) {
        return res.status(400).json({ message: 'Name and fileSize are required' });
    }

    try {
        const { db } = await connectToDatabase();

        // Create a new record in the database
        const result = await db.collection('photos').insertOne({
            _id: new ObjectId(),
            name,
            fileSize,
            createdAt: new Date(),
        });

        return res.status(201).json({ message: 'Photo submitted successfully', _id: result.insertedId });
    } catch (error) {
        console.error('Request error', error);
        return res.status(500).json({ error: 'Error processing request' });
    }
}
