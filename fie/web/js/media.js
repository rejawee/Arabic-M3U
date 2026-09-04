/**
 * Media catalog for demo UI.
 * Logos/photos served from local assets copied from media.api-sports.io for development.
 * Production should fetch via a licensed API-Football/API-Sports plan and respect their ToS.
 */
window.FIE_MEDIA = {
  teams: {
    arsenal: { id: 42, name: "آرسنال", nameEn: "Arsenal", crest: "assets/teams/arsenal.png" },
    chelsea: { id: 49, name: "تشيلسي", nameEn: "Chelsea", crest: "assets/teams/chelsea.png" },
    liverpool: { id: 40, name: "ليفربول", nameEn: "Liverpool", crest: "assets/teams/liverpool.png" },
    mancity: { id: 50, name: "سيتي", nameEn: "Man City", crest: "assets/teams/mancity.png" },
    barcelona: { id: 529, name: "برشلونة", nameEn: "Barcelona", crest: "assets/teams/barcelona.png" },
    sevilla: { id: 536, name: "إشبيلية", nameEn: "Sevilla", crest: "assets/teams/sevilla.png" },
    milan: { id: 489, name: "ميلان", nameEn: "Milan", crest: "assets/teams/milan.png" },
    roma: { id: 497, name: "روما", nameEn: "Roma", crest: "assets/teams/roma.png" },
  },
  players: {
    saka: { name: "ساكا", team: "arsenal", photo: "assets/players/saka.png", role: "جناح" },
    odegaard: { name: "أوديغارد", team: "arsenal", photo: "assets/players/odegaard.png", role: "صانع لعب" },
    havertz: { name: "هيفيرتز", team: "arsenal", photo: "assets/players/havertz.png", role: "مهاجم" },
    palmer: { name: "بالمر", team: "chelsea", photo: "assets/players/palmer.png", role: "صانع لعب" },
    salah: { name: "صلاح", team: "liverpool", photo: "assets/players/salah.png", role: "جناح" },
    haaland: { name: "هالاند", team: "mancity", photo: "assets/players/haaland.png", role: "مهاجم" },
    lewandowski: { name: "ليفاندوفسكي", team: "barcelona", photo: "assets/players/lewandowski.png", role: "مهاجم" },
    yamal: { name: "يمال", team: "barcelona", photo: "assets/players/yamal.png", role: "جناح" },
  },
  fixtures: [
    {
      kickoff: "17:30",
      league: "الدوري الإنجليزي",
      home: "arsenal",
      away: "chelsea",
      probs: [46, 27, 27],
      href: "match.html?home=arsenal&away=chelsea",
      keyPlayers: ["saka", "odegaard", "palmer", "havertz"],
      absences: [{ player: "palmer", reason: "شك في المشاركة", impact: "عالي" }],
    },
    {
      kickoff: "15:00",
      league: "الدوري الإنجليزي",
      home: "liverpool",
      away: "mancity",
      probs: [41, 28, 31],
      href: "match.html?home=liverpool&away=mancity",
      keyPlayers: ["salah", "haaland"],
      absences: [],
    },
    {
      kickoff: "20:00",
      league: "الدوري الإسباني",
      home: "barcelona",
      away: "sevilla",
      probs: [62, 22, 16],
      href: "match.html?home=barcelona&away=sevilla",
      keyPlayers: ["lewandowski", "yamal"],
      absences: [],
    },
    {
      kickoff: "19:45",
      league: "الدوري الإيطالي",
      home: "milan",
      away: "roma",
      probs: [44, 29, 27],
      href: "match.html?home=milan&away=roma",
      keyPlayers: [],
      absences: [],
    },
  ],
};
