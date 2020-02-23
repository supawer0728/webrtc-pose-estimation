package com.parfait.study.samplewebrtc.websocket.service;

import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parfait.study.samplewebrtc.websocket.domain.ChatRoomRepository;
import com.parfait.study.samplewebrtc.websocket.domain.Message;
import com.parfait.study.samplewebrtc.websocket.domain.MessageType;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

@RequiredArgsConstructor
@Component
public class JoinMessageService implements MessageService {
    private final ObjectMapper objectMapper;
    private final ChatRoomRepository repository;

    @Override
    public MessageType supports() {
        return MessageType.JOIN;
    }

    @SneakyThrows
    @Override
    public void execute(WebSocketSession session, Message message) {
        Set<WebSocketSession> sessions = repository.join(message.getRoomId(), session);
        if (sessions.isEmpty()) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        message.setText(message.getMemberId() + "님이 입장하셨습니다.");
        TextMessage textMessage = new TextMessage(objectMapper.writeValueAsString(message));
        for (WebSocketSession s : sessions) {
            s.sendMessage(textMessage);
        }
    }
}
