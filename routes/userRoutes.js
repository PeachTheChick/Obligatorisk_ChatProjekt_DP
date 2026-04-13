import express from "express";
import UserController from "../controller/userController.js"
import ChatController from "../controller/chatController.js"

UserController.startUp()

const userRouter = express.Router()

// Pass session data to all templates
userRouter.use((req, res, next) => {
    res.locals.isValidUser = req.session.isValidUser || false
    res.locals.username = req.session.username || null
    res.locals.userId = req.session.userId || null
    res.locals.userLevel = req.session.userLevel || 0
    next()
})

// Return all users - Restricted to Level 3
userRouter.get("/", (req, res) => {
    if (req.session.isValidUser && req.session.userLevel === 3) {
        const users = UserController.getUsers()
        res.render("home", { users, page: 'users' })
    } else {
        res.redirect("/chats")
    }
})

// Login route
userRouter.post("/login", (req, res) => {
    const {userName, userPass} = req.body
    const user = UserController.validateUser(userName, userPass)

    if (!user) {
        res.status(401).send("Invalid Username or password!")
    } else {
        req.session.isValidUser = true
        req.session.userId = user.id
        req.session.username = user.username
        req.session.userLevel = user.userLevel
        res.redirect("/") 
    }
})

// Create new user route
userRouter.post("/adduser", (req, res) => {
    const {userName, userPass, profilePic} = req.body
    if (userName && userPass) {
        const newUser = UserController.addUser(userName, userPass, 1, profilePic)
        req.session.isValidUser = true
        req.session.userId = newUser.id
        req.session.username = userName
        req.session.userLevel = 1
        res.redirect("/")
    } else {
        res.status(400).send("Username and password are required to create a new user!")
    }
})

// Log out route
userRouter.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log("Logout error:", err)
        // Clear cookie to ensure session is fully gone from client side
        res.clearCookie('connect.sid')
        res.redirect("/")
    })
})

// Return specific user - Restricted to Admin OR Self
userRouter.get("/:id", (req, res) => {
    if (!req.session.isValidUser) return res.redirect("/")

    const targetId = parseInt(req.params.id)
    const isAdmin = req.session.userLevel === 3
    const isSelf = req.session.userId === targetId

    if (isAdmin || isSelf) {
        const selectedUser = UserController.getUserByID(targetId)
        if (!selectedUser) return res.status(404).render("404")

        const users = isAdmin ? UserController.getUsers() : []
        const chats = ChatController.getChats() // Needed for left-panel if isSelf

        res.render("home", { 
            users, 
            chats, 
            selectedUser, 
            page: 'users' 
        })
    } else {
        res.redirect("/chats")
    }
})

// Return all messages from a user
userRouter.get('/:id/messages', (req, res) => {
    if (req.session.isValidUser && req.session.userLevel === 3) {
        const targetUser = UserController.getUserByID(req.params.id)
        if (targetUser) {
            const messages = ChatController.getMessagesByUser(targetUser.id)
            res.render("messages", {messages})
        } else {
            res.status(404).render("404")
        }
    } else {
        res.redirect("/chats")
    }
})

export default userRouter
