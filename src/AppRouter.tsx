import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

import AdminDashboard from "./components/AdminDashboard";

import VSTLitsDashboard from "./components/VSTLitsDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lists" element={<VSTLitsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
