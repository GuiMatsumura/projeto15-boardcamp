import { Router } from 'express';
import {
  getCategories,
  postCategories,
  getGames,
  postGames,
} from '../controllers/generalController.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', postCategories);
router.get('/games', getGames);
router.post('/games', postGames);

export default router;
