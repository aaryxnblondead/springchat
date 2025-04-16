package chatapp.springchat.controller;

import chatapp.springchat.model.ChatMessage;
import chatapp.springchat.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class ChatHistoryController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // Get all chat history
    @GetMapping
    public List<ChatMessage> getChatHistory() {
        return chatMessageRepository.findByTypeOrderByTimestampAsc(ChatMessage.MessageType.CHAT);
    }

    // Add a message to history
    @PostMapping
    public void addMessage(@RequestBody ChatMessage message) {
        // Only store actual chat messages, not join/leave events
        if (message.getType() == ChatMessage.MessageType.CHAT) {
            message.setTimestamp(System.currentTimeMillis());
            chatMessageRepository.save(message);
        }
    }
}
