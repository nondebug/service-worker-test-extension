console.log('Extension service worker background script (background.js)');

// Formats an 8-bit integer `value` in hexadecimal with leading zero.
const hex8 = value => {
  return ('00' + value.toString(16)).substr(-2).toUpperCase();
};

// Formats a 16-bit integer `value` in hexadecimal with leading zeros.
const hex16 = value => {
  return ('0000' + value.toString(16)).substr(-4).toUpperCase();
};

const addUsbDevice = device => {
  console.log(`[USB] ${hex16(device.vendorId)}:${hex16(device.productId)} ${device.productName}`);
  if (self.Notification.permission === 'granted') {
    const notificationObject = {
      body: 'Click here',
      data: { url: 'https://google.com' },
    };
    self.registration.showNotification('USB device');
  }
};

const addHidDevice = device => {
  console.log(`[HID] ${hex16(device.vendorId)}:${hex16(device.productId)} ${device.productName}`);
  if (self.Notification.permission === 'granted') {
    const notificationObject = {
      body: 'Click here',
      data: { url: 'https://google.com' },
    };
    self.registration.showNotification('HID device');
  }
};

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
} else {
  console.log('WebHID not available');
}
