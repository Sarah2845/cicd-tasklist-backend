import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../controllers/task.controller.js", () => ({
	getAllTasks: vi.fn((req, res) => res.status(200).json({ route: "getAll" })),
	getTaskById: vi.fn((req, res) => res.status(200).json({ route: "getById", id: req.params.id })),
	createTask: vi.fn((req, res) => res.status(201).json({ route: "create", body: req.body })),
	updateTask: vi.fn((req, res) => res.status(200).json({ route: "update", id: req.params.id, body: req.body })),
	deleteTask: vi.fn((req, res) => res.status(204).send()),
}));

import app from "../../app.ts";

describe("App routing", () => {
	it("should respond on GET /api/tasks", async () => {
		const response = await request(app).get("/api/tasks");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ route: "getAll" });
	});

	it("should respond on GET /api/tasks/1", async () => {
		const response = await request(app).get("/api/tasks/1");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ route: "getById", id: "1" });
	});

	it("should respond on POST /api/tasks", async () => {
		const response = await request(app).post("/api/tasks").send({ title: "New Task" });

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ route: "create", body: { title: "New Task" } });
	});

	it("should respond on PUT /api/tasks/1", async () => {
		const response = await request(app).put("/api/tasks/1").send({ title: "Updated" });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ route: "update", id: "1", body: { title: "Updated" } });
	});

	it("should respond on DELETE /api/tasks/1", async () => {
		const response = await request(app).delete("/api/tasks/1");

		expect(response.status).toBe(204);
	});
});
