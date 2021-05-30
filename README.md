# Moved

https://github.com/shikijs/twoslash/blob/main/extensions/vscode-twoslash/

# vscode-twoslash README

Runs Twoslash code samples in your IDE to determine if they are correct.

### What it does

This extension adds a "Monitor" button above Twoslash code-samples:

<img src="./web/1.png">

Selecting a code sample, means that the extension will start monitoring it:

<img src="./web/2.png">

Pressing save _when_ your cursor is inside a monitored code sample will run Twoslash on it:

<img src="./web/3.png">

You can then iterate until you're done:

<img src="./web/4.png">

### Notes

The start character index of the code sample is used to keep track of what is monitored, if you edit some text above then it'll get dropped from being monitored. You can re-click the button.
