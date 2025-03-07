import { body } from "express-validator";

export const appealDto = [
	body("title").not().isEmpty(),
	body("description").not().isEmpty(),
];

export const appealAnswerDto = [body("message").not().isEmpty()];
