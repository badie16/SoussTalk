import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import "./theme.css" // Importer les styles de thème
import App from "./App.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
