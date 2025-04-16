'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var logoutButton = document.querySelector('#logoutbutton');

var stompClient = null;
var username = null;
var chatHistory = []; // Store chat history

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

// Load chat history from localStorage when the page loads
function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        
        // Display saved messages
        chatHistory.forEach(message => {
            displayMessage(message);
        });
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

// Add this function to load chat history from server
function loadServerChatHistory() {
    fetch('/api/history')
        .then(response => response.json())
        .then(messages => {
            // Clear existing messages first
            chatHistory = messages;
            
            // Display messages
            messageArea.innerHTML = '';
            messages.forEach(message => {
                displayMessage(message);
            });
            
            // Save to localStorage as backup
            saveChatHistory();
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            // Fall back to localStorage if server request fails
            loadChatHistory();
        });
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );

    connectingElement.classList.add('hidden');
    
    // Load chat history from server after connecting
    loadServerChatHistory();
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function logout() {
    if (stompClient) {
        // Send a leave message
        stompClient.send("/app/chat.addUser",
            {},
            JSON.stringify({sender: username, type: 'LEAVE'})
        );
        
        // Disconnect from WebSocket
        stompClient.disconnect();
        stompClient = null;
    }
    
    // Save chat history before logout
    saveChatHistory();
    
    // Show the username page again
    chatPage.classList.add('hidden');
    usernamePage.classList.remove('hidden');
    
    // Clear the username input
    document.querySelector('#name').value = '';
    
    // Reset username
    username = null;
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function displayMessage(message) {
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    
    // Add message to chat history (only store chat messages, not events)
    if (message.type === 'CHAT') {
        chatHistory.push(message);
        saveChatHistory();
    }
    
    displayMessage(message);
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// Event listeners
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logoutButton.addEventListener('click', logout, true);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // We'll load chat history when connected to ensure proper ordering
});
