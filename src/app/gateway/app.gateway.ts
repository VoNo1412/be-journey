import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserGateway } from './user/user.gateway';
import { NotificationGateway } from './notification/notification.gateway';

@WebSocketGateway(3001, { cors: { origin: "*" }, namespace: "ws" })
export class AppGateway {
    constructor(private readonly userGateway: UserGateway,
        private readonly notificationGateway: NotificationGateway

    ) { }
    @WebSocketServer() server: Server;

    async handleConnection(client: Socket) {
        this.userGateway.server = this.server; // Assign server instance to UserGateway
        this.notificationGateway.server = this.server;
        this.userGateway.handleConnection(client); // Delegate to UserGateway
        
    }

    async handleDisconnect(client: Socket) {
        this.userGateway.server = this.server; // Assign server instance to UserGateway
        this.notificationGateway.server = this.server;
        this.userGateway.handleDisconnect(client); // Delegate to UserGateway
    }

    
}
