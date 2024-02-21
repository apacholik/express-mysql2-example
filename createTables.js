function createTables(dbConnection) {
  dbConnection.query(
    `
      SELECT *
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${process.env.DB_DATABASE}' AND TABLE_NAME = 'users';
    `,
    function (err, results) {
      const isExist = !!results?.length;
      if (!isExist) {
        dbConnection.query(
          `
            CREATE TABLE users (
              nick varchar(255) NOT NULL,
              PRIMARY KEY (nick)
            );
          `,
          function (err) {
            if (err) {
              throw err;
            }
          }
        );
      }
    }
  );
}

module.exports = createTables;
