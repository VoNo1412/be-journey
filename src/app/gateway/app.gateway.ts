import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/app/user/user.service';

@WebSocketGateway(3001, { cors: { origin: "*", transports: ['websocket'] } })
export class AppGateway  implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(private readonly userService: UserService) { }

    /**
     * @param client The connected client socket
     * @description Handles the connection event when a client connects to the WebSocket server.
     * check user online status and emit an event to update the user status.
     */
    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        const userId = client.handshake.query.userId;
        if (userId) {
            console.log(`User connected: ${userId}`);
            await this.userService.setStatus(+userId, true);
            this.server.emit('user-status-update', { userId, isOnline: true });
        }
    }
    
     /**
     * 
     * @param client The disconnected client socket
     * @description Handles the disconnection event when a client disconnects from the WebSocket server.
     * Handle disconnections (e.g., browser close, logout) and update last seen time from user logout
     */
     handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId;
        if (userId) {
            console.log(`User disconnected: ${userId}`);
            this.userService.setStatus(+userId, false); // Mark user as offline
            this.server.emit('user-status-update', { userId, isOnline: false });
        }
    }


    
    
}
