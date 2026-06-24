import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import testPrisma from "./setup.js";

// Mock the prisma singleton to use the test client
vi.mock("../../lib/prisma.js", () => ({
	default: testPrisma,
}));

// Import app AFTER mocking prisma
const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
	beforeEach(async () => {
		// Clean up database between tests
		await testPrisma.task.deleteMany();
	});

	afterAll(async () => {
		await testPrisma.$disconnect();
	});

	describe("POST /api/tasks", () => {
		it("should create a new task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "E2E Task", description: "E2E Description" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("E2E Task");
			expect(res.body.description).toBe("E2E Description");
			expect(res.body.completed).toBe(false);
		});

		it("should return 400 when title is missing", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ description: "No title" });

			expect(res.status).toBe(400);
			expect(res.body).toEqual({ error: "Title is required and must be a non-empty string" });
		});
	});

	describe("GET /api/tasks", () => {
		it("should return an empty list initially", async () => {
			const res = await request(app).get("/api/tasks");

			expect(res.status).toBe(200);
			expect(res.body).toEqual([]);
		});

		it("should return created tasks", async () => {
			const createRes = await request(app)
				.post("/api/tasks")
				.send({ title: "List Task", description: "List Description" });

			const res = await request(app).get("/api/tasks");

			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(1);
			expect(res.body[0].title).toBe("List Task");
			expect(res.body[0].description).toBe("List Description");
		});
	});

	describe("GET /api/tasks/:id", () => {
		it("should return 400 for invalid id", async () => {
			const res = await request(app).get("/api/tasks/abc");

			expect(res.status).toBe(400);
			expect(res.body).toEqual({ error: "Invalid task ID" });
		});

		it("should return 404 when task does not exist", async () => {
			const res = await request(app).get("/api/tasks/999");

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ error: "Task not found" });
		});

		it("should return the task by id", async () => {
			const createRes = await request(app)
				.post("/api/tasks")
				.send({ title: "Find Task", description: "Find Desc" });
			const id = createRes.body.id;

			const res = await request(app).get(`/api/tasks/${id}`);

			expect(res.status).toBe(200);
			expect(res.body.id).toBe(id);
			expect(res.body.title).toBe("Find Task");
		});
	});

	describe("PUT /api/tasks/:id", () => {
		it("should return 400 for invalid id", async () => {
			const res = await request(app).put("/api/tasks/abc").send({ title: "New" });

			expect(res.status).toBe(400);
			expect(res.body).toEqual({ error: "Invalid task ID" });
		});

		it("should return 404 when task does not exist", async () => {
			const res = await request(app).put("/api/tasks/999").send({ title: "New" });

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ error: "Task not found" });
		});

		it("should update the task", async () => {
			const createRes = await request(app)
				.post("/api/tasks")
				.send({ title: "Old Title", description: "Old Desc" });
			const id = createRes.body.id;

			const res = await request(app)
				.put(`/api/tasks/${id}`)
				.send({ title: "New Title", completed: true });

			expect(res.status).toBe(200);
			expect(res.body.id).toBe(id);
			expect(res.body.title).toBe("New Title");
			expect(res.body.completed).toBe(true);
		});
	});

	describe("DELETE /api/tasks/:id", () => {
		it("should return 400 for invalid id", async () => {
			const res = await request(app).delete("/api/tasks/abc");

			expect(res.status).toBe(400);
			expect(res.body).toEqual({ error: "Invalid task ID" });
		});

		it("should return 404 when task does not exist", async () => {
			const res = await request(app).delete("/api/tasks/999");

			expect(res.status).toBe(404);
			expect(res.body).toEqual({ error: "Task not found" });
		});

		it("should delete the task and return 204", async () => {
			const createRes = await request(app)
				.post("/api/tasks")
				.send({ title: "Delete Task", description: "Delete Desc" });
			const id = createRes.body.id;

			const res = await request(app).delete(`/api/tasks/${id}`);

			expect(res.status).toBe(204);
		});
	});
});
