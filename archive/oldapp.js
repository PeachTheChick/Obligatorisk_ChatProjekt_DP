import express from "express"
import session from "express-session"
import UserController from "../controller/userController.js"
import ChatController from "../controller/chatController.js"
import MessageController from "./messageController.js"
import UIService from "./uiService.js"
import ActionService from "./actionService.js"


const oldapp = express()

UserController.startUp()
ChatController.startUp()
MessageController.startUp()

// Set up
oldapp.set("view engine", "pug")

// Middleware
oldapp.use(express.static("assets"))
oldapp.use(express.urlencoded({extended: true}))
oldapp.use(express.json())


// Session conf.
oldapp.use(session({
    secret: "secretkey",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60000
    }
}))

// Root route
// If logged in, redirect to user page, otherwise homepage
oldapp.get("/", (req, res) => {
    const {view, data} = UIService.getHomeData(req.session)
    res.render(view, data)
})

// Login route
oldapp.post("/users/login", (req, res) => {
    const {userName, userPass} = req.body
    const user = UserController.validateUser(userName, userPass)

    if (user) {
        req.session.isValidUser = true
        req.session.username = user.username
        req.session.userLevel = user.userLevel
        res.redirect("/")
    } else {
        res.status(401).send("Ugyldigt brugernavn eller kodeord!")
    }
})

// Add user route
oldapp.post("/users/adduser", (req, res) => {
    const {userName, userPass} = req.body
    if (userName && userPass) {
        UserController.addUser(userName, userPass, 1) // Always add user at lowest userLevel.
        req.session.isValidUser = true
        req.session.username = userName
        req.session.userLevel = 1
        res.redirect("/")
    } else {
        res.status(400).send("Brugernavn og adgangskode påkrævet!")
    }
})

// Chats route
oldapp.get("/chats", (req, res) => {
    if (req.session.isValidUser) {
        res.render("chats", {
            chats: ChatController.#chats()
        })
    } else {
        res.alert("Permission Denied! Du skal være logget ind for at se denne side.")
        res.redirect("/")
    }
})

// Creates a new chat.
oldapp.post("/chats", (req, res) => {
    if (req.session.isValidUser) {
        const {chatName} = req.body
        const newChat = ActionService.createChat(chatName, req.session.userId)
        res.redirect(`/chats/${newChat.chatId}`)
    }
})

// Adds a user to a chat.
oldapp.post("/chats/:id/invite", (req, res) => {
    const {targetUserId} = req.body
    const chatId = req.params.id
    ActionService.inviteUser(chatId, targetUserId)
    res.redirect(`/chats/${chatId}`)
})

// Specific chat route
oldapp.get("/chats/:id", (req, res) => {
    if (req.session.isValidUser) {
        const result = UIService.getChatData(req.params.id, req.session)
        if (result.error) return res.status(result.error).send("Adgang Nægtet eller ikke fundet.")
        res.render(result.view, result.data)
    } else {
        res.redirect("/")
    }
})

// Delete chat route
oldapp.delete("/chats/:id", (req, res) => {
    const result = ActionService.deleteChat(req.params.id, req.session)
    if (result.succes) return res.status(200).send("Chat slettet")
    res.status(result.status || 403).send("Fejl ved sletning")
})

// Chat messages route
oldapp.get("/chats/:id/messages", (req, res) => {
    if (req.session.isValidUser) {
        const chat = ChatController.getChatById(req.params.id)

    }
})

oldapp.get("/users", (req, res) => {
    res.render("users", {
        users: UIService.getAllUsersData()
    })
})

oldapp.get("/users/:id", (req, res) => {
    if (req.session.isValidUser && req.session.userLevel === 3) {

        const user = UserController.getUserByID(req.params.id)
        if (user) {
            res.render("userProfile", {user})
        } else {
            res.status(404).render("404")
        }
    } else {
        res.status(403).send("Du har ikke adgang til denne side.")
    }
})

// TODO: Function to edit a users userLevel

// Logout route
oldapp.get("/users/logout", (req, res) => {
    req.session.destroy()
    res.alert("Du bliver logget ud.")
    res.redirect("/")
})

// 404 Not Found route
oldapp.use((req, res, next) => {
    res.status(404).render("404")
})

oldapp.listen(8260, () => {
    console.log("TO INFINITY AND BEYOND 🚀")
})