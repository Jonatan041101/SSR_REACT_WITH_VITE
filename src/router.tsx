import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Other from "./pages/Other";
import NotFound from "./pages/NotFound";
import Post from "./pages/Post";

export const Router = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/other" element={<Other />} />
      <Route path="/post/:id" element={<Post />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
