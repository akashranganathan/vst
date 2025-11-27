import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
 
import AdminDashboard from "./components/AdminDashboard";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
