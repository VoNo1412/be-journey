import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/app/user/user.service';
import {
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: ["http://localhost:3000"]} })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly userService: UserService) { }

    // Handle new messages
    @SubscribeMessage('message')
    handleMessage(
        @MessageBody() data: { sender: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        console.log(`Message from ${data.sender}: ${data.message}`);
        this.server.emit('message', data); // Broadcast message to all clients
    }

    // Handle client connection
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    // Handle client disconnection
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // async handleConnection(socket: Socket) {
    //     const userId = Number(socket.handshake.query.userId);
    //     if (userId) {
    //         await this.userService.setOnline(userId);
    //         this.server.emit('user-status-update', { userId, isOnline: true });
    //     }
    // }

    // async handleDisconnect(socket: Socket) {
    //     const userId = Number(socket.handshake.query.userId);
    //     if (userId) {
    //         await this.userService.setOffline(userId);
    //         this.server.emit('user-status-update', { userId, isOnline: false });
    //     }
    // }

    @SubscribeMessage('setOffline')
    async setOffline(socket: Socket, userId: number) {
        await this.userService.setOffline(userId);
        this.server.emit('user-status-update', { userId, isOnline: false });
    }

    @SubscribeMessage('setOnline')
    async setOnline(socket: Socket, { userId }: { userId: number }) {
        await this.userService.setOnline(userId); // Ensure user is marked online
        this.server.emit('user-status-update', { userId, isOnline: true }); // Notify other clients
    }
}
