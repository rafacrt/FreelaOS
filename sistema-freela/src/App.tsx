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

const App = () => {
  return (
    <>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nova-os" element={<NovaOS />} />
          <Route path="/os/:numero" element={<DetalhesOS />} />
          <Route path="/os/editar/:numero" element={<EditarOS />} />
          <Route path="/admin/entidades" element={<PainelEntidades />} />
          <Route path="/painel/sessoes" element={<PainelSessoes />} />
          <Route path="/painel/calendario" element={<CalendarioSessoes />} />
          <Route path="/calendario" element={<Calendario />} />
        </Routes>
      </div>
    </>
  )
}

export default App
