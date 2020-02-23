package com.parfait.study.samplewebrtc.websocket;

import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebRTCWebSocketHandler extends TextWebSocketHandler {
    private Set<WebSocketSession> storedSessions = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        storedSessions.add(session);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        for (WebSocketSession stored : storedSessions) {
            if (!StringUtils.equals(stored.getId(), session.getId())) {
                stored.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        storedSessions.removeIf(s -> StringUtils.equals(s.getId(), session.getId()));
    }
}
