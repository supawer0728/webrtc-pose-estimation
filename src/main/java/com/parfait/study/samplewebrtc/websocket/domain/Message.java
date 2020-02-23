package com.parfait.study.samplewebrtc.websocket.domain;

import lombok.Data;

@Data
public class Message {
    private MessageType type;
    private String roomId;
    private String memberId;
    private String text;
}
