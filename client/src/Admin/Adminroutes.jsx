import { Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import UsersPage from "./UsersPage";
import { RolesPage, SchedulesPage, QueuePage, StockPage, ReportsPage, AuditPage } from "./Subpages.jsx";

// Use inside <Routes>:  {adminRoutes}
export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<UsersPage />} />
    <Route path="roles" element={<RolesPage />} />
    <Route path="schedules" element={<SchedulesPage />} />
    <Route path="queue" element={<QueuePage />} />
    <Route path="stock" element={<StockPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="audit" element={<AuditPage />} />
  </Route>
);