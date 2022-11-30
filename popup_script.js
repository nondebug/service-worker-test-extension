console.log('Extension popup script (popup_script.js)');

window.onload = async e => {
  const openTabButtonElement = document.createElement('button');
  openTabButtonElement.appendChild(document.createTextNode('Click'));
  openTabButtonElement.onclick = e => { window.open('index.html', '_blank'); };
  document.body.appendChild(openTabButtonElement);
};
