interface INotification {
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    taskId: number; 
    recipientId: number;   
    senderId: number;
}