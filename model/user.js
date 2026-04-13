class User {
    constructor(userName, userPass, userLevel, profilePic = "") {
        this.username = userName
        this.password = userPass
        this.userLevel = userLevel
        this.profilePic = profilePic
        this.id = User.id++
    }
    static id = 1
}

export default User
