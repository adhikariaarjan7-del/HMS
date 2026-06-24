// Using Sequence for connection

import { Sequelize } from "sequelize";
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // mysql username
  process.env.DB_PASSWORD, // mysql password

  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 8000,
    dialect: "mysql",
    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export default sequelize;
