import { Router } from 'express';
import {
  getCategories,
  postCategories,
  getGames,
  postGames,
  getCustomers,
  getCustomersId,
} from '../controllers/generalController.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', postCategories);
router.get('/games', getGames);
router.post('/games', postGames);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomersId);

export default router;
