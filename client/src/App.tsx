import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import Layout from "./components/layout";
import ChatPage from "./pages/chatPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
