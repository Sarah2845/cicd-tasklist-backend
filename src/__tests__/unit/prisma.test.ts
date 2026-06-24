import { describe, it, expect } from "vitest";
import prisma from "../../lib/prisma.js";

describe("Prisma client module", () => {
	it("should export the prisma client instance", () => {
		expect(prisma).toBeDefined();
		expect(typeof prisma).toBe("object");
		expect(typeof prisma.$connect).toBe("function");
	});
});
