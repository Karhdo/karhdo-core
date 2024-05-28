module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5410,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
  },
  test: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'roku',
    password: 'roku',
    database: 'test',
  },
  production: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'roku',
    password: 'roku',
    database: 'prod',
  },
};
