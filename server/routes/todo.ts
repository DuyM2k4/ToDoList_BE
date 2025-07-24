import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { getTodos, createTodo } from "../controllers/todoController";
import { searchTodos } from "../controllers/searchController";

const router = Router();

// Route to get all todos for the authenticated user
router.get("/todos", verifyToken, getTodos);
router.post("/todos", verifyToken, createTodo);
router.post("/search", verifyToken, searchTodos);


export default router;
