import User from "../model/user.js"
import Archive from "../archive.js"

class UserController {
    static #users = [new User('Admin', 'admin', 3)]

    static getUsers() {
        return UserController.#users
    }   

    static getUserByID(userID) {
        return UserController.#users.find(user => user.id === Number(userID))
    }

    static addUser(userName, userPass, userLevel, profilePic = "") {
        const newUser = new User(userName, userPass, userLevel, profilePic)
        UserController.#users.push(newUser)
        UserController.save()
        return newUser
    }

// Unused. No requirement to delete user
//     static deleteUser(userID) {
//         UserController.#users = UserController.#users.filter(user => user.id != userID)
//         UserController.save()
//     }

    static async startUp() {
        let data = await Archive.readFile('./data/users.json')
        if (data) {
            UserController.#users = JSON.parse(data)
            const biggestID = UserController.#users.reduce((accumulator, user) => {
                return user.id >= accumulator ? user.id : accumulator
            }, 0)
            User.id = biggestID + 1
        }
    }

    static validateUser(userName, userPass) {
        return UserController.#users.find(user => user.username === userName && user.password === userPass)
    }

    static save() {
        Archive.writeFile('./data/users.json', JSON.stringify(UserController.#users, null, 2))
    }

}

export default UserController
