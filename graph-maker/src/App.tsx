import { useState } from "react";
import "./App.css"

interface GraphNode {
  email: string,
  outgoing: string[],
}

function App() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  const createEmptyNode = () => {
    setNodes([
      ...nodes,
      {
        email: "new@foo.bar",
        outgoing: [],
      }
    ]);
  };

  return (
    <>
      <h1>Wormy Graph Maker</h1>
      <button onClick={createEmptyNode}>
        Create Node
      </button>
      <button onClick={createEmptyNode}>
        Delete Node
      </button>
    </>
  )
}

export default App;
