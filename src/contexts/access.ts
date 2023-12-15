import { createContext, useContext } from "react";
import { invariant } from "./invariant";

type UsernameUnregisteredState = {
  usernameState: "unregistered";
};
type UsernameRegisteredState = {
  usernameState: "registered";
  username: string;
};
type UserState = UsernameUnregisteredState | UsernameRegisteredState;

export type AccessState = { email: string };

export const AccessContext = createContext<AccessState | undefined>(undefined);

export const useAccess = () => {
  const context = useContext(AccessContext);
  invariant(context, "You must render a <AccessProvider> higher in the tree");
  return context as AccessState;
};
