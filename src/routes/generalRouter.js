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
  getRentals,
  postRentals,
  postReturnRental,
  deleteRental,
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
router.get('/rentals', getRentals);
router.post('/rentals', postRentals);
router.post('/rentals/:id/return', postReturnRental);
router.delete('/rentals/:id', deleteRental);

export default router;
