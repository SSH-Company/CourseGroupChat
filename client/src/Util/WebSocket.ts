export class Socket {
    private static instance: Socket;
    public socket;

    private constructor(userID: number) {
        const socket = new WebSocket('ws://192.168.0.124:3000');
        socket.onopen = () => {
            socket.send(JSON.stringify({userID: userID}));
        }
        this.socket = socket
    }

    public static getSocket(userID: number) {
        if (!Socket.instance) {
            Socket.instance = new Socket(userID)
        }
        return Socket.instance
    }
}