import UserController from "../controller/userController.js"
import ChatController from "../controller/chatController.js"
import MessageController from "./messageController.js"

class ActionService {
    static login(userName, userPass) {
        const user = UserController.validateUser(userName, userPass)
        if (user) {
            return {
                session: {
                    isValidUser: true,
                    username: user.username,
                    userLevel: user.userLevel
                }
            }
        } else {
            return {error: "401"}
        }

    }

    static createChat(chatName, ownerId) {
        if (session.isValidUser) {
            const newChat = ChatController.addChat(chatName, ownerId)
            UserController.addChatToUser(ownerId, newChat.chatId)
            return newChat
        }
    }

    static inviteUser(chatId, targetUser) {
        if (session.isValidUser) {
            const chatAdded = ChatController.addUserToChat(chatId, targetUser.id)
            if (chatAdded) {
                UserController.addChatToUser(targetUser.id, chatId)
                return true
            }
            return false
        }
    }

    static deleteChat(chatId, session) {
        if (session.isValidUser) {
            const chat = ChatController.getChatById(chatId)
            if (!chat) return {succes: false, status: 404}

            const isOwner = chat.chatOwner == session.userId
            const isAdmin = session.userLevel === 3

            if (isAdmin || (session.userLevel >= 2 && isOwner)) {
                ChatController.deleteChat(chatId)
                UserController.removeChatFromUser(session.userId, chatId)
                return {succes: true, status: 200}
            }
            return {succes: false, status: 403}
        }
    }
}

export default ActionService