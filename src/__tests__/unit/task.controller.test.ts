import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import type { Task } from "@prisma/client";

// Mock the service module
vi.mock("../../services/task.service.js", () => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
}));

import * as taskService from "../../services/task.service.js";
import * as taskController from "../../controllers/task.controller.js";

const mockService = vi.mocked(taskService);

const mockTask: Task = {
	id: 1,
	title: "Test Task",
	description: "Test description",
	completed: false,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createMockResponse(): Response {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
	} as unknown as Response;
	return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
	return {
		params: {},
		body: {},
		query: {},
		...overrides,
	} as unknown as Request;
}

describe("TaskController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAllTasks", () => {
		it("should return 200 with all tasks", async () => {
			const tasks = [mockTask];
			mockService.findAll.mockResolvedValue(tasks);
			const req = createMockRequest();
			const res = createMockResponse();

			await taskController.getAllTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(tasks);
		});
	});

	describe("getTaskById", () => {
		it("should return 400 for invalid id", async () => {
			const req = createMockRequest({ params: { id: "abc" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});

		it("should return 404 when task is not found", async () => {
			mockService.findById.mockResolvedValue(null);
			const req = createMockRequest({ params: { id: "999" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});

		it("should return 200 with task when found", async () => {
			mockService.findById.mockResolvedValue(mockTask);
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
	});

	describe("createTask", () => {
		it("should return 400 for empty title", async () => {
			const req = createMockRequest({ body: { title: " ", description: "Desc" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Title is required and must be a non-empty string" });
		});

		it("should create a task and return 201", async () => {
			mockService.create.mockResolvedValue(mockTask);
			const req = createMockRequest({ body: { title: "New Task", description: "Desc" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(mockService.create).toHaveBeenCalledWith({ title: "New Task", description: "Desc" });
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
	});

	describe("updateTask", () => {
		it("should return 400 for invalid id", async () => {
			const req = createMockRequest({ params: { id: "abc" }, body: { title: "Hi" } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});

		it("should return 404 when service reports not found", async () => {
			mockService.update.mockRejectedValue(new Error("Task not found"));
			const req = createMockRequest({ params: { id: "999" }, body: { title: "Hi" } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});

		it("should update a task and return 200", async () => {
			const updatedTask = { ...mockTask, title: "Updated" };
			mockService.update.mockResolvedValue(updatedTask);
			const req = createMockRequest({ params: { id: "1" }, body: { title: "Updated" } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(mockService.update).toHaveBeenCalledWith(1, { title: "Updated", description: undefined, completed: undefined });
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(updatedTask);
		});
	});

	describe("deleteTask", () => {
		it("should return 400 for invalid id", async () => {
			const req = createMockRequest({ params: { id: "abc" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});

		it("should return 404 when service reports not found", async () => {
			mockService.remove.mockRejectedValue(new Error("Task not found"));
			const req = createMockRequest({ params: { id: "999" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});

		it("should delete a task and return 204", async () => {
			mockService.remove.mockResolvedValue(mockTask);
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(mockService.remove).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});
	});
});
