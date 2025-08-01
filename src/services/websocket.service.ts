// @ts-ignore - Ignorer l'erreur si le module n'est pas installé
import { io, Socket } from 'socket.io-client';
//import { Notification } from '../types/notification';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private static instance: WebSocketService;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentToken: string | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(token: string): void {
    if (!token) {
      console.log('Token manquant, connexion WebSocket impossible');
      return;
    }
    
    // Si déjà connecté avec le même token, ne pas reconnecter
    if (this.socket && this.socket.connected && this.currentToken === token) {
      console.log('WebSocket déjà connecté avec le même token');
      return;
    }
    
    // Déconnecter l'ancienne connexion si elle existe
    if (this.socket) {
      console.log('Déconnexion de l\'ancienne connexion WebSocket');
      this.disconnect();
    }

    this.currentToken = token;
    
    console.log('Connexion WebSocket avec token:', token.substring(0, 20) + '...');

    this.socket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.reconnectAttempts = 0; // Reset counter on successful connection
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached. Giving up.');
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    // Écouter les événements de notification
    this.socket.on('notification', (data: Notification) => {
      console.log('📧 Notification reçue:', data);
      this.emitToListeners('notification', data);
    });

    this.socket.on('admin-notification', (data: Notification) => {
      console.log('🔔 Admin notification reçue:', data);
      this.emitToListeners('admin-notification', data);
    });

    this.socket.on('notification_read', (data: { notificationId: number }) => {
      console.log('✅ Notification marquée comme lue:', data);
      this.emitToListeners('notification_read', data);
    });

    this.socket.on('all_notifications_read', () => {
      console.log('✅ Toutes les notifications marquées comme lues');
      this.emitToListeners('all_notifications_read', null);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Déconnexion du WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
      this.reconnectAttempts = 0;
    }
  }

  public addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    console.log(`👂 Écouteur ajouté pour l'événement: ${event}`);
  }

  public removeListener(event: string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        console.log(`🔇 Écouteur supprimé pour l'événement: ${event}`);
      }
    }
  }

  private emitToListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    console.log(`📢 Émission de l'événement ${event} vers ${callbacks.length} écouteurs`);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erreur lors de l'exécution du callback pour ${event}:`, error);
      }
    });
  }

  public markAsRead(notificationId: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('markAsRead', { notificationId });
      console.log(`📤 Émission markAsRead pour notification ${notificationId}`);
    } else {
      console.warn('WebSocket non connecté, impossible d\'émettre markAsRead');
    }
  }

  public markAllAsRead(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('markAllAsRead');
      console.log('📤 Émission markAllAsRead');
    } else {
      console.warn('WebSocket non connecté, impossible d\'émettre markAllAsRead');
    }
  }

  public isConnected(): boolean {
    const connected = this.socket !== null && this.socket.connected;
    console.log(`🔍 WebSocket connecté: ${connected}`);
    return connected;
  }

  // Méthode pour forcer la reconnexion
  public forceReconnect(token: string): void {
    console.log('🔄 Force reconnection WebSocket');
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 1000);
  }
}

export default WebSocketService.getInstance();