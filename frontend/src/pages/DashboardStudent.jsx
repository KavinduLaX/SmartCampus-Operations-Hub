import React, { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'
import AvailableResources from '../components/AvailableResources'

export default function DashboardStudent() {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  return (
    <DashboardShell 
      title="Student Dashboard" 
      roleLabel="Student"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {activeTab === 'OVERVIEW' && <AvailableResources />}
        {activeTab === 'BOOKINGS' && <UserBookingsPanel />}
    </DashboardShell>
  )
}
