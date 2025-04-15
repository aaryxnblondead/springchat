package chatapp.springchat.config;

import chatapp.springchat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        if (!userService.userExists("admin")) {
            userService.createUser("admin", "admin", "ADMIN", "USER");
            System.out.println("Admin user created successfully");
        }
    }
}
