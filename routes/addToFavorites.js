const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.post("/", (request, response) => {
    const sqlQuery = `
      INSERT INTO user_favorites (user_id, guitar_id)
      VALUES (1, $1)
      RETURNING *;
    `
    const values = [request.body.product_id]
    console.log('ADDING')
    db.query(sqlQuery, values)
      .then(res => response.json(res.rows))
      .catch(e => console.log(e))
  });
  return router;
};
