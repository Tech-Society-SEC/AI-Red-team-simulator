import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ui";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Management from "./pages/Management";

export default function App() {
  console.log("API Base URL →", import.meta.env.VITE_API_BASE_URL);
  
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/management" element={<Management />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
