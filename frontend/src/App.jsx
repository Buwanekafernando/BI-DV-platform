import { useState } from 'react'
import { useEffect } from "react";

import api from "./services/api";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    api.get("/")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <h1>BI Frontend Running</h1>
  )
}

export default App
