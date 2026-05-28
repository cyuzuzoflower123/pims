import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import Login from './pages/Login.jsx'
import Categories from './pages/Categories.jsx'
import Medicines from './pages/Medicines.jsx'
import Inventory from './pages/Inventory.jsx'
import Sales from './pages/Sales.jsx'
import Reports from './pages/Reports.jsx'
import { RequireAuth } from './RequireAuth.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/categories" replace />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/medicine" element={<Medicines />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/categories" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
