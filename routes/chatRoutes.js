import express from "express";
import ChatController from "../controller/chatController.js"
import UserController from "../controller/userController.js"

ChatController.startUp()

const chatRouter = express.Router()

// Root route - displays all chats and optional selected chat
chatRouter.get("/", (req, res) => {
    const chats = ChatController.getChats()
    res.render("home", {
        chats: chats,
        selectedChat: null,
        users: [],
        page: 'chats'
    })
})

chatRouter.get("/:id", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).render("403")
    }

    const chats = ChatController.getChats()
    const selectedChat = ChatController.getChatById(req.params.id)

    if (!selectedChat) {
        return res.status(404).render("404")
    }

    const isAdmin = req.session.userLevel === 3
    const isParticipant = selectedChat.chatUsers.includes(Number(req.session.userId))
    const participants = selectedChat.chatUsers.map(id => UserController.getUserByID(id)).filter(u => u != null)

    // Enrich messages with sender name
    selectedChat.chatMessages.forEach(msg => {
        const sender = UserController.getUserByID(msg.messageSenderID)
        msg.senderName = sender ? sender.username : 'Unknown'
    })

    res.render("home", {
        chats: chats,
        selectedChat: selectedChat,
        users: participants,
        page: 'chats',
        isParticipant: isAdmin || isParticipant
    })
})

chatRouter.get("/:id/messages", (req, res) => {
    res.redirect(`/chats/${req.params.id}`)
})

// Route to handle posting a new message
chatRouter.post("/:id/messages", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).send("Unauthorized")
    }

    const chatId = req.params.id
    const userId = req.session.userId
    const {messageContent} = req.body

    const chat = ChatController.getChatById(chatId)
    const isAdmin = req.session.userLevel === 3
    const isParticipant = chat && chat.chatUsers.includes(Number(userId))

    if (messageContent && (isAdmin || isParticipant)) {
        const newMessage = ChatController.writeMessage(chatId, userId, messageContent)
        if (newMessage) {
            res.redirect(`/chats/${chatId}`)
        } else {
            res.status(404).send("Chat not found")
        }
    } else {
        res.status(403).send("You must be a participant to send messages.")
    }
})

chatRouter.delete("/:id", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).send("Permission Denied!")
    }

    const chatId = req.params.id
    const userId = req.session.userId
    const chat = ChatController.getChatById(chatId)
    const isAdmin = req.session.userLevel === 3
    const isParticipant = chat && chat.chatUsers.includes(Number(userId))

    if (isAdmin || isParticipant) {
        ChatController.deleteChat(chatId)
        res.redirect("/chats")
    } else {
        return res.status(403).send("Permission Denied!")
    }
})

chatRouter.put("/:id", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).send("Permission Denied!")
    }

    const chatId = req.params.id
    const {chatName, chatDescription} = req.body
    const chat = ChatController.getChatById(chatId)

    if (!chat) {
        return res.status(404).send("Chat not found")
    }

    const isAdmin = req.session.userLevel === 3
    const isOwner = chat.chatOwner === Number(req.session.userId)

    if (isAdmin || isOwner) {
        const updatedChat = ChatController.editChat(chatId, chatName, chatDescription)
        if (updatedChat) {
            res.status(200).redirect("/chats")
        } else {
            res.status(500).send("Failed to update chat")
        }
    } else {
        res.status(403).send("Only the owner or an admin can edit the chat.")
    }
})

chatRouter.get("/:id/messages/:messageid", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).send("Permission Denied!")
    }
    const chat = ChatController.getChatById(req.params.id)
    if (!chat) return res.status(404).render("404")

    const isAdmin = req.session.userLevel === 3
    const isParticipant = chat.chatUsers.includes(Number(req.session.userId))

    if (isAdmin || isParticipant) {
        const message = chat.chatMessages.find(m => m.messageId === Number(req.params.messageid))
        if (!message) {
            return res.status(404).render("404")
        }
        res.render("message", {chat, message})
    } else {
        res.status(403).render("403")
    }
})

chatRouter.post("/newchat", (req, res) => {
    if (!req.session.isValidUser) {
        return res.status(403).render("403")
    }
    const {chatName, chatDescription} = req.body
    if (chatName) {
        const newChat = ChatController.createChat(chatName, req.session.userId, chatDescription)
        res.redirect(`/chats/${newChat.chatId}`)
    } else {
        res.status(400).send("Chat name is required to start a new chat!")
    }
})

export default chatRouter
