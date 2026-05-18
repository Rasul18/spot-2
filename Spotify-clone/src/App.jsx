import React, { useContext } from "react";
import './index.css'
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import Display from "./components/Display";
import { PlayerContext } from "./context/player-context";

const App = () => {

  const { audioRef, track, theme } = useContext(PlayerContext);

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-slate-100 text-slate-900'}>
      <div className="flex min-h-screen flex-col lg:flex-row lg:items-stretch">
        <Sidebar />
        <Display />
      </div>
      <Player />
      {track && <audio ref={audioRef} src={track.file} preload='auto'></audio>}
    </div>
  );
}

export default App;
