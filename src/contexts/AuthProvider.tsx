import { PropsWithChildren, useEffect, useState } from "react";
import { match } from "ts-pattern";
import { AuthContext, AuthState } from "./auth";

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [authState, setAuth] = useState<AuthState>();
	useEffect(() => {
		fetch("/api/me").then((res) => {
			match(res.status)
				.with(200, () => {
					setAuth({ isSignedIn: true });
				})
				.with(404, () => {
					setAuth({ isSignedIn: false });
				})
				.otherwise(() => {
					throw new Error("unexpected error");
				});
		});
	}, []);
	if (authState == null) {
		return null;
	}
	return (
		<AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
	);
};
