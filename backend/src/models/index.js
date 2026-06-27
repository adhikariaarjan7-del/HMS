import sequelize from "../db/connection.js";
import User from "./User.js";
import Patient from "./Patient.js";

User.hasOne(Patient, {foreignKey: "user_id", as: "patientProfile" , onDelete: "CASCADE"});
Patient.belongsTo(User, {foreignKey: "user_id" , as: "account"});

export{sequelize,User,Patient};