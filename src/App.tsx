import { useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  Position,
  Edge as FlowEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

type TreeNode = {
  id: string;
  label: string;
  collapsed?: boolean;
  children?: TreeNode[];
};

type LayoutNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasChildren: boolean;
  collapsed: boolean;
  depth: number;
};

type Edge = {
  id: string;
  source: string;
  target: string;
};

type TreeNodeData = {
  label: string;
  hasChildren: boolean;
  collapsed: boolean;
  selected: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
};

const NODE_WIDTH = 132;
const NODE_HEIGHT = 48;
const HORIZONTAL_GAP = 24;
const VERTICAL_GAP = 86;
const CANVAS_PADDING = 60;

const initialTree: TreeNode = {
  id: 'root',
  label: 'Root',
  children: [
    {
      id: 'a',
      label: 'A',
      children: [
        { id: 'a1', label: 'A1' },
        { id: 'a2', label: 'A2' },
      ],
    },
    {
      id: 'b',
      label: 'B',
      children: [
        { id: 'b1', label: 'B1' },
        { id: 'b2', label: 'B2' },
      ],
    },
    {
      id: 'c',
      label: 'C',
      children: [
        {
          id: 'c1',
          label: 'C1',
          children: [
            { id: 'c1a', label: 'C1A' },
            { id: 'c1b', label: 'C1B' },
          ],
        },
        { id: 'c2', label: 'C2' },
      ],
    },
  ],
};

function toggleNode(node: TreeNode, targetId: string): TreeNode {
  if (node.id === targetId && node.children?.length) {
    return { ...node, collapsed: !node.collapsed };
  }

  if (!node.children?.length) {
    return node;
  }

  return {
    ...node,
    children: node.children.map((child) => toggleNode(child, targetId)),
  };
}

function collectLayout(node: TreeNode, depth = 0, originX = 0): { width: number; nodes: LayoutNode[]; edges: Edge[] } {
  const visibleChildren = node.collapsed ? [] : node.children ?? [];
  const childLayouts = visibleChildren.map((child) => collectLayout(child, depth + 1, 0));

  const childWidths = childLayouts.map((layout) => layout.width);
  const totalChildrenWidth = childWidths.reduce((sum, width) => sum + width, 0);
  const gaps = childLayouts.length > 0 ? HORIZONTAL_GAP * (childLayouts.length - 1) : 0;
  const contentWidth = totalChildrenWidth + gaps;
  const width = Math.max(NODE_WIDTH, contentWidth);
  const nodeCenterX = originX + width / 2;
  const nodeY = depth * (NODE_HEIGHT + VERTICAL_GAP);

  const nodes: LayoutNode[] = [
    {
      id: node.id,
      label: node.label,
      x: nodeCenterX,
      y: nodeY,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      hasChildren: (node.children?.length ?? 0) > 0,
      collapsed: Boolean(node.collapsed),
      depth,
    },
  ];

  const edges: Edge[] = [];
  let childOffset = originX + (width - contentWidth) / 2;

  childLayouts.forEach((layout, index) => {
    const childOriginX = childOffset;
    const shiftedNodes = layout.nodes.map((childNode) => ({
      ...childNode,
      x: childNode.x + childOriginX,
    }));
    const shiftedEdges = layout.edges.map((childEdge) => childEdge);

    nodes.push(...shiftedNodes);
    edges.push(...shiftedEdges);

    edges.push({
      id: `${node.id}-${visibleChildren[index].id}`,
      source: node.id,
      target: visibleChildren[index].id,
    });

    childOffset += layout.width + HORIZONTAL_GAP;
  });

  return { width, nodes, edges };
}

function updateTree(node: TreeNode, nodeId: string): TreeNode {
  return toggleNode(node, nodeId);
}

function TreeNodeCard({ id, data }: NodeProps<TreeNodeData>) {
  const toggleLabel = data.collapsed ? 'Expand branch' : 'Collapse branch';

  return (
    <button
      className={`tree-node ${data.selected ? 'is-selected' : ''} ${data.collapsed ? 'is-collapsed' : ''}`}
      type="button"
      title={data.hasChildren ? toggleLabel : data.label}
      onClick={() => data.onSelect(id)}
    >
      <Handle type="target" position={Position.Top} className="tree-node__handle" />
      <span className="tree-node__label">{data.label}</span>
      {data.hasChildren ? (
        <span
          className="tree-node__toggle"
          aria-hidden="true"
          onClick={(event) => {
            event.stopPropagation();
            data.onToggle(id);
          }}
        >
          {data.collapsed ? '+' : '−'}
        </span>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="tree-node__handle" />
    </button>
  );
}

function App() {
  const [tree, setTree] = useState<TreeNode>(initialTree);
  const [selectedId, setSelectedId] = useState('root');

  const layout = useMemo(() => collectLayout(tree), [tree]);
  const canvasWidth = layout.width + CANVAS_PADDING * 2;
  const canvasHeight = Math.max(...layout.nodes.map((node) => node.y)) + NODE_HEIGHT + CANVAS_PADDING * 2;

  const nodes: Node<TreeNodeData>[] = layout.nodes.map((node) => ({
    id: node.id,
    type: 'treeNode',
    position: {
      x: node.x - NODE_WIDTH / 2 + CANVAS_PADDING,
      y: node.y + CANVAS_PADDING,
    },
    data: {
      label: node.label,
      hasChildren: node.hasChildren,
      collapsed: node.collapsed,
      selected: selectedId === node.id,
      onToggle: (nodeId) => setTree((current) => updateTree(current, nodeId)),
      onSelect: setSelectedId,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    },
  }));

  const edges: FlowEdge[] = layout.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#c9d3e5',
    },
    style: {
      stroke: '#c9d3e5',
      strokeWidth: 2,
    },
  }));

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Tree View Visualizer</p>
          <h1>Centered hierarchy with smooth expand and collapse.</h1>
          <p className="hero__copy">
            This client-side renderer keeps parents centered above visible children, recalculates spacing when branches change, and stays readable as the tree grows.
          </p>
        </div>
        <div className="hero__panel">
          <span>Click a node toggle to collapse or expand its descendants.</span>
          <span>Selected node: {selectedId}</span>
        </div>
      </section>

      <section className="canvas-frame">
        <div className="canvas-scroll">
          <div className="tree-canvas" style={{ width: canvasWidth, height: canvasHeight }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={{ treeNode: TreeNodeCard }}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              minZoom={0.45}
              maxZoom={1.6}
              attributionPosition="bottom-left"
            >
              <Background color="#d9e2f1" gap={28} size={1} variant={BackgroundVariant.Dots} />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                nodeStrokeColor={(node) => (node.id === selectedId ? '#2f86eb' : '#5b667c')}
                nodeColor={() => '#5b667c'}
              />
            </ReactFlow>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
