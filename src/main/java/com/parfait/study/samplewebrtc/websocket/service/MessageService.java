package com.parfait.study.samplewebrtc.websocket.service;

import org.springframework.web.socket.WebSocketSession;

import com.parfait.study.samplewebrtc.websocket.domain.Message;
import com.parfait.study.samplewebrtc.websocket.domain.MessageType;

public interface MessageService {
    MessageType supports();

    void execute(WebSocketSession session, Message message);
}
