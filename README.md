# Infollion-tree-visualizer
A fully client-side tree-structure renderer built for the Infollion Software Developer Intern assignment.

Tech Stack
Next.js App Router
TypeScript
React Flow via @xyflow/react
d3-hierarchy for tidy tree layout calculation
Tailwind CSS
shadcn/ui-style components
lucide-react icons
Features
Proper hierarchical tree layout with calculated sibling spacing
Parent nodes centered above their child groups
React Flow edges connecting visible parent-child relationships
Expand/collapse support for every node with children
Smooth layout recalculation after expanding or collapsing
5-level sample tree data
Node metadata display
Search and highlight across label, role, owner, location, status, and notes
Search auto-reveals hidden matching nodes by expanding ancestor paths
Hover and selection highlighting
Auto-pan/zoom with React Flow fitView
MiniMap, zoom controls, and full-canvas interaction
Setup
npm install
npm run dev
Open http://localhost:3000.

Build
npm run build
Note On The PDF Deliverables
The task PDF overview and constraints specify a React Flow tree visualizer and explicitly say the project is fully client-side with no backend required. The deliverables section appears to contain copied backend/API wording from a different task.

This implementation follows the React Flow frontend requirements from the overview, core features, and constraints. No backend was implemented.
