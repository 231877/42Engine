class P2P {
  constructor(params={}) {
    this.stuns = [];
    this.turns = [];

    for (const key of params)
      this[key] = params[key];

    this.iceServers = [...this.stuns, ...this.turns];
    this.rc = new RTCPeerConnection(this.iceServers);
    this.channel = false;
    this.channelID = false;
    this.isLocal = false;
  }

  getUID(str='xxxx-xxyy-yyyy-yyxx') {
    let d = new Date().getTime(),
        d2 = ((typeof(performance) !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return str.replace(/[xy]/g, c => {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = ~~(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = ~~(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  createChannel() {
    this.channelID = this.getUID();
    this.channel = this.rc.createDataChannel(this.channelID);
    this.isLocal = true;
  }

  connect() {
    this.isLocal = false;
  }
}



/*const localConnection = new RTCPeerConnection(servers);
const remoteConnection = new RTCPeerConnection(servers);
const sendChannel =
  localConnection.createDataChannel('sendDataChannel');

// ...

remoteConnection.ondatachannel = (event) => {
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessage;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
};

function onReceiveMessage(event) {
  document.querySelector("textarea#send").value = event.data;
}

document.querySelector("button#send").onclick = () => {
  var data = document.querySelector("textarea#send").value;
  sendChannel.send(data);
};*/