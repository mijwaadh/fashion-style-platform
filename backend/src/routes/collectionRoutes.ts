import express from 'express';
import {
    createCollection,
    getUserCollections,
    getCollectionById,
    toggleLookInCollection,
    deleteCollection
} from '../controllers/collectionController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.route('/')
    .post(protect, createCollection)
    .get(protect, getUserCollections);

router.route('/:id')
    .get(getCollectionById) // protect is handled conditionally inside the controller
    .delete(protect, deleteCollection);

router.route('/:id/looks')
    .post(protect, toggleLookInCollection);

export default router;
