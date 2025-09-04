const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for development if PostgreSQL is not available
const useSQLite = process.env.DB_TYPE === 'sqlite' || !process.env.DB_HOST;

const sequelize = useSQLite 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'store_rating_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

module.exports = { sequelize };
