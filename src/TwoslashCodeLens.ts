import * as vscode from "vscode";
import { getCodeblocks } from "./getCodeblocks";
import { RunState, TwoslashRunner } from "./TwoslashRunner";

export type Codeblock = { lang: string; code: string; block: string; start: number; end: number };

const startTwoslashCommand = `vscode-twoslash.addTwoslashCodeblock`;
const removeTwoslashCommand = `vscode-twoslash.removeTwoslashCodeblock`;

export class SnapshotCodeLensProvider implements vscode.CodeLensProvider {
  onDidChange: vscode.EventEmitter<void>;

  constructor(private runner: TwoslashRunner) {
    this.onDidChange = new vscode.EventEmitter();
  }

  get onDidChangeCodeLenses(): vscode.Event<void> {
    return this.onDidChange.event;
  }

  public provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken) {
    if (!document.getText().includes("twoslash")) return [];

    const twoslashBlocks = getCodeblocks(document);

    return twoslashBlocks.map((snapshot) => {
      const l = snapshot;
      const startPosition = document.positionAt(l.start + 3 + l.lang.indexOf("twoslash"));
      const endPosition = document.positionAt(l.start + 3 + l.lang.length);

      const range = new vscode.Range(startPosition, endPosition);

      let command: vscode.Command;
      let runState = this.runner.stateForSampleAtStart(l.start);
      if (runState === undefined) {
        command = {
          title: "Start monitoring",
          command: startTwoslashCommand,
          arguments: [snapshot],
        };
      } else {
        let title = ""
        switch (runState.state) {
          case RunState.TwoslashErr:
            title = "Twoslash Error"
            break;
          case RunState.Success:
            title = "Compiles fine"
            break;
          case RunState.Running:
            title = "Running..."
            break;
          case RunState.NotRan:
            title = "Monitoring, save with your cursor in the code sample to run"
            break;
        }
        command = {
          title,
          command: removeTwoslashCommand,
          arguments: [snapshot],
        };
      }

      return new vscode.CodeLens(range, command);
    });
  }
}


