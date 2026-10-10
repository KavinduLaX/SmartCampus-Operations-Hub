import React, { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'
import MyIncidents from '../components/MyIncidents'
import AvailableResources from '../components/AvailableResources'

export default function DashboardUser() {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  return (
    <DashboardShell 
      title="User Dashboard" 
      roleLabel="User"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {activeTab === 'OVERVIEW' && <AvailableResources />}
        {activeTab === 'BOOKINGS' && <UserBookingsPanel />}
        {activeTab === 'TICKETS' && <MyIncidents />}
    </DashboardShell>
  )
}
