const HID_DEVICE_TYPE = 'HID';
const USB_DEVICE_TYPE = 'USB';
const HID_DEVICES_BLOCK_ID = 'hid_devices_block_id';
const USB_DEVICES_BLOCK_ID = 'usb_devices_block_id';

const GET_DEVICES_CMD = 'get_devices';
const OPEN_DEVICE_CMD = 'open_device';
const CLOSE_DEVICE_CMD = 'close_device';
const FEED_SERVICE_WORKER_CMD = 'feed_service_worker';


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

const createButtons = (deviceType) => {
  if (deviceType != HID_DEVICE_TYPE && deviceType != USB_DEVICE_TYPE) {
    return;
  }

  let blockId;
  let navigatorDeviceObj;
  if (deviceType === HID_DEVICE_TYPE) {
    blockId = HID_DEVICES_BLOCK_ID;
    navigatorDeviceObj = navigator.hid;

  } else {
    blockId = USB_DEVICES_BLOCK_ID;
    navigatorDeviceObj = navigator.usb;
  }

  // Add a button to request device permissions.
  const requestButtonElement = document.createElement('button');
  requestButtonElement.appendChild(document.createTextNode(`Request ${deviceType} Device Permission`));
  requestButtonElement.onclick = e => {
    navigatorDeviceObj.requestDevice({filters:[]}).then(d => {
      // hid.requestDevice return an array of devices.
      if (deviceType === HID_DEVICE_TYPE) {
        d = d[0];
      }
      console.log(`Granted permission for ${canonicalDeviceName(d, deviceType)}`);
    });
  };
  document.body.appendChild(requestButtonElement);
  document.body.appendChild(document.createElement('br'));

  // Add a button to create a list of granted devices.
  const getDevicesButtonElement = document.createElement('button');
  getDevicesButtonElement.appendChild(document.createTextNode(`Get Granted ${deviceType} Devices`));
  getDevicesButtonElement.onclick = e => {
    chrome.runtime.sendMessage({type: deviceType, cmd: GET_DEVICES_CMD}, (devices) => {
      console.log('received get_devices', devices);

      let devicesBlockElement = document.createElement('div');
      devicesBlockElement.setAttribute('id', blockId);
      if (devices && devices.length > 0) {
        for (let i = 0; i < devices.length; i++) {
          openButtonElement = document.createElement('button');
          openButtonElement.appendChild(document.createTextNode(`Open ${deviceType}Devices[${i}] ${devices[i].name}`));
          openButtonElement.onclick = e => {
            chrome.runtime.sendMessage({type: deviceType, cmd: OPEN_DEVICE_CMD, data: i}, (rsp) => {
              console.log(rsp);
            });
          };
          devicesBlockElement.appendChild(openButtonElement);
          devicesBlockElement.appendChild(document.createElement('br'));

          closeButtonElement = document.createElement('button');
          closeButtonElement.appendChild(document.createTextNode(`Close ${deviceType}Devices[${i}] ${devices[i].name}`));
          closeButtonElement.onclick = e => {
            chrome.runtime.sendMessage({type: deviceType, cmd: CLOSE_DEVICE_CMD, data: i}, (rsp) => {
              console.log(rsp);
            });
          };
          devicesBlockElement.appendChild(closeButtonElement);
          devicesBlockElement.appendChild(document.createElement('br'));
        }
      }
      const oldDevicesBlockElement = document.getElementById(blockId);
      document.body.replaceChild(devicesBlockElement, oldDevicesBlockElement);
    });
  };
  document.body.appendChild(getDevicesButtonElement);
  document.body.appendChild(document.createElement('br'));

  // Add a block for opening/closing device buttons.
  let devicesBlockElement = document.createElement('div');
  devicesBlockElement.setAttribute("id", blockId);
  document.body.appendChild(devicesBlockElement);
}

window.onload = e => {
  console.log('Script for the extension window (script.js)');
  createButtons(USB_DEVICE_TYPE);
  createButtons(HID_DEVICE_TYPE);
  // https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
  (function connect() {
    chrome.runtime.connect({name: 'keepAlive'})
      .onDisconnect.addListener(connect);
  })();
};

