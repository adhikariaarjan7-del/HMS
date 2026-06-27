import "dotenv/config";
import app from "./app.js";
import sequelize from "./db/connection.js";
import "./models/User.js"
const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });

    console.log("Models Synced");

    app.listen(PORT, () => {
      console.log(`HMS Server Running on  http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server: ", err);
    process.exit(1);
  }
};
start();
