import Chat from "../model/chat.js"
import Archive from "../archive.js"

class ChatController {
    static #chats = [new Chat("TestChat", 1, "Welcome to the test chat!", [1], [])]
    static #nextMessageId = 1

    static async startUp() {
        let data = await Archive.readFile('./data/chats.json')
        if (data) {
            ChatController.#chats = JSON.parse(data)
            const biggestChatID = ChatController.#chats.reduce((accumulator, chat) => {
                return chat.chatId >= accumulator ? chat.chatId : accumulator
            }, 0)
            Chat.chatId = biggestChatID + 1

            let maxMessageId = 0
            ChatController.#chats.forEach(chat => {
                chat.chatMessages.forEach(message => {
                    if (message.messageId > maxMessageId) {
                        maxMessageId = message.messageId
                    }
                })
            })
            ChatController.#nextMessageId = maxMessageId + 1
        }
    }

    static getChats() {
        return ChatController.#chats
    }

    static getChatsByUser(userID) {
        return ChatController.#chats.filter(chat => chat.chatUsers.includes(Number(userID)))
    }

    static getChatById(chatID) {
        return ChatController.#chats.find(chat => chat.chatId === Number(chatID))
    }

    static getMessagesByUser(userID) {
        return ChatController.#chats.flatMap(chat =>
            chat.chatMessages
                .filter(message => message.messageSenderID === Number(userID))
                .map(message => ({...message, chatName: chat.chatName})))
    }

    static writeMessage(chatID, userID, messageContent) {
        const chat = ChatController.getChatById(chatID)
        if (chat) {
            const newMessage = {
                messageSenderID: Number(userID),
                messageContent: messageContent,
                messageTime: Date.now(),
                messageId: ChatController.#nextMessageId++
            }
            chat.chatMessages.push(newMessage)
            ChatController.save()
            return newMessage
        }
        return null
    }

    static deleteMessage(messageID) {
        let foundMessage = false
        ChatController.#chats.forEach(chat => {
            const initialLength = chat.chatMessages.length
            chat.chatMessages = chat.chatMessages.filter(message => message.messageId !== Number(messageID))
            if (chat.chatMessages.length < initialLength) foundMessage = true
        })
        if (foundMessage) ChatController.save()
    }

    static createChat(chatName, chatOwnerID, chatDescription = "") {
        const newChat = new Chat(chatName, chatOwnerID, chatDescription, [chatOwnerID])
        ChatController.#chats.push(newChat)
        ChatController.save()
        return newChat
    }

    static editChat(chatID, chatName, chatDescription) {
        const chat = ChatController.getChatById(chatID)
        if (chat) {
            chat.chatName = chatName
            chat.chatDescription = chatDescription
            ChatController.save()
            return chat
        }
        return null
    }

    static deleteChat(chatID) {
        const chat = ChatController.getChatById(chatID)
        if (!chat) return

        chat.chatMessages = []
        chat.chatUsers = []

        ChatController.#chats = ChatController.#chats.filter(chat => chat.chatId !== Number(chatID))

        ChatController.save();
    }

    static addUserToChat(chatID, userID) {
        const chat = ChatController.getChatById(chatID)
        if (chat && !chat.chatUsers.includes(Number(userID))) {
            chat.chatUsers.push(Number(userID))
            ChatController.save()
            return true
        }
        return false
    }

    static removeUserFromChat(chatID, userID) {
        const chat = ChatController.getChatById(chatID)
        if (chat) {
            chat.chatUsers = chat.chatUsers.filter(id => id !== Number(userID))
            ChatController.save()
        }
    }

    static save() {
        Archive.writeFile('./data/chats.json', JSON.stringify(ChatController.#chats, null, 2))
    }

}

export default ChatController
