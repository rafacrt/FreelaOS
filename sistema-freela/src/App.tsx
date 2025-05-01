import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import NovaOS from './components/NovaOS'
import DetalhesOS from './components/DetalhesOS'
import EditarOS from './components/EditarOS'
import Header from './components/Header'
import PainelEntidades from './components/PainelEntidades'
import PainelSessoes from './components/PainelSessoes'
import CalendarioSessoes from './components/CalendarioSessoes'
import Calendario from './components/Calendario'
import Login from './components/Login'
import PrivateRoute from './components/PrivateRoute' // 👈 novo import
import CadastroUsuario from './components/CadastroUsuario'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/nova-os" element={<PrivateRoute><NovaOS /></PrivateRoute>}/>
          <Route path="/os/:numero" element={<PrivateRoute><DetalhesOS /></PrivateRoute>}/>
          <Route path="/os/editar/:numero" element={<PrivateRoute><EditarOS /></PrivateRoute>}/>
          <Route path="/admin/entidades" element={<PrivateRoute><PainelEntidades /></PrivateRoute>}/>
          <Route path="/painel/sessoes" element={<PrivateRoute><PainelSessoes /></PrivateRoute>}/>
          <Route path="/painel/calendario" element={<PrivateRoute><CalendarioSessoes /></PrivateRoute>}/>
          <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>}/>
          <Route path="/admin/cadastrar-usuario" element={<CadastroUsuario />} />
        </Routes>
        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />
      </div>
      
    </>
    
  )
  
}



export default App
