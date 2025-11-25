import {useEffect, useState, useRef} from "react";
import "./MultiPlayerFront.css";
import GridBackground from "../../components/gridBackground/gridBackground";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const MultiPlayerFront = ({ socket }) => {
    const location = useLocation();
    const { errorType, roomId } = location.state || {};
    const [nameInput, setNameInput] = useState("");
    const [roomInput, setRoomInput] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
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

    useEffect(() => {
        setRoomInput(roomId || "");
    }, [roomId]);

    useEffect(() => {
        socket.emit('leaveLobby');
    }, []);

    useEffect(() => {
        if (errorType === 'name') {
            setErrorMessage("This name is already taken. Please choose another one.");
        } else if (errorType === 'lobbyFull') {
            setErrorMessage("The lobby is full. Please try another one.");
        } else if (errorType === 'lobbyNotFound') {
            setErrorMessage("The lobby doesn't exist. Please check the Room ID.");
        } else if (errorType === 'nameLength') {
            setErrorMessage("Name must be between 1 and 12 characters long.");
        } else if (errorType === 'noName') {
            setErrorMessage("Please enter a name to join the game.");
        } else {
            setErrorMessage("");
        }
    }, [errorType]);

    
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
                    <p className="subtitle">{errorMessage}</p>
                    
                    <nav className="main-navigation">
                        <div className="content-multi">
                            <input
                                type="text"
                                className="nav-input"
                                placeholder="Enter Username"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                maxLength={12}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && roomInput.trim() === '') {
                                        handleCreateGame();
                                    } else if (e.key === 'Enter' && roomInput.trim() !== '') {
                                        handleJoinGame();
                                    }
                                }}
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
                                maxLength={14}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && roomInput.trim() === '') {
                                        handleCreateGame();
                                    } else if (e.key === 'Enter' && roomInput.trim() !== '') {
                                        handleJoinGame();
                                    }
                                }}
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