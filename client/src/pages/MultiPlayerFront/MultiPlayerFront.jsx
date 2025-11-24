import {useEffect, useState, useRef} from "react";
import "./MultiPlayerFront.css";
import GridBackground from "../../components/gridBackground/gridBackground";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const MultiPlayerFront = ({ socket }) => {
    const [nameInput, setNameInput] = useState("");
    const [roomInput, setRoomInput] = useState("");
    const [playerName, setPlayerName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const handleLobbyCreated = (game) => {
            navigate(`/lobby-game-page/${game.room.roomId}/${playerName}`);
        };

        socket.on("lobbyCreated", handleLobbyCreated);

        return () => {
            socket.off("lobbyCreated", handleLobbyCreated);
        };
    }, [playerName, navigate, socket]);

    
    const handleJoinGame = () => {
        const name = nameInput.trim();
        const roomId = roomInput.trim();
        if (roomId) {
            navigate(`/lobby-game-page/${roomId}/${name}`);
        }
        setNameInput("");
        setRoomInput("");
    };
    const handleCreateGame = () => {
        const playerName = nameInput.trim();
        if (!playerName || playerName.length < 1) return;
        setPlayerName(playerName);
        socket.emit("createLobby", {});
    }

    return (
        <div className="multi-player-front">
            <GridBackground />
                <div className='base'>
                    <div className='top-main'>
                    <Link to="/index">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" className="arrow-back"><path fill="#fd1e2d" d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2zM7 10V8h2v2zm0 0v2H5v-2zm10 0V8h-2v2zm0 0v2h2v-2z"/></svg>
                    </Link>
                    <h1 className='index-title'>Multiplayer</h1>
                    </div>
                    <main>
                    <nav className="main-navigation">
                        <div className="content-multi">
                            <input
                                type="text"
                                className="nav-input"
                                placeholder="Enter Username"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                            />
                            <button className="nav-button-multi" onClick={handleCreateGame}>
                                Create Game 
                            </button>
                        </div>
                        <div className="content-multi">
                            <input
                                type="text"
                                className="nav-input"
                                placeholder="Enter Room ID"
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value)}
                            />
                            <button className="nav-button-multi" onClick={handleJoinGame}>
                                Join Game
                            </button>
                        </div>
                    </nav>
                    </main>
                </div>
        </div>
    );
};

export default MultiPlayerFront;