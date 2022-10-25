import React from 'react';
import styled from "styled-components";
import Invoice from "./components/Invoice";

const TestWrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  background-color: darkgrey;
`

const ComponentWrapper = styled.div`
  background-color: #fff;
  font-family: Roboto, sans-serif;
  border-radius: 4px;
  margin: 32px 0 32px 0;
`

function App() {
  return (
    <TestWrapper>
        <ComponentWrapper>
            <Invoice/>
        </ComponentWrapper>
    </TestWrapper>
  )
}

export default App
