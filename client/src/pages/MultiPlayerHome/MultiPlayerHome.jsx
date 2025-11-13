import { useState, useEffect } from 'react';
import './MultiPlayerHome.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const MultiPlayerHome = () => {
    const [input, setInput] = useState('');
    const [room, setRoom] = useState(null);
    const [lobbyCode, setLobbyCode] = useState('');
    
    useEffect(() => {

        socket.on('lobbyCreated', (game) => {
            console.log('🆕 Partie créée avec le code:', game.room.roomId);
            setLobbyCode(game.room.roomId);
            setRoom(game.room);
        });

        socket.on('lobbyJoined', (game) => {
            console.log(game);
            console.log('✅ Rejoint la partie avec le code:', game.roomId);
            console.log('👥 Joueurs dans la partie:', game.room.players);

            setLobbyCode(game.roomId);
            setRoom(game.room);
        });

        return () => {
            socket.off('lobbyCreated');
            socket.off('lobbyJoined');
        };
    }, []);

    const [playerName, setPlayerName] = useState('');

    if (!playerName) {
        return (
            <div className="mp-home">
            <div className="mp-content">
                <h1 className="title">TETRIS <span>ONLINE</span></h1>
                <div style={{ color: 'white' }}>
                <p>Veuillez entrer votre nom pour continuer</p>
                <input 
                    type="text" 
                    placeholder="Votre nom"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={() => {
                    setPlayerName(input);
                    setInput('');
                }}>CONFIRMER</button>
                </div>
            </div>
            </div>
        );
    }

    return (
        <div className="mp-home">
            <div className="mp-content">
                <h1 className="title">TETRIS <span>ONLINE</span></h1>
                {lobbyCode ? (
                    <>
                    <div style={{ color: 'white'}}>
                        <p>Partie créée! Code de la partie: <strong style={{ userSelect: 'text', fontSize: '2vw' }}>{lobbyCode}</strong></p>
                        <p>En attente de joueurs... ({room.players.length} actuellement)</p>
                        {room && room.chief == socket.id && (
                            <button onClick={() => socket.emit('startGame', lobbyCode)}>DÉMARRER LA PARTIE</button>
                        )}
                        <div>
                            {room.players.map((player) => (
                                <div key={player.id}>{player.name}</div>
                            ))}
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => socket.emit('createLobby', { playerName })}>CRÉER UNE PARTIE</button>
                        <input 
                            type="text" 
                            placeholder="Entrez le code de la partie"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        
                        <button onClick={() => socket.emit('joinLobby', { args: { roomId: input, playerName } } )}>REJOINDRE UNE PARTIE</button>
                        <p>Ou rejoignez une partie avec un code</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default MultiPlayerHome;