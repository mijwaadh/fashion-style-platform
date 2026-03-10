import express from 'express';
import { getCommentsByLook, addComment } from '../controllers/commentController';
import { protect } from '../middlewares/auth';

const router = express.Router({ mergeParams: true }); // mergeParams is critical here to access :id from parent router!

router.route('/')
    .get(getCommentsByLook)
    .post(protect, addComment);

export default router;
