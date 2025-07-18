import dotenv from 'dotenv';
dotenv.config(); 

export const MONGO_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/todolist?retryWrites=true&w=majority&appName=${process.env.DB_APPNAME}`;
