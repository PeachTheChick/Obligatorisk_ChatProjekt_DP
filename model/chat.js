class Chat {
    constructor(chatName, chatOwner, chatDescription = "", chatUsers = [], chatMessages = []) {
        this.chatName = chatName
        this.chatOwner = chatOwner // The ID of the user who created this chat
        this.chatDescription = chatDescription
        this.chatUsers = chatUsers
        this.chatMessages = chatMessages // The array of messages sent in this chat
        this.chatId = Chat.chatId++
    }
    static chatId = 1
}

export default Chat
