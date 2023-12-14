export const invariant = (value: unknown, message?: string) => {
	if (value === false || value === null || typeof value === "undefined") {
		throw new Error(message);
	}
};
