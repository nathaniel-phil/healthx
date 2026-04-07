'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import Link from 'next/link'
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  nodeType: 'group' | 'establishment'
  ownershipType?: string
  estType?: string
  city?: string
  country?: string
  nbEstablishments?: number
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
}

// ─── Colour palettes ─────────────────────────────────────────────────────────

const OWNERSHIP_COLOR: Record<string, string> = {
  INDEPENDENT: '#6B7280',
  GROUP:       '#2563EB',
  PE_BACKED:   '#EC4899',
  LISTED:      '#7C3AED',
  FAMILY:      '#D97706',
}

const EST_TYPE_COLOR: Record<string, string> = {
  LONG_TERM_CARE: '#D97706',
  ACUTE_CARE:     '#DC2626',
  MENTAL_HEALTH:  '#7C3AED',
  NEW_MEDICINE:   '#059669',
  PALLIATIVE:     '#6B7280',
  PRIMARY_CARE:   '#2563EB',
}

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM_CARE: 'Long-term care',
  ACUTE_CARE:     'Acute care',
  MENTAL_HEALTH:  'Mental health',
  NEW_MEDICINE:   'New medicine',
  PALLIATIVE:     'Palliative',
  PRIMARY_CARE:   'Primary care',
}

const OWNERSHIP_LABELS: Record<string, string> = {
  INDEPENDENT: 'Independent',
  GROUP:       'Group',
  PE_BACKED:   'PE-backed',
  LISTED:      'Listed',
  FAMILY:      'Family',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nodeColor(d: GraphNode): string {
  if (d.nodeType === 'group') {
    return OWNERSHIP_COLOR[d.ownershipType ?? ''] ?? '#6B7280'
  }
  return EST_TYPE_COLOR[d.estType ?? ''] ?? '#9CA3AF'
}

function nodeRadius(d: GraphNode): number {
  if (d.nodeType === 'group') {
    return Math.max(10, Math.min(28, Math.sqrt(d.nbEstablishments ?? 1) * 3.5))
  }
  return 5
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OwnershipGraph({ nodes, links }: Props) {
  const svgRef      = useRef<SVGSVGElement>(null)
  const zoomRef     = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; node: GraphNode } | null>(null)

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition().duration(300)
      .call(zoomRef.current.scaleBy, factor)
  }, [])

  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    const { width, height } = svgRef.current.getBoundingClientRect()
    d3.select(svgRef.current)
      .transition().duration(400)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7))
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el || nodes.length === 0) return

    const { width, height } = el.getBoundingClientRect()

    // ── Clean up ──────────────────────────────────────────────
    d3.select(el).selectAll('*').remove()

    // ── SVG scaffold ─────────────────────────────────────────
    const svg = d3.select(el)
    const g   = svg.append('g').attr('class', 'graph-root')

    // ── Zoom ─────────────────────────────────────────────────
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 6])
      .on('zoom', event => g.attr('transform', event.transform))

    zoomRef.current = zoom
    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.65))

    // ── Simulation ───────────────────────────────────────────
    const simNodes: GraphNode[] = nodes.map(n => ({ ...n }))
    const simLinks: GraphLink[] = links.map(l => ({ ...l }))

    const simulation = d3.forceSimulation<GraphNode>(simNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(simLinks)
        .id(d => d.id)
        .distance(d => {
          const target = d.target as GraphNode
          return target.nodeType === 'establishment' ? 55 : 120
        })
        .strength(0.6)
      )
      .force('charge', d3.forceManyBody<GraphNode>()
        .strength(d => d.nodeType === 'group' ? -400 : -40)
      )
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide<GraphNode>()
        .radius(d => nodeRadius(d) + 3)
      )

    // ── Edges ────────────────────────────────────────────────
    const link = g.append('g').attr('class', 'links')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.7)

    // ── Nodes ────────────────────────────────────────────────
    const node = g.append('g').attr('class', 'nodes')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(simNodes)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', nodeColor)
      .attr('stroke', 'white')
      .attr('stroke-width', d => d.nodeType === 'group' ? 2.5 : 1.5)
      .attr('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelected(d)
        setTooltip(null)
      })
      .on('mouseover', (event, d) => {
        const rect = el.getBoundingClientRect()
        setTooltip({
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 8,
          node: d,
        })
        d3.select(event.currentTarget)
          .transition().duration(150)
          .attr('stroke', '#1B4FD8')
          .attr('stroke-width', 2.5)
      })
      .on('mouseleave', (event, d) => {
        setTooltip(null)
        d3.select(event.currentTarget)
          .transition().duration(150)
          .attr('stroke', 'white')
          .attr('stroke-width', d.nodeType === 'group' ? 2.5 : 1.5)
      })
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )

    // ── Group labels ─────────────────────────────────────────
    const label = g.append('g').attr('class', 'labels')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(simNodes.filter(n => n.nodeType === 'group'))
      .join('text')
      .text(d => d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name)
      .attr('font-size', '9px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('fill', '#6B7280')
      .attr('pointer-events', 'none')
      .attr('dy', d => nodeRadius(d) + 11)

    // ── Tick ─────────────────────────────────────────────────
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0)

      node
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0)

      label
        .attr('x', d => d.x ?? 0)
        .attr('y', d => d.y ?? 0)
    })

    // Click on background → deselect
    svg.on('click', () => { setSelected(null); setTooltip(null) })
    node.on('click.stop', event => event.stopPropagation())

    return () => {
      simulation.stop()
    }
  }, [nodes, links])

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      {/* SVG canvas */}
      <svg ref={svgRef} className="w-full h-full" />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs z-20 max-w-[200px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold text-gray-900 truncate">{tooltip.node.name}</p>
          {tooltip.node.nodeType === 'group' ? (
            <>
              <p className="text-gray-500">{OWNERSHIP_LABELS[tooltip.node.ownershipType ?? '']}</p>
              <p className="text-primary">{tooltip.node.nbEstablishments} establishments</p>
            </>
          ) : (
            <>
              <p className="text-gray-500">{TYPE_LABELS[tooltip.node.estType ?? '']}</p>
              {tooltip.node.city && <p className="text-gray-400">{tooltip.node.city}</p>}
            </>
          )}
        </div>
      )}

      {/* Selected node panel */}
      {selected && (
        <div className="absolute top-4 right-4 w-64 card p-4 shadow-lg z-20">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            onClick={() => setSelected(null)}
          >
            <X size={14} />
          </button>
          <div className="pr-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {selected.nodeType === 'group' ? 'Group' : 'Establishment'}
            </div>
            <p className="font-semibold text-gray-900 mb-2 leading-snug">{selected.name}</p>

            {selected.nodeType === 'group' ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ownership</span>
                  <span className="font-medium capitalize">
                    {OWNERSHIP_LABELS[selected.ownershipType ?? ''] ?? selected.ownershipType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Country</span>
                  <span className="font-medium">{selected.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sites</span>
                  <span className="font-medium">{selected.nbEstablishments}</span>
                </div>
                <Link
                  href={`/group/${selected.id}`}
                  className="block mt-3 btn-primary w-full justify-center text-xs py-1.5"
                >
                  View group profile →
                </Link>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{TYPE_LABELS[selected.estType ?? ''] ?? selected.estType}</span>
                </div>
                {selected.city && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">City</span>
                    <span className="font-medium">{selected.city}</span>
                  </div>
                )}
                <Link
                  href={`/establishment/${selected.id}`}
                  className="block mt-3 btn-primary w-full justify-center text-xs py-1.5"
                >
                  View establishment →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
        <button
          onClick={() => handleZoom(1.4)}
          className="w-8 h-8 card flex items-center justify-center hover:bg-gray-50 shadow"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => handleZoom(1 / 1.4)}
          className="w-8 h-8 card flex items-center justify-center hover:bg-gray-50 shadow"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 card flex items-center justify-center hover:bg-gray-50 shadow"
          title="Reset view"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
