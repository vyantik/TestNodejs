import { Router } from "express";
import {
	closeAppeal,
	closePendingAppeals,
	createAppeal,
	getAllAppeals,
	rejectAppeal,
	takeAppeal,
} from "../controllers/appeal.controller";

const appealRouter = Router();

appealRouter.get("/", getAllAppeals);
appealRouter.post("/", createAppeal);
appealRouter.patch("/bulk/close", closePendingAppeals);
appealRouter.post("/:id/reject", rejectAppeal);
appealRouter.post("/:id/close", closeAppeal);
appealRouter.post("/:id/take", takeAppeal);

export default appealRouter;
