import { Dayjs } from 'dayjs';
import { Client, Message, User } from 'discord.js';
import { Player, Poru } from 'poru';

interface AuditLogEntryI {
  user: User;
  func: string;
  date: Dayjs;
}

export class ExtClient extends Client {
  public poru: Poru;
}

export class ExtPlayer extends Player {
  private _message?: Message | null;
  private _auditLog: AuditLogEntryI[] = [];
  private _pauseEditing: boolean;
  private _bassboost: number = 0;

  get message(): Message | null | undefined {
    return this._message;
  }

  set message(message: Message) {
    this._message = message;
  }

  get auditLog(): AuditLogEntryI[] {
    return this._auditLog ?? [];
  }

  set auditLog(entries: AuditLogEntryI[]) {
    this._auditLog = entries;
  }

  get pauseEditing() {
    return this._pauseEditing;
  }

  set pauseEditing(bool: boolean) {
    this._pauseEditing = bool;
  }

  get bassboost(): number {
    return this._bassboost
  }

  set bassboost(scale: number) {
    this._bassboost = scale
  }
}
