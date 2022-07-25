import joi from 'joi';
import dayjs from 'dayjs';

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
      res.status(404).send('deu ruim');
      return;
    }
    res.status(200).send(customerSearch[0]);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function postCustomers(req, res) {
  const customer = req.body;
  // Front-end birthday format YYYY-MM-DD
  const customerSchema = joi.object({
    name: joi.string().min(1).required(),
    phone: joi.string().min(10).max(11).required().pattern(/[0-9]/),
    cpf: joi.string().length(11).required().pattern(/[0-9]/),
    birthday: joi.required(),
  });
  const { error } = customerSchema.validate(customer);
  if (error) {
    res.status(400).send('Dados inválidos.');
  }
  const x = customer.birthday.split('');
  console.log(x);
  try {
    const { rows: searchCpf } = await connection.query(
      'SELECT * FROM customers WHERE cpf = $1',
      [customer.cpf]
    );
    if (searchCpf.length !== 0) {
      res.sendStatus(409);
      return;
    }
    await connection.query(
      'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)',
      [customer.name, customer.phone, customer.cpf, customer.birthday]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function putCustomersId(req, res) {
  const customer = req.body;
  const customerId = req.params;
  // Front-end birthday format YYYY-MM-DD
  const editSchema = joi.object({
    name: joi.string().min(1).required(),
    phone: joi.string().min(10).max(11).required().pattern(/[0-9]/),
    cpf: joi.string().length(11).required().pattern(/[0-9]/),
    birthday: joi.required(),
  });
  const { error } = editSchema.validate(customer);
  if (error) {
    res.sendStatus(400);
    return;
  }
  try {
    const { rows: searchCpf } = await connection.query(
      'SELECT * FROM customers WHERE cpf = $1',
      [customer.cpf]
    );
    if (searchCpf.length !== 0) {
      await connection.query(
        'UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5',
        [
          customer.name,
          customer.phone,
          customer.cpf,
          customer.birthday,
          customerId.id,
        ]
      );
      res.sendStatus(200);
      return;
    }
    res.sendStatus(409);
    return;
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getRentals(req, res) {
  const queryId = req.query;
  try {
    if (queryId.customerId) {
      const { rows: searchCustomerId } = await connection.query(
        `
      SELECT rentals.*, 
      jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
      jsonb_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals 
      JOIN customers ON rentals."customerId" = customers.id
      JOIN games ON rentals."gameId" = games.id
      JOIN categories ON categories.id = games."categoryId"
      WHERE customers.id = $1`,
        [queryId.customerId]
      );
      if (searchCustomerId.length !== 0) {
        res.status(200).send(searchCustomerId);
      } else {
        res.sendStatus(404);
      }
    } else if (queryId.gameId) {
      const { rows: searchGameId } = await connection.query(
        `
      SELECT rentals.*, 
      jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
      jsonb_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals 
      JOIN customers ON rentals."customerId" = customers.id
      JOIN games ON rentals."gameId" = games.id
      JOIN categories ON categories.id = games."categoryId"
      WHERE games.id = $1`,
        [queryId.gameId]
      );
      if (searchGameId.length !== 0) {
        res.status(200).send(searchGameId);
      } else {
        res.sendStatus(404);
      }
    } else {
      const { rows: allRentals } = await connection.query(
        `
            SELECT rentals.*, 
            jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
            jsonb_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
            FROM rentals 
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id
            JOIN categories ON categories.id = games."categoryId"
        `
      );
      if (allRentals.length !== 0) {
        res.status(200).send(allRentals);
      } else {
        res.sendStatus(404);
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function postRentals(req, res) {
  const rental = req.body;
  const rentalSchema = joi.object({
    customerId: joi.number().min(1).required(),
    gameId: joi.number().min(1).required(),
    daysRented: joi.number().min(1).required(),
  });
  const { error } = rentalSchema.validate(rental);
  if (error) {
    res.sendStatus(400);
    return;
  }
  try {
    const { rows: game } = await connection.query(
      'SELECT * FROM games WHERE id = $1',
      [rental.gameId]
    );
    if (game.length === 0) {
      res.sendStatus(400);
      return;
    }

    const { rows: customer } = await connection.query(
      'SELECT * FROM customers WHERE id = $1',
      [rental.customerId]
    );
    if (customer === 0) {
      res.sendStatus(400);
      return;
    }

    const { rows: stock } = await connection.query(
      'SELECT "stockTotal" FROM games WHERE id = $1',
      [rental.gameId]
    );
    if (stock[0].stockTotal < 1) {
      res.sendStatus(400);
      return;
    }

    const price = rental.daysRented * game[0].pricePerDay;

    await connection.query(
      'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        rental.customerId,
        rental.gameId,
        dayjs().format('YYYY-MM-DD'),
        rental.daysRented,
        null,
        price,
        null,
      ]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
