import {BrowserRouter, Route, Routes} from "react-router-dom"
import AdminPanel from "./pages/AdminPanel.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

function App() {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
