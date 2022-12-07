const HID_DEVICE_TYPE = 'HID';
const USB_DEVICE_TYPE = 'USB';

const GET_DEVICES_CMD = 'get_devices';
const OPEN_DEVICE_CMD = 'open_device';
const CLOSE_DEVICE_CMD = 'close_device';

// This is used to store device array from getDevices() to avoid local
// variable getting garbage collected.
var globalDevices = {
  HID_DEVICE_TYPE: null,
  USB_DEVICE_TYPE: null,
};

console.log('Extension service worker background script (background.js)');

// Formats an 8-bit integer `value` in hexadecimal with leading zero.
const hex8 = value => {
  return ('00' + value.toString(16)).substr(-2).toUpperCase();
};

// Formats a 16-bit integer `value` in hexadecimal with leading zeros.
const hex16 = value => {
  return ('0000' + value.toString(16)).substr(-4).toUpperCase();
};

const canonicalDeviceName = (device, type) => {
  return `[${type}] ${hex16(device.vendorId)}:${hex16(device.productId)} ${device.productName}`
}

const addUsbDevice = device => {
  console.log(canonicalDeviceName(device, USB_DEVICE_TYPE));
  if (self.Notification.permission === 'granted') {
    const notificationObject = {
      body: 'Click here',
      data: { url: 'https://google.com' },
    };
    if (self.registration.active) {
      // https://stackoverflow.com/questions/36828088/serviceworkerregistration-active-not-being-set-first-time-chrome
      self.registration.showNotification('USB device');
    }
  }
};

const addHidDevice = device => {
  console.log(canonicalDeviceName(device, HID_DEVICE_TYPE));
  if (self.Notification.permission === 'granted') {
    const notificationObject = {
      body: 'Click here',
      data: { url: 'https://google.com' },
    };
    if (self.registration.active) {
      // https://stackoverflow.com/questions/36828088/serviceworkerregistration-active-not-being-set-first-time-chrome
      self.registration.showNotification('HID device');
    }
  }
};

const setUpMessageHandler = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('receive msg:', message);
    if (message.type != HID_DEVICE_TYPE && message.type != USB_DEVICE_TYPE) {
      return true;
    }

    let cmd = message.cmd;
    let data = message.data;
    let type = message.type;
    let navigatorDeviceObj = type == HID_DEVICE_TYPE ? navigator.hid : navigator.usb;
    if (cmd === GET_DEVICES_CMD) {
      navigatorDeviceObj.getDevices().then(devices => {
        globalDevices[type] = devices;
        let rsp = [];
        devices.forEach(device => {
          rsp.push({ 'name': canonicalDeviceName(device, type) });
        });
        sendResponse(rsp);
      });
    } else if (cmd == OPEN_DEVICE_CMD) {
      let idx = data;
      if (globalDevices[type] === null) {
        sendResponse(`globalDevices[${type}] is null, please click \"Get Granted ${type} Devices\" button first`);
      } else if (idx >= globalDevices[type].length) {
        sendResponse('Not enough num of devices:', globalDevices[type].length);
      } else {
        globalDevices[type][idx].open().then(() => {
          sendResponse(`devices[${idx}] ${canonicalDeviceName(globalDevices[type][idx], type)} opened `, idx);
        });
      }
    } else if (cmd == CLOSE_DEVICE_CMD) {
      let idx = data;
      if (globalDevices[type] === null) {
        sendResponse(`globalDevices[${type}] is null, please click \"Get Granted ${type} Devices\" button first`);
      } else if (idx >= globalDevices[type].length) {
        sendResponse('Not enough num of devices:', devices.length);
      } else {
        globalDevices[type][idx].close().then(() => {
          sendResponse(`devices[${idx}] ${canonicalDeviceName(globalDevices[type][idx], type)} closed `, idx);
        });
      }
    }
    // https://github.com/mozilla/webextension-polyfill/issues/130
    return true;
  });
}

if (navigator.usb) {
  // Add connection event listeners.
  navigator.usb.onconnect = console.log;
  navigator.usb.ondisconnect = console.log;

  // Log granted device permissions to the console.
  navigator.usb.getDevices().then(devices => {
    console.log('WebUSB is available');
    for (const d of devices) {
      addUsbDevice(d);
    }
  });
} else {
  console.log('WebUSB not available');
}

if (navigator.hid) {
  // Add connection event listeners.
  navigator.hid.onconnect = console.log;
  navigator.hid.ondisconnect = console.log;

  // Log granted device permissions to the console.
  navigator.hid.getDevices().then(devices => {
    console.log('WebHID is available');
    for (const d of devices) {
      addHidDevice(d);
    }
  });

  // Set up onMessage handler.
  setUpMessageHandler();
} else {
  console.log('WebHID not available');
}

// https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const onUpdate = (tabId, info, tab) => /^https?:/.test(info.url) && findTab([tab]);
findTab();
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    setTimeout(() => port.disconnect(), 250e3);
    port.onDisconnect.addListener(() => findTab());
  }
});
async function findTab(tabs) {
  if (chrome.runtime.lastError) { /* tab was closed before setTimeout ran */ }
  for (const { id: tabId } of tabs || await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, func: connect });
      chrome.tabs.onUpdated.removeListener(onUpdate);
      return;
    } catch (e) { }
  }
  chrome.tabs.onUpdated.addListener(onUpdate);
}
function connect() {
  chrome.runtime.connect({ name: 'keepAlive' })
    .onDisconnect.addListener(connect);
}

