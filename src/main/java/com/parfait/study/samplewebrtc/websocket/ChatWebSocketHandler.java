package com.parfait.study.samplewebrtc.websocket;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parfait.study.samplewebrtc.websocket.domain.ChatRoomRepository;
import com.parfait.study.samplewebrtc.websocket.domain.Message;
import com.parfait.study.samplewebrtc.websocket.domain.MessageType;
import com.parfait.study.samplewebrtc.websocket.service.MessageService;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final Map<MessageType, MessageService> messageServices;
    private final ChatRoomRepository repository;

    public ChatWebSocketHandler(ObjectMapper objectMapper,
                                List<MessageService> messageServices,
                                ChatRoomRepository repository) {
        this.objectMapper = objectMapper;
        this.messageServices = messageServices.stream().collect(toMap(MessageService::supports, identity()));
        this.repository = repository;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Message message = objectMapper.readValue(textMessage.getPayload(), Message.class);
        messageServices.get(message.getType()).execute(session, message);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        repository.remove(session);
    }
}
