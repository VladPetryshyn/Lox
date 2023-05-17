import Layout from "@theme/Layout";
import React, { ChangeEvent, useState } from "react";
import { LoxImplementation } from "lox";

export default () => {
  const [value, setValue] = useState("");
  const [output, setOutput] = useState([]);
  const changeTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value);
  const runLox = () => {
    setOutput(LoxImplementation.run(value));
  }

  return <Layout>
    <div className="repl-header">
      <h2>Lox Repl</h2>
      <button className="repl-header__button" onClick={runLox}>Run</button>
    </div>
    <div className="repl-container">
      <textarea className="repl-textarea" value={value} onChange={changeTextarea}></textarea>
      <div className="repl-output">{output.length > 0 ?
        <>{output.map((itm, idx) => <h2 key={itm + idx}>{itm}</h2>)}</> :
        <h2>Output</h2>
      }
      </div>
    </div>
  </Layout>;
}
