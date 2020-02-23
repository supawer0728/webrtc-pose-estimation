'use strict';

class WebRTC {
  constructor(url) {
    this.configuration = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}
      ]
    };
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.signalingSock = new SockJS(url);
    this.iceCandidate = [];
  }

  initPeerConnection(ondata) {
    const peerConnection = this.peerConnection;
    const iceCandidate = this.iceCandidate;
    const signalingSock = this.signalingSock;

    this.peerConnection.onicecandidate = async event => {
      console.log('on ice candidate:', event);
      if (event.candidate) {
        iceCandidate.push(event.candidate);
        signalingSock.send(JSON.stringify({'iceCandidate': event.candidate}));
      }
    };
    this.peerConnection.onconnectionstatechange = async event => {
      console.log('on connection state changed');
    };
    this.peerConnection.ondatachannel = async event => {
      console.log('on data channel');
      this.dataChannel = event.channel;
      this.dataChannel.addEventListener('message', ondata);
    };
    this.peerConnection.oniceconnectionstatechange = async event => {
      console.log('oniceconnectionstatechange', event)
    };

    const remoteStream = new MediaStream();
    this.peerConnection.ontrack = async event => {
      document.querySelector('#remoteVideo').srcObject = remoteStream;
      peerConnection.addTrack(event.track, remoteStream);
    };
  }

  initSignal(call) {
    const signalingSock = this.signalingSock;
    const peerConnection = this.peerConnection;
    const iceCandidate = this.iceCandidate;
    signalingSock.onopen = async function () {
      console.log('signaling connected');
      signalingSock.onmessage = async event => {
        const message = JSON.parse(event.data);
        console.log('signaling message: ', message);
        // WebRTC 연결 요청 받은 경우
        if (message.offer) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await peerConnection.createAnswer();
          peerConnection.setLocalDescription(answer)
                        .then(() => {
                          signalingSock.send(JSON.stringify({'answer': answer}));
                          if (iceCandidate.length > 0) {
                            signalingSock.send(JSON.stringify({'iceCandidates': iceCandidate}));
                          }
                        });
        }
        // WebRTC 연결 응답 받은 경우
        if (message.answer) {
          const remoteDesc = new RTCSessionDescription(message.answer);
          await peerConnection.setRemoteDescription(remoteDesc);
        }
        // ICE Candidate 요청을 받은 경우
        if (message.iceCandidate) {
          console.log('ice', message.iceCandidate);
          peerConnection.addIceCandidate(message.iceCandidate)
                        .catch(e => {
                          console.error('Error adding received ice candidate', e);
                        });
        }
        // ICE Candidate 요청을 받은 경우
        if (message.iceCandidates) {
          console.log('ice', message.iceCandidates);
          const length = message.iceCandidates.length;
          for (let i = 0; i < length; i++) {
            peerConnection.addIceCandidate(message.iceCandidates[i])
                          .catch(e => {
                            console.error('Error adding received ice candidate', e);
                          });
          }
        }
      };

      if (call) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingSock.send(JSON.stringify({'offer': offer}));
      }
    };
  }

  play() {
    const peerConnection = this.peerConnection;
    navigator.mediaDevices
             .getUserMedia({'video': true, 'audio': true})
             .then(videoStream => {
               document.querySelector('#localVideo').srcObject = videoStream;
               videoStream.getTracks()
                          .forEach(function (track) {
                            peerConnection.addTrack(track, videoStream);
                          });
             });
  }
}