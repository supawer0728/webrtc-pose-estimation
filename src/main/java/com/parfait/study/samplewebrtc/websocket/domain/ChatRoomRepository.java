package com.parfait.study.samplewebrtc.websocket.domain;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class ChatRoomRepository {
    private final Map<String, Set<WebSocketSession>> map = new HashMap<>();

    public Set<WebSocketSession> findById(String roomId) {
        return map.computeIfAbsent(roomId, id -> new HashSet<>());
    }

    public Set<WebSocketSession> join(String roomId, WebSocketSession session) {
        Set<WebSocketSession> sessions = findById(roomId);
        if (sessions.size() < 2) {
            sessions.add(session);
            return sessions;
        }
        return Collections.emptySet();
    }

    public void remove(WebSocketSession session) {
        for (Set<WebSocketSession> storedSessions : map.values()) {
            storedSessions.removeIf(stored -> StringUtils.equals(stored.getId(), session.getId()));
        }
    }
}
