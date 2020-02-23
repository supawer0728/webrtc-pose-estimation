package com.parfait.study.samplewebrtc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.parfait.study.samplewebrtc.websocket.ChatWebSocketHandler;
import com.parfait.study.samplewebrtc.websocket.WebRTCWebSocketHandler;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@EnableWebSocket
@Configuration
public class WebSocketConfig implements WebSocketConfigurer {
    private final ChatWebSocketHandler webSocketHandler;
    private final WebRTCWebSocketHandler webRTCWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/chat")
                .setAllowedOrigins("*")
                .withSockJS();

        registry.addHandler(webRTCWebSocketHandler, "/ws/webrtc")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
