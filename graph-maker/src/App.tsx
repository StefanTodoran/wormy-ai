import { useState } from "react";
import EmailEntry from "./components/EmailEntry";
import { pickRandomListItem, randomContents } from "./utils/misc";
import { Email } from "./utils/types";

import "./App.css";

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [editing, setEditing] = useState(-1);

  const addNewDummyEmail = () => {
    const entry: Email = {
      sender: `foo_${emails.length + 1}@bar.com`,
      recipient: emails.length > 0 ? emails[emails.length - 1].sender : `foo_0@bar.com`,
      order: emails.length,
      content: pickRandomListItem(randomContents),
    };
    setEmails([...emails, entry]);
  };

  const updateTargetEmail = (targetIndex: number, newEmail: Email) => {
    const newEmails = [ ...emails ];
    newEmails[targetIndex] = newEmail;
    setEmails(newEmails);
  };

  const deleteTargetEmail = (targetIndex: number) => {
    const newEmails = [ ...emails ];
    newEmails.splice(targetIndex, 1);
    setEmails(newEmails);
  };

  return (
    <>
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
              editable={idx === editing}
              startEditing={() => setEditing(idx)}
              endEditing={() => setEditing(-1)}
              updateEmail={(newEmail) => updateTargetEmail(idx, newEmail)}
              deleteEmail={() => deleteTargetEmail(idx)}
            />)}
          </tbody>
        </table>

        <button onClick={addNewDummyEmail}>Add Entry</button>
      </div>

      <canvas id="graph-canvas"></canvas>
    </>
  )
}

export default App;
