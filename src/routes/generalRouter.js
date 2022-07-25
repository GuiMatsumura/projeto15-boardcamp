import { Router } from 'express';
import {
  getCategories,
  postCategories,
  getGames,
  postGames,
  getCustomers,
  getCustomersId,
  postCustomers,
  putCustomersId,
} from '../controllers/generalController.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', postCategories);
router.get('/games', getGames);
router.post('/games', postGames);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomersId);
router.post('/customers', postCustomers);
router.put('/customers/:id', putCustomersId);

export default router;
