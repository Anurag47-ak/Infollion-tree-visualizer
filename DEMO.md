# Demo Walkthrough

Use this script for a short live walkthrough of the tree visualizer.

## Open

1. Start the app with `npm install` and `npm run dev`.
2. Open the local Vite URL in the browser.
3. Point out the centered root node and the visible connectors.

## Show Interactions

1. Click the badge on node `A` to collapse `A1` and `A2`.
2. Expand `A` again and note how the spacing recalculates.
3. Click the badge on node `C1` to collapse its descendants.
4. Select a few nodes by clicking the card body to show selection state.

## What To Say

- The layout is computed from the visible tree only.
- Parent nodes stay centered above their active children.
- Collapsing a branch automatically removes its descendants from the layout.
- The tree is fully client-side and does not need a backend.
