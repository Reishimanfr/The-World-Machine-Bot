export interface ITf2Stats {
  iPointsScored?: number;
  iNumberOfKills?: number;
  iSentryKills?: number;
  iBuildingsBuilt?: number;
  iBackstabs?: number;
  iHeadshots?: number;
  iKillAssists?: number;
  iHealthPointsHealed?: number;
  iNumInvulnerable?: number;
  iDamageDealt?: number;
  iRevenge?: number;
  iPointCaptures?: number;
  iPointDefenses?: number;
}

export const statFields = [
  { title: "Playtime", stat: "iPlayTime" },
  { title: "Points Scored", stat: "iPointsScored" },
  { title: "ÜberCharges", stat: "iNumInvulnerable", playerClass: "Medic" },
  { title: "Healing", stat: "iHealthPointsHealed", playerClass: "Medic" },
  { title: "Kills", stat: "iNumberOfKills" },
  { title: "Headshots", stat: "iHeadshots", playerClass: "Sniper" },
  { title: "Sentry Kills", stat: "iSentryKills", playerClass: "Engineer" },
  { title: "Backstabs", stat: "iBackstabs", playerClass: "Spy" },
  {
    title: "Buildings Built",
    stat: "iBuildingsBuilt",
    playerClass: "Engineer",
  },
  { title: "Points Scored", stat: "iPointsScored" },
  { title: "Assists", stat: "iKillAssists" },
  { title: "Damage", stat: "iDamageDealt" },
  { title: "Dominations", stat: "iDominations" },
  { title: "Revenges", stat: "iRevenge" },
  { title: "Captures", stat: "iPointCaptures" },
  { title: "Defenses", stat: "iPointDefenses" },
  { title: "Destructions", stat: "iBuildingsDestroyed" },
];

export const classIconObject = {
  Scout:
    "https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png",
  Soldier:
    "https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png",
  Pyro: "https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png",
  Demoman:
    "https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png",
  Heavy:
    "https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png",
  Engineer:
    "https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png",
  Medic:
    "https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png",
  Sniper:
    "https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png",
  Spy: "https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png",
};

// If you want class icons you have to create emojis from images in the classIconObject
// object and save their escaped sequence here
export const classIconEmoji = {
  Scout: "<:scout:1123345274732019772>",
  Soldier: "<:soldier:1123345276065824880>",
  Pyro: "<:pyro:1123345277575766181>",
  Demoman: "<:demoman:1123345263419981866>",
  Heavy: "<:heavy:1123345266003693708>",
  Engineer: "<:engineer:1123345267207450646>",
  Medic: "<:medic:1123345270470623352>",
  Sniper: "<:sniper:1123345271850545213>",
  Spy: "<:spy:1123345153936076821>",
};

export const classes = Object.keys(classIconEmoji);
