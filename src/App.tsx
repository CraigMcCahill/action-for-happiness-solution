import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckInPage from "./components/CheckInPage";
import SignupPage from "./components/SignupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/checkin/:token" element={<CheckInPage />} />
        <Route path="*" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
