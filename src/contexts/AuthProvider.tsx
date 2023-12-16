import { PropsWithChildren, useEffect, useState } from "react";
import useSWR from "swr";
import { parse } from "valibot";
import { selectUserSchema } from "../../db/schema";
import { AuthContext, AuthState } from "./auth";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => parse(selectUserSchema, data.user));

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [authState, setAuth] = useState<Omit<AuthState, "mutate">>();
  const { data, isLoading, error, mutate } = useSWR("/api/me", fetcher);
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (error != null) {
      setAuth({ isSignedIn: false });
    } else if (data == null) {
      throw new Error("unexpected error");
    } else {
      setAuth({ isSignedIn: true });
    }
  }, [data, isLoading, error]);

  if (authState == null) {
    return null;
  }
  return (
    <AuthContext.Provider value={{ ...authState, mutate }}>
      {children}
    </AuthContext.Provider>
  );
};
