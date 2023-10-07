import React from 'react';
import { Container } from './App.style';
import Canvas from './game/Canvas';

function App() {
  return (
    <Container>
      <div id="dev" style={{position: "absolute", left: 0, top: 0, color: "white"}}>TEST</div>
      <Canvas/>
    </Container>
  );
}

export default App;
