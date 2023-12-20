import { Client, Message } from "discord.js";
import { Player, Poru } from "poru";
import { PlayerSettings } from "../config";
import { MessageManager } from "./MessageManager";
import { PlayerController } from "./PlayerController";
import { QueueManager } from "./QueueManager";

export class ExtClient extends Client {
  public poru: Poru
}

export class ExtPlayer extends Player {
  private $message: Message | undefined;
  private $pauseEditing: boolean;
  private $sessionId: string;
  private $timeout: NodeJS.Timeout | null;
  private $settings: PlayerSettings;
  private $timeInVc: number = 0;

  // Managers
  public messageManger: MessageManager
  public queueManager: QueueManager
  public controller: PlayerController

  get message(): Message | undefined {
    return this.$message;
  }

  set message(message: Message) {
    this.$message = message;
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
