const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const createTables = require("./createTables");

const connectionSync = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});
const connection = connectionSync.promise();

createTables(connectionSync);

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get("/", async (req, res) => {
  res.send({
    message: "Hello word",
  });
});

app.get("/users", async (req, res) => {
  const [users] = await connection.query(`
    SELECT nick FROM users
  `);

  res.send({
    users: users.map((user) => user.nick),
  });
});

app.post("/user", async (req, res) => {
  const newUserNick = req.body.nick;
  if (!newUserNick) {
    return res.status(400).send({
      message: "body don't have a nick value",
    });
  }

  try {
    await connection.query(`
    INSERT INTO users VALUES ('${newUserNick}');
    `);
  } catch (e) {
    let message = undefined;

    if (e.sqlState === "23000") {
      // NOTE: https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
      message = `user with nick "${newUserNick}" exist`;
    } else {
      message = `something is no yes. Connect to admin`;
    }

    console.error(`${new Date().toISOString()} | ${e.sqlMessage}`);

    return res.status(400).send({
      message,
    });
  }

  return res.sendStatus(200);
});

const server = app.listen(port, () => {
  console.info(`Example app listening on port ${port}`);
});

function closeGracefully(signal) {
  console.info(`Received signal to terminate: ${signal}`);

  server.close();
  // await db.close() if we have a db connection in this app
  process.kill(process.pid, signal);
}
process.once("SIGINT", closeGracefully);
process.once("SIGTERM", closeGracefully);
