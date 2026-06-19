import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
function App() {
 return (
        <BrowserRouter>
            <Routes>
                <Route path='' element={<Login/>}/>
                <Route path='/register' element={<Register/>}/>
                <Route path = "/AdminDash" element={<AdminDashboard/>}/>
                <Route path= "/DoctorDash" element ={<DoctorDashboard/>}/>
                <Route path= "/PatientDash" element ={<PatientDashboard/>}/>
            </Routes>
        </BrowserRouter>
    )
}
  export default App