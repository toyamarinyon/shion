import { PropsWithChildren, useEffect, useState } from "react";
import useSWR from "swr";
import { object, parse, string } from "valibot";
import { AccessContext, AccessState } from "./access";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => parse(object({ email: string() }), data));

export const AccessProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [accessState, setAccessState] = useState<AccessState>();
  const { data, isLoading, error } = useSWR("/api/access", fetcher);
  useEffect(() => {
    if (isLoading) {
      return;
    } else if (data == null) {
      throw new Error("unexpected error");
    }
    setAccessState({ email: data.email });
  }, [data, isLoading, error]);

  if (accessState == null) {
    return null;
  }
  return (
    <AccessContext.Provider value={accessState}>
      {children}
    </AccessContext.Provider>
  );
};
