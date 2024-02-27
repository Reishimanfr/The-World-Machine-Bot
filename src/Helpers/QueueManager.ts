import { EmbedBuilder } from "discord.js";
import { Track } from "poru";
import { formatSeconds } from "../Funcs/FormatSeconds";
import { ExtPlayer } from "./ExtendedClasses";

const ENTIRES_PER_PAGE = 6

class QueueManager {
  private readonly player: ExtPlayer

  constructor(player: ExtPlayer) {
    this.player = player
  }

  /**
   * Formats a embed queue field 
   */
  private formatQueueField(track: Track, iteration: number) {
    const info = track.info

    const linkedTitleAndAuthor = `\`${iteration}\`: **[${info.title} - ${info.author}](${info.uri})**`

    return `${linkedTitleAndAuthor}\nAdded by <@${info.requester.id}> | Duration: \`${formatSeconds(info.length / 1000)}\`\n\n`
  }

  /**
   * Creates a embed with the current queue entries
   */
  public createQueueEmbed(): EmbedBuilder[] | null {
    const queue = this.player.queue

    if (queue.length < 1) return null

    const entryStrings: string[] = []
    const embeds: EmbedBuilder[] = []

    for (let i = 0; i < queue.length; i++) {
      const entry: Track = queue[i]
      entryStrings.push(this.formatQueueField(entry, i + 1))
    }

    // Split by 6 entries per page
    for (let i = 0; i < entryStrings.length; i += ENTIRES_PER_PAGE) {
      const slice = entryStrings.slice(i, i += ENTIRES_PER_PAGE)

      let description = ''

      for (const part of slice) {
        description += part
      }

      embeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `[ There are ${entryStrings.length} songs in the queue. ]`,
          })
          .setDescription(description)
      )
    }

    return embeds
  }
}

export { QueueManager };
