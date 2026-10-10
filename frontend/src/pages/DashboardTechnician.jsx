import React, { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import TechnicianIncidents from '../components/TechnicianIncidents'

export default function DashboardTechnician() {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  return (
    <DashboardShell
      title="Technician Dashboard"
      roleLabel="Technician"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'TICKETS' && <TechnicianIncidents />}
    </DashboardShell>
  )
}
