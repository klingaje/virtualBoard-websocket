const express = require('express')
const WebSocket = require('ws')
const os = require('os')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')


const app = express()
app.use(cors())

const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT })

const userClients = new Map()


wss.on('connection', (ws, req) => {
    console.log(`Running on http://localhost:${PORT}`)
    console.log('Client connected')

    let payload
    const urlParams = new URLSearchParams(req.url.slice(1))
    const token = urlParams.get('token')

    if (!token) {
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Missing token'
        }))
        ws.close()
        return
    }

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Token payload:', payload)
    } catch (error) {
        console.log('Token verification failed:', error.name, error.message)

        if (error.name === 'TokenExpiredError') {
            ws.send(JSON.stringify({

                //refresh token nånstans

                status: 1,
                msg: 'ERROR: Session expired. Please log in again.'
            }))
        } else {
            ws.send(JSON.stringify({
                status: 1,
                msg: 'ERROR: Invalid session token'
            }))
        }
        ws.close()
        return
    }

    const userEmail = payload.email

    if (!userClients.has(userEmail)) {
        userClients.set(userEmail, new Set())
    }
    userClients.get(userEmail).add(ws)

    ws.on('message', (message) => {
        console.log('Recieved message: ', message)

        const clients = userClients.get(userEmail)
        if (!clients) return

        for (const client of clients) {
            if(client.readyState == WebSocket.OPEN){
                client.send(JSON.stringify({
                    status: 0,
                    msg: String(message),
                }))
            }
        }

    })

    ws.on('close', () => {
        console.log('client disconnected')
    })



})

app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})