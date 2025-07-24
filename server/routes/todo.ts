import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import { getTodos, updateTodo } from "../controllers/todoController";
import { searchTodos } from "../controllers/searchController";

const router = Router();

// Route to get all todos for the authenticated user
router.get("/todos", verifyToken, getTodos);
router.post("/search", verifyToken, searchTodos);
router.patch("/todos:id", verifyToken, updateTodo);

export default router;
