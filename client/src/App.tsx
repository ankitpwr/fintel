import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import Layout from "./components/layout";
import ChatPage from "./pages/chatPage";
import RequireAuth from "./components/requireAuth";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route element={<RequireAuth />}>
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
