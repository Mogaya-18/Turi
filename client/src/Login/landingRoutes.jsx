import { Route } from "react-router-dom";
import LandingPage from "./landingPage";

export const landingRoutes = (
  <>
    <Route path="/landing" element={<LandingPage />} />
  </>
);
