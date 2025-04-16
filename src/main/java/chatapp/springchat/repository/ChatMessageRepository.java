package chatapp.springchat.repository;

import chatapp.springchat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTypeOrderByTimestampAsc(ChatMessage.MessageType type);
}
