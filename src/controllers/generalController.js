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
  } catch {
    res.status(500).send('Ocorreu um erro. Por favor, tente novamente!');
  }
}
