const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');
require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()




router.post('/login', async (req, res) => {
    const { email, password } = req.body //tar emot email och password

    //checkar att båda fält har blivit fyllda
    if (!email || !password) {
        return res.status(400).json({ error: "Fill all the fields." });
    }


    //checkar om e-post har redan användts
    try {
        const existingUser = await prisma.users.findUnique({
            where: { email }
        }) //om email är fel ges en error
        if (!existingUser) {
            return res.status(400).json({ error: "User not found." });
        }

        //checkar att givna lösenordet matchar med den i databasen
        const matchingPassword = await bcrypt.compare(password, existingUser.password_hash)
        //error om det är fel
        if (!matchingPassword) {
            return res.status(400).json({ error: "Password not correct." });
        }

        const token = jwt.sign({
            sub: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            lastname: existingUser.lastname,
            role: existingUser.role
        }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ msg: "User logged in!", user: existingUser.name, id: existingUser.id, jwt: token })
        console.log("Login approved")
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Error: Login failed!" })
    }

})



module.exports = router