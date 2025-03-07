import { Router } from "express";
import {
	closeAppeal,
	closePendingAppeals,
	createAppeal,
	getAllAppeals,
	rejectAppeal,
	takeAppeal,
} from "../controllers/appeal.controller";
import { appealAnswerDto, appealDto } from "../middlewares/appeal.dto";

const appealRouter = Router();

appealRouter.get("/", getAllAppeals);
appealRouter.post("/", appealDto, createAppeal);
appealRouter.patch("/bulk/close", closePendingAppeals);
appealRouter.post("/:id/reject", appealAnswerDto, rejectAppeal);
appealRouter.post("/:id/close", appealAnswerDto, closeAppeal);
appealRouter.post("/:id/take", takeAppeal);

export default appealRouter;
