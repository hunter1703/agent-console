'use client'

import { useState } from 'react'
import { DynamicForm } from '@/components/forms/DynamicForm'
import type { AssetType, BuilderMode } from '@/lib/types/schema'
import { motion } from 'framer-motion'

export default function SchemaDemo() {
  const [assetType, setAssetType] = useState<AssetType>('Agent')
  const [mode, setMode] = useState<BuilderMode>('CREATE')
  const [initialData, setInitialData] = useState<Record<string, any>>({})

  // Mock submit handler
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert(`${mode} ${assetType} successful!\n\nData:\n${JSON.stringify(data, null, 2)}`)
  }

  // Load sample data for EDIT/VIEW modes
  const loadSampleData = () => {
    const sampleAgent = {
      name: 'Sample Agent',
      description: 'This is a sample agent for testing',
      avatar: 'https://example.com/avatar.png',
      contextStrategy: {
        type: 'COMPACTION',
        enabled: true,
        tokenThreshold: 4096,
        keepLastTokens: 1024,
      },
    }

    const sampleModel = {
      name: 'Sample Model',
      description: 'This is a sample model for testing',
      provider: 'OPENAI',
      modelId: 'gpt-4',
    }

    setInitialData(assetType === 'Agent' ? sampleAgent : sampleModel)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">Dynamic Form Demo</h1>
          <p className="text-text-secondary">
            Schema-driven forms that adapt based on backend configuration. Try different asset types and modes.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-surface p-6 rounded-lg border border-border-subtle space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Form Configuration</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Asset Type
              </label>
              <select
                value={assetType}
                onChange={(e) => {
                  setAssetType(e.target.value as AssetType)
                  setInitialData({})
                }}
                className="w-full px-4 py-2 bg-background border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="Agent">Agent</option>
                <option value="Model">Model</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => {
                  const newMode = e.target.value as BuilderMode
                  setMode(newMode)
                  
                  // Load sample data for EDIT/VIEW modes
                  if (newMode !== 'CREATE') {
                    loadSampleData()
                  } else {
                    setInitialData({})
                  }
                }}
                className="w-full px-4 py-2 bg-background border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="CREATE">CREATE - New {assetType}</option>
                <option value="EDIT">EDIT - Modify Existing</option>
                <option value="VIEW">VIEW - Read Only</option>
              </select>
            </div>
          </div>

          {/* Mode Descriptions */}
          <div className="bg-background p-4 rounded-lg border border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Current Mode:</h3>
            {mode === 'CREATE' && (
              <p className="text-sm text-text-secondary">
                <strong>CREATE</strong> - All editable fields are shown. Required fields are marked with *.
              </p>
            )}
            {mode === 'EDIT' && (
              <p className="text-sm text-text-secondary">
                <strong>EDIT</strong> - Form is pre-filled with existing data. Some fields may be read-only.
              </p>
            )}
            {mode === 'VIEW' && (
              <p className="text-sm text-text-secondary">
                <strong>VIEW</strong> - All fields are read-only. Form cannot be submitted.
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Form */}
        <motion.div
          key={`${assetType}-${mode}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface p-8 rounded-lg border border-border-subtle"
        >
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            {mode} {assetType}
          </h2>

          <DynamicForm
            assetType={assetType}
            mode={mode}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => {
              console.log('Form cancelled')
              setInitialData({})
            }}
          />
        </motion.div>

        {/* Instructions */}
        <div className="bg-primary-light p-6 rounded-lg border border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-3">💡 Try This</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Switch between Agent and Model to see different form structures</li>
            <li>• Try CREATE mode to see all editable fields</li>
            <li>• Try EDIT mode to see pre-filled data (sample data is loaded automatically)</li>
            <li>• Try VIEW mode to see read-only fields</li>
            <li>• Fill in fields and watch conditional rules hide/show other fields</li>
            <li>• Submit the form to see the collected data in an alert</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
