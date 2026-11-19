'use client'

import { PlanWidget } from '@/components/chat/PlanWidget'
import type { Plan } from '@/types/planning'

export default function PlanningDemoPage() {
  // Mock planning data - matches backend Plan.java structure
  const mockPlan: Plan = {
    planId: 'plan-demo-1',
    title: 'Build Agent Console V2',
    goal: 'Create a production-ready web interface for the agent runtime with premium design and animations',
    status: 'IN_PROGRESS',
    tasks: [
      {
        name: 'Setup project structure',
        goal: 'Initialize Next.js project with TypeScript and Tailwind',
        description: 'Create the foundational project structure with all necessary dependencies and configuration files',
        status: 'COMPLETED',
      },
      {
        name: 'Implement design system',
        goal: 'Build reusable UI components following Unseen design principles',
        description: 'Create a comprehensive design system with buttons, inputs, cards, and animations',
        status: 'COMPLETED',
      },
      {
        name: 'Build planning card',
        goal: 'Create an elegant planning visualization component',
        description: 'Design and implement a premium planning card with hierarchical tasks, animations, and full data model support',
        status: 'IN_PROGRESS',
      },
      {
        parent: 'Build planning card',
        name: 'Design planning card layout',
        goal: 'Create wireframes and design mockups',
        status: 'COMPLETED',
      },
      {
        parent: 'Build planning card',
        name: 'Implement task hierarchy',
        goal: 'Support nested tasks with parent-child relationships',
        status: 'COMPLETED',
      },
      {
        parent: 'Build planning card',
        name: 'Add Unseen animations',
        goal: 'Character-by-character text, magnetic hover, font switching',
        status: 'IN_PROGRESS',
      },
      {
        name: 'Integrate with backend',
        goal: 'Connect to agent runtime REST API',
        description: 'Implement API client and real-time updates for agent sessions',
        status: 'TODO',
      },
      {
        name: 'Deploy to production',
        goal: 'Launch the application on Vercel',
        status: 'TODO',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">
            Plan Widget Demo
          </h1>
          <p className="text-text-secondary">
            Compact bento-style widget with at-a-glance status and snappy interactions
          </p>
        </div>

        {/* Plan Widget */}
        <div className="max-w-2xl mx-auto">
          <PlanWidget plan={mockPlan} />
        </div>

        {/* Features List */}
        <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">✅ Plan Widget Features</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>✅ Compact bento-style design for at-a-glance status</li>
            <li>✅ Hierarchical task structure with parent-child relationships</li>
            <li>✅ Task status indicators (TODO, IN_PROGRESS, COMPLETED)</li>
            <li>✅ Expandable tasks to see details and subtasks</li>
            <li>✅ Smooth animations with Framer Motion</li>
            <li>✅ Respects prefers-reduced-motion</li>
            <li>✅ Follows UNSEEN_DESIGN_ANALYSIS.md (restrained elegance)</li>
            <li>✅ Matches backend Plan.java data model</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
