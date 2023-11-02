import { Client, Message, User } from "discord.js";
import { Player, Poru } from "poru";

interface AuditLogEntryI {
  user: User;
  func: string;
  date: Date;
}
export class ExtClient extends Client {
  public poru: Poru;
}

export class ExtPlayer extends Player {
  private $message?: Message | null;
  private $auditLog: AuditLogEntryI[] = [];
  private $pauseEditing: boolean;
  private $UUID: string;
  private $activeTimeout: NodeJS.Timeout | null;

  get message(): Message | null | undefined {
    return this.$message;
  }

  set message(message: Message) {
    this.$message = message;
  }

  get auditLog(): AuditLogEntryI[] {
    return this.$auditLog ?? [];
  }

  set auditLog(entries: AuditLogEntryI[]) {
    this.$auditLog = entries;
  }

  get pauseEditing() {
    return this.$pauseEditing;
  }

  set pauseEditing(bool: boolean) {
    this.$pauseEditing = bool;
  }

  get UUID(): string {
    return this.$UUID;
  }

  set UUID(UUID: string) {
    this.$UUID = UUID;
  }

  get playerTimeout(): NodeJS.Timeout | null {
    return this.$activeTimeout;
  }

  set playerTimeout(timeout: NodeJS.Timeout | null) {
    this.$activeTimeout = timeout;
  }
}
