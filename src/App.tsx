import { Route, Routes } from "react-router-dom"
import Dashboard from "./components/dashboard/Dashboard"
import CampaignDetailPage from "./components/campaigndetail/CampaignDetailView"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaign/:id" element={<CampaignDetailPage />} />
      </Routes>
    </div>
  )
}

export default App