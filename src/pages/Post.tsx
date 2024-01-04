import { useState } from "react";

export default function Post() {
  const [count, setCount] = useState(0);
  return (
    <div>
      Post
      <div>
        <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
      </div>
    </div>
  );
}
