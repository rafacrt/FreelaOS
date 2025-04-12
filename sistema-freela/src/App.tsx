import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import NovaOS from './components/NovaOS'
import DetalhesOS from './components/DetalhesOS'
import EditarOS from './components/EditarOS'
import Header from './components/Header'
import PainelEntidades from './components/PainelEntidades'

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
        </Routes>
      </div>
    </>
  )
}

export default App
