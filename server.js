const express = require('express')
const WebSocket = require('ws')
const os = require('os')
require('dotenv').config()


const app = express()

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT })

const clients = new Set();



wss.on('connection', (ws, req) => {
    console.log(`Running on http://localhost:${PORT}`)
    console.log('Client connected')


    const urlParams = new URLSearchParams(req.url.slice(1))
    if (urlParams.get('token') !== process.env.TOKEN) {
        console.log('invalid token: ' + urlParams.get('token'))
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid token'
        }))
        ws.close();
    }

    if (!clients.has(ws)) {
        clients.add(ws)
    }

    ws.on('message', (message) => {
        console.log('Recieved message: ', message)

        clients.forEach(client => {
            client.send(JSON.stringify({
                status: 0,
                msg: String(message),

            }))
        })

    })

    ws.on('close', () => {
        console.log('client disconnected')
    })

})