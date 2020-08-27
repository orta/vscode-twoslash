import * as vscode from "vscode";
import { getCodeblocks } from "./getCodeblocks";
import { SnapshotCodeLensProvider } from "./TwoslashCodeLens";
import { RunState, TwoslashRunner } from "./TwoslashRunner";

export function activate(context: vscode.ExtensionContext) {
  // Does the work of running twoslash on a particualr code sample
  const runner = new TwoslashRunner();
  
  // Provides the buttons
  const codelens = new SnapshotCodeLensProvider(runner)
  const codelensD = vscode.languages.registerCodeLensProvider({ pattern: '**/*.md' }, codelens)
  
  // So that a runner can tell the code actions to update after a run
  runner.codeLensDidChange = codelens.onDidChange

  // Set up some commands which the buttons run
  const  addTwoslashD = vscode.commands.registerCommand("vscode-twoslash.addTwoslashCodeblock", (codeblock) => {
    runner.addCodeblock(codeblock);
    codelens.onDidChange.fire()

    runner.runSampleAt(codeblock.start + 3);
  });

  const removeTwoslashD = vscode.commands.registerCommand("vscode-twoslash.removeTwoslashCodeblock", (codeblock) => {
    runner.removeCodeblock(codeblock);
    codelens.onDidChange.fire()
  });

  const clearD = vscode.commands.registerCommand("vscode-twoslash.clearAllMonitors", (codeblock) => {
    const starts: number[] = []
    runner.forEachCodeBlock(cb => {
      starts.push(cb.start + 3)
    })
    starts.forEach(s => runner.removeCodeblock(s))
  });


  // Set up some commands which the buttons run
  const  monitorAll = vscode.commands.registerCommand("vscode-twoslash.runOnAll", () => {
    const document = vscode.window.activeTextEditor?.document
    if (!document) return

    const allBlocks = getCodeblocks(document)
    allBlocks.forEach(codeblock => {
      runner.addCodeblock(codeblock);
      runner.runSampleAt(codeblock.start + 3);
    });

    codelens.onDidChange.fire()
  });


  // Monitor when a user presses save to trigger running twoslash on the selected code sample
  const  saveD = vscode.workspace.onDidSaveTextDocument((e) => {
    const isMDDoc = e.fileName.includes(".md") || e.fileName.includes(".markdown");
    if (!isMDDoc) return;
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const cursorOffset = e.offsetAt(editor.selection.active)
    runner.runSampleAt(cursorOffset);

  });

  // Provides a hover with the full info for exceptions
  const hoverDispose = vscode.languages.registerHoverProvider('markdown', {
    provideHover(document, position, token) {
      const char = document.offsetAt(position)
      const codeblock = runner.stateForSampleAtPosition(char)

      if (!codeblock) return { contents: [] }

      if (codeblock.state === RunState.TwoslashErr) {
        return {
          contents: [codeblock.errMessage || "Twoslash Error"]
        };
      } else {
        return { contents: [] }
      }
    }
  });

  // Essential faff
  context.subscriptions.push(addTwoslashD, saveD, codelensD, removeTwoslashD, hoverDispose, monitorAll, clearD);
}

export function deactivate() {}
