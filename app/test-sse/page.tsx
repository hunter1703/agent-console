'use client'

import { useState, useEffect } from 'react'

export default function TestSSEPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState('Initializing...')
  const [statusColor, setStatusColor] = useState('text-yellow-500')

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    async function test() {
      try {
        // Step 1: Invoke to get sessionId
        addLog('Step 1: Invoking agent...')
        const invokeResponse = await fetch('http://localhost:8080/v1/agent/story_agent/invoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test from browser' })
        })
        
        const invokeData = await invokeResponse.json()
        const sessionId = invokeData.sessionId
        addLog(`Got sessionId: ${sessionId}`)
        
        // Step 2: Connect to SSE stream
        const streamUrl = `http://localhost:8080/v1/session/${sessionId}/stream`
        addLog(`Step 2: Connecting to: ${streamUrl}`)
        
        const es = new EventSource(streamUrl)
        
        es.onopen = () => {
          setStatus('✅ Connected')
          setStatusColor('text-green-500')
          addLog('✅ EventSource.onopen - Connection established!')
        }
        
        let eventCount = 0
        es.onmessage = (event) => {
          eventCount++
          addLog(`✅ Event #${eventCount}: ${event.data.substring(0, 100)}...`)
        }
        
        es.onerror = (error) => {
          setStatus('❌ Error')
          setStatusColor('text-red-500')
          addLog(`❌ EventSource.onerror`)
          addLog(`   readyState: ${es.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`)
          addLog(`   Events received before error: ${eventCount}`)
          
          // Check for common issues
          if (es.readyState === 0) {
            addLog('   DIAGNOSIS: Never reached OPEN state')
            addLog('   Possible causes:')
            addLog('   - CORS headers missing')
            addLog('   - Network/proxy issue')
            addLog('   - SSE format issue')
          } else if (es.readyState === 2) {
            addLog('   DIAGNOSIS: Connection closed')
            if (eventCount === 0) {
              addLog('   No events received - likely a backend issue')
            }
          }
        }
        
        // Auto-close after 10 seconds
        setTimeout(() => {
          addLog(`\nClosing connection after 10 seconds`)
          addLog(`Total events received: ${eventCount}`)
          es.close()
        }, 10000)
        
      } catch (error: any) {
        setStatus('❌ Failed')
        setStatusColor('text-red-500')
        addLog(`❌ Error: ${error.message}`)
      }
    }
    
    test()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">EventSource Connection Test</h1>
      <div className={`text-xl mb-8 ${statusColor}`}>{status}</div>
      <div className="bg-gray-800 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  )
}
