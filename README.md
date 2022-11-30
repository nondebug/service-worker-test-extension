# service-worker-test-extension
A Chrome extension for testing WebHID and WebUSB integration with service workers.

## Installation
1. Create a local copy of the `service-worker-test-extension` repository by cloning with `git` or by [downloading the source code](https://github.com/nondebug/service-worker-test-extension/archive/refs/heads/main.zip) and extracting it to a local directory.
1. In Chrome, navigate to `chrome://extensions`.
1. In the top right corner of the page, enable **Developer mode**.
1. Click the **Load Unpacked** button to open a file chooser.
1. In the file chooser, select the directory containing the `service-worker-test-extension` source.

## Usage
The extension demonstrates how to request WebUSB and WebHID device permissions from a [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) extension. Click the extension toolbar icon to show a popup window, then click the button in the popup window to open an extension tab. In the opened tab, click the button **navigator.usb.requestDevice** to request WebUSB device permissions and **navigator.hid.requestDevice** to request WebHID device permissions.
