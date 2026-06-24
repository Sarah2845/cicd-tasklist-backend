import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@prisma/client";

// Mock the prisma module before importing the service
vi.mock("../../lib/prisma.js", () => {
	return {
		default: {
			task: {
				findMany: vi.fn(),
				findUnique: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
			},
		},
	};
});

import prisma from "../../lib/prisma.js";
import * as taskService from "../../services/task.service.js";

const mockPrisma = vi.mocked(prisma);

const mockTask: Task = {
	id: 1,
	title: "Test Task",
	description: "A test task description",
	completed: false,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("TaskService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("findAll", () => {
		it("should return all tasks ordered by createdAt desc", async () => {
			const tasks = [mockTask];
			(mockPrisma.task.findMany as any).mockResolvedValue(tasks);

			const result = await taskService.findAll();

			expect(result).toEqual(tasks);
			expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: "desc" },
			});
		});
	});

	describe("findById", () => {
		it("should return a task when found", async () => {
			(mockPrisma.task.findUnique as any).mockResolvedValue(mockTask);

			const result = await taskService.findById(1);

			expect(result).toEqual(mockTask);
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it("should return null when task is not found", async () => {
			(mockPrisma.task.findUnique as any).mockResolvedValue(null);

			const result = await taskService.findById(999);

			expect(result).toBeNull();
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
		});
	});

	describe("create", () => {
		it("should create a new task", async () => {
			const input = { title: "New Task", description: "Desc" };
			const createdTask = { ...mockTask, id: 2, title: input.title, description: input.description };
			(mockPrisma.task.create as any).mockResolvedValue(createdTask);

			const result = await taskService.create(input);

			expect(result).toEqual(createdTask);
			expect(mockPrisma.task.create).toHaveBeenCalledWith({ data: { title: "New Task", description: "Desc" } });
		});
	});

	describe("update", () => {
		it("should update a task when it exists", async () => {
			const updateData = { title: "Updated Title", completed: true };
			(mockPrisma.task.findUnique as any).mockResolvedValue(mockTask);
			(mockPrisma.task.update as any).mockResolvedValue({ ...mockTask, ...updateData });

			const result = await taskService.update(1, updateData);

			expect(result).toEqual({ ...mockTask, ...updateData });
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(mockPrisma.task.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData });
		});

		it("should throw if task does not exist", async () => {
			(mockPrisma.task.findUnique as any).mockResolvedValue(null);

			await expect(taskService.update(1, { title: "Nope" })).rejects.toThrow("Task not found");
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(mockPrisma.task.update).not.toHaveBeenCalled();
		});
	});

	describe("remove", () => {
		it("should delete a task when it exists", async () => {
			(mockPrisma.task.findUnique as any).mockResolvedValue(mockTask);
			(mockPrisma.task.delete as any).mockResolvedValue(mockTask);

			const result = await taskService.remove(1);

			expect(result).toEqual(mockTask);
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it("should throw if task does not exist", async () => {
			(mockPrisma.task.findUnique as any).mockResolvedValue(null);

			await expect(taskService.remove(1)).rejects.toThrow("Task not found");
			expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(mockPrisma.task.delete).not.toHaveBeenCalled();
		});
	});
});
