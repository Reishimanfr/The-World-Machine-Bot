import { Client, Message } from "discord.js";
import { Player, Poru } from "poru";
import { PlayerSettings } from "../config";
import { MessageManager } from "./MessageManager";
import { PlayerController } from "./PlayerController";
import { QueueManager } from "./QueueManager";
import { Segment } from "sponsorblock-api";

export class ExtClient extends Client {
  public poru: Poru
}

export class ExtPlayer extends Player {
  private $message: Message | undefined;
  private $pauseEditing: boolean;
  private $sessionId: string;
  private $timeout: NodeJS.Timeout | null;
  private $settings: PlayerSettings;
  private $voteSkipActive = false
  private $lavalinkUpdateTics = 0
  private $currentSponsoredSegments: Array<Segment>

  // Managers
  public messageManger: MessageManager
  public queueManager: QueueManager
  public controller: PlayerController

  get currentSponsoredSegments(): Array<Segment> {
    return this.$currentSponsoredSegments
  }

  set currentSponsoredSegments(value: Array<Segment>) {
    this.$currentSponsoredSegments = value
  }

  get lavalinkUpdateTics(): number {
    return this.$lavalinkUpdateTics
  }

  set lavalinkUpdateTics(newValue: number) {
    this.$lavalinkUpdateTics = newValue
  }

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

  get votingActive() {
    return this.$voteSkipActive
  }

  set votingActive(bool: boolean) {
    this.$voteSkipActive = bool
  }
}
