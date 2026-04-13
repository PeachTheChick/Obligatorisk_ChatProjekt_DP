import express from "express"
import session from "express-session"
import userRouter from "./routes/userRoutes.js"
import chatRouter from "./routes/chatRoutes.js"

const app = express()

app.set("view engine", "pug")

app.use(express.static("assets"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(session({
    secret: "secretkey",
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 600000,
        secure: false
    }
}))

// Global middleware to pass user session to all templates
app.use((req, res, next) => {
    res.locals.user = {
        isValidUser: req.session.isValidUser || false,
        userId: req.session.userId || null,
        username: req.session.username || null,
        userLevel: req.session.userLevel || 0
    }
    next()
})

app.get("/", (req,res) =>{
    res.redirect("/chats")
})

app.use("/users", userRouter)
app.use("/chats", chatRouter) // Mount chatRouter at root to handle home and chats

// 404 Not Found route
app.use((req, res, next) => {
    res.status(404).render("404")
})

app.listen(8260, () => {
    console.log("TO INFINITY AND BEYOND 🚀")
})
