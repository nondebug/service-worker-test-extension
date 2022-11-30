// Formats an 8-bit integer `value` in hexadecimal with leading zero.
const hex8 = value => {
  return ('00' + value.toString(16)).substr(-2).toUpperCase();
};

// Formats a 16-bit integer `value` in hexadecimal with leading zeros.
const hex16 = value => {
  return ('0000' + value.toString(16)).substr(-4).toUpperCase();
};

window.onload = e => {
  console.log('Script for the extension window (script.js)');

  // Add a button to request USB device permissions.
  const requestUsbButtonElement = document.createElement('button');
  requestUsbButtonElement.appendChild(document.createTextNode('navigator.usb.requestDevice'));
  requestUsbButtonElement.onclick = e => {
    navigator.usb.requestDevice({filters:[]}).then(d => {
      if (d) {
        addUsbDevice(d);
      }
    });
  };
  document.body.appendChild(requestUsbButtonElement);
  document.body.appendChild(document.createElement('br'));

  // Add a button to request HID device permissions.
  const requestHidButtonElement = document.createElement('button');
  requestHidButtonElement.appendChild(document.createTextNode('navigator.hid.requestDevice'));
  requestHidButtonElement.onclick = e => {
    navigator.hid.requestDevice({filters:[]}).then(devices => {
      for (const d of devices) {
        addHidDevice(d);
      }
    });
  };
  document.body.appendChild(requestHidButtonElement);
  document.body.appendChild(document.createElement('br'));
};

chrome.runtime.connect('abeobmoddgccmhcnnibdiajdkenkbigl', {name: 'extension-page'});
