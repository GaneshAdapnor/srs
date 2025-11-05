const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for development if PostgreSQL is not available
const useSQLite = process.env.DB_TYPE === 'sqlite' || (!process.env.DATABASE_URL && !process.env.DB_HOST);

let sequelize;

if (useSQLite) {
  // SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (common for Render, Heroku, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Use individual connection parameters
  sequelize = new Sequelize(
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
}

module.exports = { sequelize };
