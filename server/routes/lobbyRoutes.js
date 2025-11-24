const express = require('express');
const router = express.Router();
const { getRoomById } = require('../game/lobbyManager');

router.get('/multiplayer/:roomId/:playerName', (req, res) => {
    const { roomId, playerName } = req.params;
    const room = getRoomById(roomId);
    
    if (room) {
        const lobbyUrl = `http://localhost:5173/multiplayer/${roomId}/${playerName}`;
        res.redirect(lobbyUrl);
    } else {
        res.status(404).json({ error: 'Lobby introuvable' });
    }
});

module.exports = router;