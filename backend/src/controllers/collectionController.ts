import { Request, Response } from 'express';
import Collection from '../models/Collection';

interface AuthRequest extends Request {
    user?: any; // To align with the existing AuthRequest style
}

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, isPrivate } = req.body;

        const collection = new Collection({
            userId: req.user?.id,
            name,
            description,
            isPrivate,
            looks: [],
        });

        const createdCollection = await collection.save();
        res.status(201).json(createdCollection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Server error creating collection' });
    }
};

// @desc    Get logged in user's collections
// @route   GET /api/collections
// @access  Private
export const getUserCollections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const collections = await Collection.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Server error fetching collections' });
    }
};

// @desc    Get a single collection by ID
// @route   GET /api/collections/:id
// @access  Public (if public) or Private (if private)
export const getCollectionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const collection = await Collection.findById(req.params.id).populate('looks');

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        // Check privacy
        if (collection.isPrivate && collection.userId.toString() !== req.user?.id.toString()) {
            res.status(403).json({ message: 'Not authorized to view this collection' });
            return;
        }

        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Server error fetching collection' });
    }
};

// @desc    Add or remove a look from a collection
// @route   POST /api/collections/:id/looks
// @access  Private
// @body    { lookId: string }
export const toggleLookInCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { lookId } = req.body;
        const collectionId = req.params.id;

        const collection = await Collection.findById(collectionId);

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        const currentUserId = req.user?.id;
        if (collection.userId.toString() !== currentUserId?.toString()) {
            res.status(403).json({ message: 'Not authorized to modify this collection' });
            return;
        }

        const lookIndex = collection.looks.findIndex((id) => id.toString() === lookId);

        if (lookIndex === -1) {
            // Add look
            collection.looks.push(lookId);
        } else {
            // Remove look
            collection.looks.splice(lookIndex, 1);
        }

        await collection.save();
        res.json(collection);
    } catch (error) {
        console.error('Error toggling look in collection:', error);
        res.status(500).json({ message: 'Server error modifying collection' });
    }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
export const deleteCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const collectionId = req.params.id;

        const collection = await Collection.findById(collectionId);

        if (!collection) {
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        const currentUserId = req.user?.id;
        if (collection.userId.toString() !== currentUserId?.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this collection' });
            return;
        }

        await collection.deleteOne();
        res.json({ message: 'Collection removed' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Server error deleting collection' });
    }
};
