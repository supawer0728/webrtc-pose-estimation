package com.parfait.study.samplewebrtc.web;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/")
@Controller
public class ChatController {

    private final AtomicLong memberId = new AtomicLong(1);

    @GetMapping
    public String index() {
        return "index";
    }

    @GetMapping("/caller")
    public String caller(Model model) {
        model.addAttribute("call", true);
        return "caller";
    }

    @GetMapping("/callee")
    public String callee(Model model) {
        model.addAttribute("call", false);
        return "callee";
    }

    @GetMapping("/room/{roomId}")
    public String room(@PathVariable String roomId, Model model) {
        model.addAttribute("roomId", roomId);
        model.addAttribute("memberId", "noname" + memberId.getAndIncrement());
        return "room";
    }
}
