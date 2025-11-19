import {useEffect, useState} from "react";
import "./MultiPlayerFront.css";
import GridBackground from "../../components/gridBackground";
import { Link } from "react-router-dom";

const MultiPlayerFront = () => {
    return (
        <div className="multi-player-front">
            <GridBackground />
                <div className='base'>
                    <div className='top-main'>
                    <Link to="/index">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" className="arrow-back"><path fill="#fd1e2d" d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2zM7 10V8h2v2zm0 0v2H5v-2zm10 0V8h-2v2zm0 0v2h2v-2z"/></svg>
                    </Link>
                    <h1 className='title'>Multiplayer</h1>
                    </div>
                    <main>
                    <nav className="main-navigation">
                        <div className="content-multi">
                            <input type="text" className="nav-input" placeholder="Enter Username"/>
                            <Link to="/lobby-game-page">
                                <button className="nav-button-multi">
                                    Create Game
                                </button>
                            </Link>
                        </div>
                        <div className="content-multi">
                            <input type="text" className="nav-input" placeholder="Enter Game Code"/>
                            <button className="nav-button-multi">
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