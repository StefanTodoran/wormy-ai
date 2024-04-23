import { useState } from "react";
import EmailEntry from "./components/EmailEntry";
import { pickRandomListItem, randomContents } from "./utils/misc";
import { EmailData } from "./utils/types";

import "./App.css";

enum AppView {
  TABLE,
  GRAPH,
}

function App() {
  const [view, setView] = useState(AppView.TABLE);

  const [emails, setEmails] = useState<EmailData[]>([]);
  const [editing, setEditing] = useState(-1);
  const [dragging, setDragging] = useState(-1);

  const changeEditing = (target: number) => {
    if (editing === target) {
      setEditing(-1);
      return;
    }
    setEditing(target);
    setDragging(-1);
  };

  const changeDragging = (target: number) => {
    if (dragging === target) {
      setDragging(-1);
      return;
    }
    setDragging(target);
    setEditing(-1);
  };

  const addNewDummyEmail = () => {
    const entry: EmailData = {
      sender: `foo_${emails.length + 1}@bar.com`,
      recipient: emails.length > 0 ? emails[emails.length - 1].sender : `foo_0@bar.com`,
      content: pickRandomListItem(randomContents),
    };
    setEmails([...emails, entry]);
  };

  const updateTargetEmail = (targetIndex: number, newEmail: EmailData) => {
    const newEmails = [...emails];
    newEmails[targetIndex] = newEmail;
    setEmails(newEmails);
  };

  const deleteTargetEmail = (targetIndex: number) => {
    const newEmails = [...emails];
    newEmails.splice(targetIndex, 1);
    setEmails(newEmails);
    setDragging(-1);
    setEditing(-1);
  };

  const swapEmailOrder = (targetIndex: number, swapIndex: number) => {
    if (swapIndex < 0 || swapIndex >= emails.length) return;
    const newEmails = [...emails];
    newEmails[targetIndex] = emails[swapIndex];
    newEmails[swapIndex] = emails[targetIndex];
    setEmails(newEmails);
    changeDragging(swapIndex);
  };

  return (
    <>
      {
        view === AppView.TABLE &&
        <div id="table-wrap">
          <table id="emails-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Order</th>
                <th>Contents</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {emails.map((email, idx) => <EmailEntry
                key={idx}
                {...email}
                order={idx}
                editable={idx === editing}
                startEditing={() => changeEditing(idx)}
                endEditing={() => changeEditing(-1)}
                updateEmail={(newEmail) => updateTargetEmail(idx, newEmail)}
                deleteEmail={() => deleteTargetEmail(idx)}
                dragging={idx === dragging}
                toggleDragging={() => changeDragging(idx)}
                swapUp={() => swapEmailOrder(idx, idx - 1)}
                swapDown={() => swapEmailOrder(idx, idx + 1)}
              />)}
            </tbody>
          </table>

          <div>
            <button onClick={() => {}}>Load Table</button>
            <button onClick={() => {}}>Save Table</button>
            <button onClick={addNewDummyEmail}>Add Entry</button>
            <button onClick={() => setView(AppView.GRAPH)}>View Graph</button>
          </div>
        </div>
      }

      {
        view === AppView.GRAPH && <div id="canvas-wrap">
          <canvas id="graph-canvas"></canvas>
          <button onClick={() => setView(AppView.TABLE)}>View Table</button>
        </div>
      }
    </>
  )
}

export default App;
