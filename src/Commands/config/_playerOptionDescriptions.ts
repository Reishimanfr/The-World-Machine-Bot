export const playerOptionsData = {
  leaveAfterQueueEnd: {
    name: 'Leave after queue end',
    description: 'Toggles if the bot should leave the voice channel after the queue ends.',
    type: 'boolean'
  },
  resendEmbedAfterSongEnd: {
    name: 'Resend embed after song end',
    description: 'Toggles re-sending the now playing message on new track start.',
    type: 'boolean',
  },
  enableSkipvote: {
    name: 'Vote skipping',
    description: 'Toggles if skiping should invoke a voting to skip.',
    type: 'boolean',
  },
  dynamicNowPlayingMessage: {
    name: 'Dynamic now playing message',
    description: 'Toggles the now playing message updating every 15 seconds.',
    type: 'boolean',
  },
  skipvoteThreshold: {
    name: 'Vote skipping threshold',
    description: 'Sets the % of users required to vote "yes" to skip a song.',
    type: 'number 1-100',
  },
  skipvoteMemberRequirement: {
    name: 'Vote skipping member amount',
    description: 'Sets the required amount of members to invoke a vote skip.',
    type: 'number any',
  }
}

export type playerOptionsType = typeof playerOptionsData