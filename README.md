Don't Repeat Yourself.
Single Responsibility



// Join chat route
chatRouter.get("/join/:id", (req, res) => {
if (req.session.isValidUser) {
ChatController.addUserToChat(req.params.id, req.session.userId)
res.redirect(`/?chatId=${req.params.id}`)
else {
res.status(403)render("403")
}

// Delete chat route
chatRouter.post("/delete/:id", (req, res) => {
if (!req.session.isValidUser) return res.status(403).render("403")

const chat = ChatController.getChatById(req.params.id)
if (!chat) return res.status(404).render("404")

const isAdmin = req.session.userLevel === 3
const isOwner = chat.chatOwner === Number(req.session.userId)
const canDelete = isAdmin || (req.session.userLevel >= 2 && isOwner)

if (canDelete) {
ChatController.deleteChat(req.params.id)
res.redirect("/")
} else {
res.status(403).render("403")
}
})

// Create new chat route
chatRouter.post("/newchat", (req, res) => {
if (!req.session.isValidUser) return res.status(403).render("403")

const {chatName} = req.body 
    if (chatName) {
        const newChat = ChatController.addChat(chatName, req.session.userId)
        res.redirect(`/?chatId=${newChat.chatId}`)
    } else {
        res.status(400).send("Chat name is required!")
    }

})

// Post message route
chatRouter.post("/message/:id", (req, res) => {
if (!req.session.isValidUser) return res.status(403).render("403")
 
const {messageContent} = req.body
    if (messageContent) {
        ChatController.writeMessage(req.params.id, req.session.userId, messageContent)
        res.redirect(`/?chatId=${req.params.id}`)
    } else {
        res.status(400).send("Message cannot be empty")
    }
})