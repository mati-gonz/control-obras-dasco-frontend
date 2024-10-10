import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/WorksDashboard/Dashboard';
import LoginForm from './components/Auth/LoginForm';
import RegisterUser from './components/Users/RegisterUser';
import UserManagement from './components/Users/UserManagement';
import UserDetail from './components/Users/UserDetail';
import EditUser from './components/Users/EditUser';
import EditWork from './components/WorksDashboard/EditWork';
import CreateWork from './components/WorksDashboard/CreateWork';
import WorkDetail from './components/WorksDashboard/WorkDetail';
import PartDetail from './components/Parts/PartDetail';
import PrivateRoute from './PrivateRoute';  // Importar el PrivateRoute

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta pública para el login */}
                <Route path="/" element={<LoginForm />} />

                {/* Rutas protegidas */}
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="register-user" element={<RegisterUser />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="users/:id/details" element={<UserDetail />} />
                    <Route path="edit-user/:id" element={<EditUser />} />
                    <Route path="edit-work/:id" element={<EditWork />} />
                    <Route path="create-work" element={<CreateWork />} />
                    <Route path="work/:id/details" element={<WorkDetail />} />
                    <Route path="/parts/:partId/detail" element={<PartDetail />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
