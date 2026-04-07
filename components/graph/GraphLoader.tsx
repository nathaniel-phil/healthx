'use client'

import dynamic from 'next/dynamic'
import type { GraphNode, GraphLink } from './OwnershipGraph'

const OwnershipGraph = dynamic(
  () => import('./OwnershipGraph').then(m => m.OwnershipGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Building ownership graph…</p>
        </div>
      </div>
    ),
  }
)

export function GraphLoader({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) {
  return <OwnershipGraph nodes={nodes} links={links} />
}
