import joi from 'joi';

import connection from '../db/postgres.js';

export async function getCategories(req, res) {
  try {
    const { rows: x } = await connection.query('select * from categories');
    res.status(200).send(x);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function postCategories(req, res) {
  const newCategory = req.body;
  const categorySchema = joi.object({
    name: joi.string().min(1).required(),
  });
  const { error } = categorySchema.validate(newCategory);
  if (error) {
    res.status(400).send('Este nome não é válido.');
    return;
  }
  try {
    const { rows: categorieExist } = await connection.query(
      'SELECT * FROM categories WHERE name = $1',
      [newCategory.name]
    );
    if (categorieExist.length !== 0) {
      res.status(409).send('Esta categoria já existe.');
      return;
    }
    await connection.query('INSERT INTO categories (name) VALUES ($1)', [
      newCategory.name,
    ]);
    res.status(201).send('Categoria criada com sucesso!');
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getGames(req, res) {
  const game = req.query;
  try {
    if (game.name) {
      const { rows: gameSearch } = await connection.query(
        'SELECT * FROM games WHERE name ILIKE $1',
        [game.name + '%']
      );
      if (gameSearch.length === 0) {
        res.status(404).send('Nenhum jogo encontrado');
        return;
      } else {
        const { rows: gameFind } = await connection.query(
          `
        SELECT games.*, categories.name AS "categoryName"
        FROM games JOIN categories
        ON games."categoryId" = categories.id
        WHERE games.name ILIKE $1`,
          [game.name + '%']
        );
        res.status(200).send(gameFind);
      }
    } else {
      const { rows: y } = await connection.query(`
         SELECT games.*, categories.name AS "categoryName"
         FROM games JOIN categories
         ON games."categoryId" = categories.id`);
      res.status(200).send(y);
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function postGames(req, res) {
  const game = req.body;
  const gameSchema = joi.object({
    name: joi.string().min(1).required(),
    image: joi.string().required(),
    stockTotal: joi.number().min(1).required(),
    categoryId: joi.number().min(1).required(),
    pricePerDay: joi.number().min(1).required(),
  });
  const { error } = gameSchema.validate(game);
  if (error) {
    res
      .status(400)
      .send('Por favor, preencha os campos com informações válidas.');
    return;
  }
  try {
    const { rows: gameSearch } = await connection.query(
      'SELECT * FROM games WHERE name = $1',
      [game.name]
    );
    const { rows: categorySearch } = await connection.query(
      'SELECT * FROM categories WHERE id = $1',
      [game.categoryId]
    );
    if (gameSearch.length !== 0) {
      res.status(409).send('Este jogo já existe.');
      return;
    } else if (categorySearch.length === 0) {
      res
        .status(400)
        .send(
          'O jogo não pode ser inserido numa categoria que não existe ainda!'
        );
      return;
    }
    await connection.query(
      'INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)',
      [
        game.name,
        game.image,
        game.stockTotal,
        game.categoryId,
        game.pricePerDay,
      ]
    );
    res.status(201).send('Jogo cadastrado com sucesso!');
  } catch (err) {
    res.status(500).send('err');
  }
}

export async function getCustomers(req, res) {
  const customer = req.query;
  try {
    if (customer.cpf) {
      const { rows: customerSearch } = await connection.query(
        'SELECT * FROM customers WHERE cpf LIKE $1',
        [customer.cpf + '%']
      );
      if (customerSearch.length === 0) {
        res.status(404).send('Nenhum cliente encontrado.');
        return;
      }
    } else {
      const { rows: customerFind } = await connection.query(
        'SELECT * FROM customers'
      );
      res.status(200).send(customerFind);
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getCustomersId(req, res) {
  const id = req.params;
  try {
    const { rows: customerSearch } = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [id.id]
    );
    if (customerSearch.length === 0) {
      res.sendStatus(404);
      return;
    }
    res.status(200).send(customerSearch);
  } catch (err) {
    res.status(500).send(err);
  }
}
