import { AmqpConnection } from './connection';

export class AMQPConnectionManager {
  private connections: AmqpConnection[] = [];

  public addConnection(connection: AmqpConnection): void {
    this.connections.push(connection);
  }

  public getConnection(name: string): AmqpConnection {
    return this.connections.find((connection) => connection.configuration.name === name);
  }

  public getConnections(): AmqpConnection[] {
    return this.connections;
  }

  public clearConnection(): void {
    this.connections = [];
  }
}
