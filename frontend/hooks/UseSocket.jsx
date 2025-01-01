import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UseSocket = (URL) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(URL);
    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, [URL]);

  return socket;
};

export default UseSocket;
