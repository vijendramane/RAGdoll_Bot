import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket() {
	const socketRef = useRef<Socket | null>(null);
	useEffect(() => {
		const url = process.env.NEXT_PUBLIC_WS_URL || '';
		if (!url) return;
		const sock = io(url, { transports: ['websocket'] });
		socketRef.current = sock;
		return () => { sock.close(); };
	}, []);
	return socketRef.current;
}

