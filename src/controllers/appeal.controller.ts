import { Request, Response } from "express";
import { AppealStatus, PrismaClient } from "../../prisma/__generated__";
import { validationResult } from "express-validator";

const appealClient = new PrismaClient().appeal;

export const getAllAppeals = async (req: Request, res: Response) => {
	try {
		const daySortingParams = req.query.date as string;
		const startDate = req.query.start as string;
		const endDate = req.query.end as string;

		if (startDate && endDate && daySortingParams) {
			res.status(400).json({
				message: "Параметры предоставлены не верно",
			});
			return;
		}

		if ((startDate && !endDate) || (!startDate && endDate)) {
			res.status(400).json({
				message: "Параметры предоставлены не верно",
			});
			return;
		}

		if (daySortingParams) {
			const today = new Date(daySortingParams);

			if (isNaN(today.getTime())) {
				res.status(400).json({ message: "Неверный формат даты" });
				return;
			}

			today.setHours(0, 0, 0, 0);

			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);

			const appeals = await appealClient.findMany({
				where: {
					createdAt: {
						gte: today,
						lte: tomorrow,
					},
				},
			});

			res.status(200).json({ data: appeals });
			return;
		}

		if (startDate && endDate) {
			const start = new Date(startDate);

			const end = new Date(endDate);

			if (isNaN(start.getTime()) || isNaN(end.getTime())) {
				res.status(400).json({ message: "Неверный формат даты" });
				return;
			}

			if (end < start) {
				res.status(400).json({
					message: "Конечная дата не может быть раньше начальной",
				});
				return;
			}

			const appeals = await appealClient.findMany({
				where: {
					createdAt: {
						gte: start,
						lte: end,
					},
				},
			});

			res.status(200).json({ data: appeals });
			return;
		}

		const appeals = await appealClient.findMany();

		res.status(200).json({ data: appeals });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createAppeal = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	try {
		const appeal = await appealClient.create({
			data: {
				title: req.body.title,
				description: req.body.description,
			},
		});

		res.status(201).json({ data: appeal });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

export const takeAppeal = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	try {
		const appealId = req.params.id;

		if (!appealId) {
			res.status(400).json({ message: "ID обращения не предоставлен" });
			return;
		}

		const appeal = await appealClient.findUnique({
			where: { id: appealId },
		});

		if (!appeal) {
			res.status(404).json({ message: "Обращение не найдено" });
			return;
		}

		if (appeal.status !== AppealStatus.NEW) {
			res.status(400).json({ message: "Обращение уже обработано" });
			return;
		}

		await appealClient.update({
			where: { id: appealId },
			data: {
				status: AppealStatus.PENDING,
			},
		});

		res.status(200).json({ message: "success" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

export const closeAppeal = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	try {
		const appealId = req.params.id;

		if (!appealId) {
			res.status(400).json({ message: "ID обращения не предоставлен" });
			return;
		}

		const appealSolution = req.body.message;

		if (!appealSolution) {
			res.status(400).json({
				message: "Решение обращения не предоставлено",
			});
			return;
		}

		const appeal = await appealClient.findUnique({
			where: { id: appealId },
		});

		if (!appeal) {
			res.status(404).json({ message: "Обращение не найдено" });
			return;
		}

		if (appeal.status === AppealStatus.NEW) {
			res.status(400).json({ message: "Обращение не взято" });
			return;
		}

		if (appeal?.status !== AppealStatus.PENDING) {
			res.status(400).json({ message: "Обращение уже обработано" });
			return;
		}

		await appealClient.update({
			where: { id: appealId },
			data: {
				responseMessage: appealSolution,
				status: AppealStatus.ACCEPTED,
			},
		});

		res.status(200).json({ message: "success" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

export const rejectAppeal = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	try {
		const appealId = req.params.id;

		if (!appealId) {
			res.status(400).json({ message: "ID обращения не предоставлен" });
			return;
		}

		const appealRejectMessage = req.body.message;

		if (!appealRejectMessage) {
			res.status(400).json({
				message: "Причина отказа не предоставлена",
			});
			return;
		}

		const appeal = await appealClient.findUnique({
			where: { id: appealId },
		});

		if (!appeal) {
			res.status(404).json({ message: "Обращение не найдено" });
			return;
		}

		if (appeal.status === AppealStatus.NEW) {
			res.status(400).json({ message: "Обращение не взято" });
			return;
		}

		if (appeal.status !== AppealStatus.PENDING) {
			res.status(400).json({ message: "Обращение уже обработано" });
			return;
		}

		await appealClient.update({
			where: { id: appealId },
			data: {
				responseMessage: appealRejectMessage,
				status: AppealStatus.REJECTED,
			},
		});

		res.status(200).json({ message: "success" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

export const closePendingAppeals = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	try {
		await appealClient.updateMany({
			where: { status: AppealStatus.PENDING },
			data: {
				status: AppealStatus.REJECTED,
				responseMessage: "Обращение закрыто автоматически",
			},
		});

		res.status(200).json({
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};
