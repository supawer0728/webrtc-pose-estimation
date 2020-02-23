'use strict';

class WebRTC {
  constructor(url) {
    const configuration = {
      'iceServers': [
        {
          'urls': [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302'
          ]
        }
      ]
    };
    this.offerOptions = {
      iceRestart: true,
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    };
    this.peerConnection = new RTCPeerConnection(configuration);
    this.signalingSock = new SockJS(url);
    this.dataChannel = this.peerConnection.createDataChannel('test');
  }

  initStream() {
    navigator.mediaDevices.getUserMedia({'video': true, 'audio': true})
             .then(stream => {
               document.querySelector('#localVideo').srcObject = stream;
               stream.getTracks().forEach(track => {
                 peerConnection.addTrack(track, stream);
               });
             });
  }

  initPeerConnection(ondata) {
    const signalingSock = this.signalingSock;

    this.peerConnection.onicecandidate = async event => {
      if (event.candidate) {
        signalingSock.send(JSON.stringify({'iceCandidate': event.candidate}));
      }
    };
    this.peerConnection.ondatachannel = async event => {
      console.log('on data channel');
      const receivingDataChannel = event.channel;
      receivingDataChannel.addEventListener('message', ondata);
    };

    const remoteStream = new MediaStream();
    const remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = remoteStream;

    this.peerConnection.ontrack = async event => {
      remoteStream.addTrack(event.track);
    };
  }

  initSignal(isCaller) {
    const signalingSock = this.signalingSock;
    const peerConnection = this.peerConnection;
    const offerOptions = this.offerOptions;
    signalingSock.onopen = async function () {
      console.log('signaling connected');
      signalingSock.onmessage = async event => {
        const message = JSON.parse(event.data);
        console.log('signaling message: ', message);

        // WebRTC 연결 요청 받은 경우
        if (message.offer) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await peerConnection.createAnswer(offerOptions);
          await peerConnection.setLocalDescription(answer);
          signalingSock.send(JSON.stringify({'answer': answer}));
        }

        // WebRTC 연결 응답 받은 경우
        if (message.answer) {
          const remoteDesc = new RTCSessionDescription(message.answer);
          await peerConnection.setRemoteDescription(remoteDesc);
        }

        // ICE Candidate 요청을 받은 경우
        if (message.iceCandidate) {
          peerConnection.addIceCandidate(message.iceCandidate)
                        .then(() => console.log('iceCandidate added'))
                        .catch(e => {
                          console.error('Error adding received ice candidate', e);
                        });
        }
      };

      if (isCaller) {
        const offer = await peerConnection.createOffer(offerOptions);
        await peerConnection.setLocalDescription(offer);
        signalingSock.send(JSON.stringify({'offer': offer}));
      }
    };
  }
}