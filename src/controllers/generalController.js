import connection from "../db/postgres.js";

export async function getCategories(req, res) {
  try {
    const { rows: x } = await connection.query("select * from categories");
    res.status(200).send(x);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}
