import { describe, it, expect } from "vitest";
import taskRoutes from "../../routes/task.routes.js";

function getRouteDefinitions(router: any) {
	return router.stack
		.filter((layer: any) => layer.route)
		.map((layer: any) => ({
			path: layer.route.path,
			methods: Object.keys(layer.route.methods).sort(),
		}));
}

describe("Task routes", () => {
	it("should define the expected task routes", () => {
		const routes = getRouteDefinitions(taskRoutes);

		expect(routes).toEqual([
			{ path: "/", methods: ["get"] },
			{ path: "/:id", methods: ["get"] },
			{ path: "/", methods: ["post"] },
			{ path: "/:id", methods: ["put"] },
			{ path: "/:id", methods: ["delete"] },
		]);
	});
});
