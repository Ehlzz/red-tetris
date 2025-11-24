import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MultiPlayerHome.css";


const MultiPlayerHome = ({ socket }) => {
    const { roomId, playerName: urlPlayerName } = useParams();
    const navigate = useNavigate();

    const [playerName, setPlayerName] = useState(urlPlayerName || "");
    const [input, setInput] = useState("");
    const [room, setRoom] = useState(null);
    const [lobbyCode, setLobbyCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [nameError, setNameError] = useState(false);
    const joinSent = useRef(false);

    useEffect(() => {
        const handleLobbyCreated = (game) => {
            setLobbyCode(game.room.roomId);
            setRoom(game.room);
            navigate(`/multiplayer/${game.room.roomId}/${playerName}`);
        };
        
        const handleLobbyJoined = (game) => {
            setLobbyCode(game.roomId);
            setRoom(game.room);
            setHasJoined(true);
            if (!roomId) {
                navigate(`/multiplayer/${game.roomId}/${playerName}`);
            }
        };

        const handlePlayerLeft = (game) => {
            setRoom(game.room);
        };
        
        const handleError = (error) => {
            setHasJoined(false);
            setRoom(null);
            setLobbyCode("");
            if (error.name) {
                setNameError(true);
                setPlayerName("");
                setIsJoining(true);
            }
            if (error.room) {
                navigate(`/multiplayer/${error.room}`);
            } else {
                navigate("/multiplayer");
            }
        };

        socket.on("lobbyJoined", handleLobbyJoined);
        socket.on("playerLeft", handlePlayerLeft);
        socket.on("error", handleError);

        return () => {
            socket.off("lobbyJoined", handleLobbyJoined);
            socket.off("playerLeft", handlePlayerLeft);
            socket.off("error", handleError);
        };
    }, [playerName, navigate, roomId]);

    useEffect(() => {
        if (roomId && !urlPlayerName) {
            setIsJoining(true);
        }
    }, [roomId, urlPlayerName]);

    useEffect(() => {
        if (roomId && urlPlayerName && !joinSent.current) {
            joinSent.current = true;

            setPlayerName(urlPlayerName);

            socket.emit("joinLobby", {
                args: {
                    roomId,
                    playerName: urlPlayerName,
                }
            });
        }
    }, [roomId, urlPlayerName]);


    if (!playerName) {
        return (
            <div className="mp-home">
                <div className="mp-content">
                    <h1 className="title">
                        TETRIS <span>ONLINE</span>
                    </h1>
                    <div style={{ color: "white" }}>
                        {nameError && (
                            <p style={{ color: "red" }}>
                                Le nom choisi est déjà utilisé dans cette partie. Veuillez en choisir un autre.
                            </p>
                        )}
                        <p>
                            {isJoining
                                ? "Entrez votre nom pour rejoindre la partie"
                                : "Veuillez entrer votre nom pour continuer"}
                        </p>
                        <input
                            type="text"
                            placeholder="Votre nom"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && input.trim()) {
                                    const name = input.trim();
                                    setPlayerName(name);
                                    if (isJoining && roomId) {
                                        navigate(`/multiplayer/${roomId}/${name}`);
                                    }
                                    setInput("");
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (input.trim()) {
                                    const name = input.trim();
                                    setPlayerName(name);
                                    if (isJoining && roomId) {
                                        navigate(`/multiplayer/${roomId}/${name}`);
                                    }
                                    setInput("");
                                }
                            }}
                        >
                            CONFIRMER
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mp-home">
            <div className="mp-content">
                <h1 className="title">
                    TETRIS <span>ONLINE</span>
                </h1>

                {lobbyCode && room ? (
                    <>
                        <div style={{ color: "white" }}>
                            <p>
                                Code de la partie :{" "}
                                <strong style={{ userSelect: "text", fontSize: "2vw" }}>
                                    {lobbyCode}
                                </strong>
                            </p>

                            <p>Lien à partager :{" "}
                                <strong 
                                    style={{ 
                                        userSelect: "text", 
                                        fontSize: "1.2vw",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        const url = `${window.location.origin}/multiplayer/${lobbyCode}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Lien copié !");
                                    }}
                                >
                                    {window.location.origin}/multiplayer/{lobbyCode}
                                </strong>
                            </p>

                            <p>En attente de joueurs... ({room.players.length} joueurs)</p>

                            {room && room.chief === socket.id && (
                                <button onClick={() => socket.emit("startGame", lobbyCode)}>
                                    DÉMARRER LA PARTIE
                                </button>
                            )}

                            <div>
                                {room.players.map((player) => (
                                    <div key={player.id}>
                                        {player.name} 
                                        {player.id === room.chief && " 👑"}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => {
                                socket.emit("createLobby", { playerName });
                            }}
                        >
                            CRÉER UNE PARTIE
                        </button>

                        <input
                            type="text"
                            placeholder="Entrez le code de la partie"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && input.trim()) {
                                    const code = input.trim();
                                    navigate(`/multiplayer/${code}/${playerName}`);
                                    setInput("");
                                }
                            }}
                        />

                        <button
                            onClick={() => {
                                if (input.trim()) {
                                    const code = input.trim();
                                    navigate(`/multiplayer/${code}/${playerName}`);
                                    setInput("");
                                }
                            }}
                        >
                            REJOINDRE UNE PARTIE
                        </button>

                        <p>Ou rejoignez une partie avec un lien</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default MultiPlayerHome;