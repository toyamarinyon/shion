import { OnboardingPage } from "@/components/OnboardingPage";
import { RouteObject } from "react-router-dom";
import { sessionRoute } from "./sessions/_route";
const onboardingRoute: RouteObject = {
  path: "/onboarding",
  element: <OnboardingPage />,
};
export const routes = [sessionRoute, onboardingRoute];
