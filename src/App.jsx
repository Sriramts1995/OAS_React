import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import NFCreate from "./pages/request/createrequest/NfCreate";
import NFView from "./pages/request/viewrequest/NFView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<NFCreate />} />
        <Route path="/view" element={<NFView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
