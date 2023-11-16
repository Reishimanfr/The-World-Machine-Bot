import { Client, Message, User } from "discord.js";
import { Player, Poru } from "poru";
import { PlayerSettings } from "../config";

interface AuditLogEntryI {
  user: User;
  func: string;
  date: Date;
}
export class ExtClient extends Client {
  public poru: Poru;
}

export class ExtPlayer extends Player {
  private $message: Message | null;
  private $pauseEditing: boolean;
  private $auditLog: AuditLogEntryI[] = [];
  private $sessionId: string;
  private $timeout: NodeJS.Timeout | null;
  private $settings: PlayerSettings;
  private $timeInVc: number;

  get message(): Message | null | undefined {
    return this.$message;
  }

  set message(message: Message) {
    this.$message = message;
  }

  get auditLog(): AuditLogEntryI[] {
    return this.$auditLog
  }

  set auditLog(entries: AuditLogEntryI[]) {
    this.$auditLog = entries
  }

  get pauseEditing() {
    return this.$pauseEditing;
  }

  set pauseEditing(bool: boolean) {
    this.$pauseEditing = bool;
  }

  get sessionId(): string {
    return this.$sessionId;
  }

  set sessionId(id: string) {
    this.$sessionId = id;
  }

  get timeout(): NodeJS.Timeout | null {
    return this.$timeout;
  }

  set timeout(timeout: NodeJS.Timeout | null) {
    this.$timeout = timeout;
  }

  get settings(): PlayerSettings {
    return this.$settings
  }

  set settings(settings: PlayerSettings) {
    this.$settings = settings
  }

  get timeInVc(): number {
    return this.$timeInVc
  }

  set timeInVc(time: number) {
    this.$timeInVc = time
  }
}
