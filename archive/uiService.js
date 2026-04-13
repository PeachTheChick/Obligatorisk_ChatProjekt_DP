import UserController from "../controller/userController.js"
import ChatController from "../controller/chatController.js"
import MessageController from "./messageController.js"

class UIService {

    static getHomeData(session) {
        if (session.isValidUser) {
            return {
                view: "user", data: {
                    username: session.username, chats: ChatController.getChatsByUser(session.userId, session.userLevel)
                }
            }
        }
        return {view: "home", data: {}}
    }

    static getChatData(chatId, session) {
        if (session.isValidUser) {
            const chat = ChatController.getChatById(chatId)
            if (!chat) return {error: "404"}

            const isParticipant = chat.chatUsers.includes(session.userId)
            const isAdmin = session.userLevel === 3

            if (isAdmin || isParticipant) {
                return {
                    view: "chat", data: {chat}
                }
            }
        }
        return {error: "403"}
    }

    static getMessagesForChatData(chatID, session) {
        if (session.isValidUser) {
            const chat = ChatController.getChatById(chatID)
            if (!chat) return {error: "404"}

            const isParticipant = chat.chatUsers.includes(session.userId)
            const isAdmin = session.userLevel === 3

            if (isAdmin || isParticipant) {
                return {
                    view: "messages", data: {
                        chat, messages: MessageController.getMessagesForChat(chatID)
                    }
                }
            }
        } else {
            return {error: "403"}
        }
    }


    static getUserProfileData(targetId, session) {
        if (session.isValidUser) {
            if (session.userLevel !== 3) return {error: "403"}

            const user = UserController.getUserByID(targetId)
            if (!user) return {error: "404"}

            return {view: "userProfile", data: {user}}
        }
    }

    static getMessagesFromUserData(userID, session) {
        if (session.isValidUser) {
            const user = UserController.getUserByID(userID)
            if (!user) return {error: "404"}
            const isAdmin = session.userLevel === 3
            if (isAdmin) {
                return {
                    view: "messages", data: {
                        user, messages: MessageController.getMessagesForUser(userID)
                    }
                }
            }
        } else {
            return {error: "403"}
        }
    }

    static getAllUsersData(session) {
        if (session.isValidUser) {
            const isAdmin = session.userLevel === 3
            if (!isAdmin) return {error: "403"}

            return UserController.users()
        }
    }
}

export default UIService