import type { RawCaseConfig } from './shared'

export const cases = [
  {
    "id": "missing-cookies",
    "title": "The Missing Cookies",
    "shortStory": "Someone snuck into camp overnight and ate all the cookies.",
    "crimeIcon": "🍪",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Campsite",
      "traceArea": "Tracks",
      "storageArea": "Forest Edge",
      "lockedObject": "Cookie Jar",
      "witnessArea": "Witness Tent",
      "witnessRole": "sleepy camper",
      "waterFeature": "wash bucket"
    },
    "sceneImage": "/case-scenes/missing-cookies.webp",
    "sceneImageAlt": "Scene photo for The Missing Cookies"
  },
  {
    "id": "purloined-page",
    "title": "The Purloined Page",
    "shortStory": "A rare page was torn from a locked book in the library.",
    "crimeIcon": "📖",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Reading Room",
      "traceArea": "Front Desk",
      "storageArea": "Rare Books",
      "lockedObject": "Study Nook",
      "witnessArea": "Staff Office",
      "witnessRole": "assistant",
      "waterFeature": "coat rack"
    },
    "sceneImage": "/case-scenes/purloined-page.jpg",
    "sceneImageAlt": "Scene photo for The Purloined Page"
  },
  {
    "id": "missing-medal",
    "title": "The Missing Medal",
    "shortStory": "A championship medal vanished from the locked trophy case overnight.",
    "crimeIcon": "🏅",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Locker Room",
      "traceArea": "Gym Floor",
      "storageArea": "Equipment Room",
      "lockedObject": "Trophy Case",
      "witnessArea": "Coach Office",
      "witnessRole": "coach",
      "waterFeature": "sink area"
    },
    "sceneImage": "/case-scenes/missing-medal.webp",
    "sceneImageAlt": "Scene photo for The Missing Medal"
  },
  {
    "id": "ravaged-pantry",
    "title": "The Ravaged Pantry",
    "shortStory": "Someone raided the restaurant pantry after closing hours.",
    "crimeIcon": "🥘",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Pantry",
      "traceArea": "Kitchen Counter",
      "storageArea": "Walk-in Fridge",
      "lockedObject": "Dining Room Cabinet",
      "witnessArea": "Back Alley",
      "witnessRole": "delivery person",
      "waterFeature": "drain"
    },
    "sceneImage": "/case-scenes/ravaged-pantry.jpg",
    "sceneImageAlt": "Scene photo for The Ravaged Pantry"
  },
  {
    "id": "stolen-artifact",
    "title": "The Stolen Artifact",
    "shortStory": "A priceless artifact was taken from a sealed museum exhibit.",
    "crimeIcon": "🗿",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Main Hall",
      "traceArea": "Exhibit Room",
      "storageArea": "Storage Vault",
      "lockedObject": "Security Office",
      "witnessArea": "Rooftop",
      "witnessRole": "rooftop guard",
      "waterFeature": "drainpipe"
    },
    "sceneImage": "/case-scenes/stolen-artifact.jpg",
    "sceneImageAlt": "Scene photo for The Stolen Artifact"
  },
  {
    "id": "vanishing-vase",
    "title": "The Vanishing Vase",
    "shortStory": "A painted vase disappeared from the florist's front display overnight.",
    "crimeIcon": "🏺",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Florist Display",
      "traceArea": "Shop Aisle",
      "storageArea": "Potting Shelf",
      "lockedObject": "Display Cabinet",
      "witnessArea": "Flower Stand",
      "witnessRole": "florist",
      "waterFeature": "watering can"
    },
    "sceneImage": "/case-scenes/vanishing-vase.webp",
    "sceneImageAlt": "Scene photo for The Vanishing Vase"
  },
  {
    "id": "broken-bakery-window",
    "title": "The Broken Bakery Window",
    "shortStory": "Someone broke into the bakery and scattered flour across the counter.",
    "crimeIcon": "🥐",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Bakery Floor",
      "traceArea": "Flour Counter",
      "storageArea": "Bread Rack",
      "lockedObject": "Pastry Case",
      "witnessArea": "Kitchen Door",
      "witnessRole": "baker",
      "waterFeature": "wash sink"
    },
    "sceneImage": "/case-scenes/broken-bakery-window.webp",
    "sceneImageAlt": "Scene photo for The Broken Bakery Window"
  },
  {
    "id": "missing-moonstone",
    "title": "The Missing Moonstone",
    "shortStory": "A moonstone vanished from a quiet shrine before sunrise.",
    "crimeIcon": "🌙",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Shrine Steps",
      "traceArea": "Moonlit Path",
      "storageArea": "Offering Shelf",
      "lockedObject": "Stone Reliquary",
      "witnessArea": "Prayer Hall",
      "witnessRole": "caretaker",
      "waterFeature": "ritual basin"
    },
    "sceneImage": "/case-scenes/missing-moonstone.webp",
    "sceneImageAlt": "Scene photo for The Missing Moonstone"
  },
  {
    "id": "stolen-stage-prop",
    "title": "The Stolen Stage Prop",
    "shortStory": "The theater's prized prop vanished moments before rehearsal.",
    "crimeIcon": "🎭",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Main Stage",
      "traceArea": "Backstage Floor",
      "storageArea": "Prop Rack",
      "lockedObject": "Costume Trunk",
      "witnessArea": "Green Room",
      "witnessRole": "stagehand",
      "waterFeature": "makeup sink"
    },
    "sceneImage": "/case-scenes/stolen-stage-prop.webp",
    "sceneImageAlt": "Scene photo for The Stolen Stage Prop"
  },
  {
    "id": "ransacked-greenhouse",
    "title": "The Ransacked Greenhouse",
    "shortStory": "Rare seedlings were uprooted from the greenhouse after closing.",
    "crimeIcon": "🌱",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Greenhouse Bed",
      "traceArea": "Damp Walkway",
      "storageArea": "Seedling Rack",
      "lockedObject": "Tool Cabinet",
      "witnessArea": "Garden Gate",
      "witnessRole": "gardener",
      "waterFeature": "irrigation hose"
    },
    "sceneImage": "/case-scenes/ransacked-greenhouse.webp",
    "sceneImageAlt": "Scene photo for The Ransacked Greenhouse"
  },
  {
    "id": "vanished-fishing-net",
    "title": "The Vanished Fishing Net",
    "shortStory": "A fisher's best net vanished from the pier shed.",
    "crimeIcon": "🎣",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Pier Shed",
      "traceArea": "Dock Planks",
      "storageArea": "Net Rack",
      "lockedObject": "Bait Locker",
      "witnessArea": "Harbor Bench",
      "witnessRole": "fisher",
      "waterFeature": "tide pool"
    },
    "sceneImage": "/case-scenes/vanished-fishing-net.webp",
    "sceneImageAlt": "Scene photo for The Vanished Fishing Net"
  },
  {
    "id": "pilfered-parcel",
    "title": "The Pilfered Parcel",
    "shortStory": "A sealed parcel disappeared from the post office sorting room.",
    "crimeIcon": "📦",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Sorting Room",
      "traceArea": "Mail Counter",
      "storageArea": "Parcel Shelf",
      "lockedObject": "Delivery Cage",
      "witnessArea": "Front Desk",
      "witnessRole": "clerk",
      "waterFeature": "mop bucket"
    },
    "sceneImage": "/case-scenes/pilfered-parcel.jpg",
    "sceneImageAlt": "Scene photo for The Pilfered Parcel"
  },
  {
    "id": "toppled-totem",
    "title": "The Toppled Totem",
    "shortStory": "A carved totem was knocked over in the village square.",
    "crimeIcon": "🪵",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Village Square",
      "traceArea": "Packed Dirt Path",
      "storageArea": "Carving Stand",
      "lockedObject": "Ceremonial Chest",
      "witnessArea": "Meeting Hut",
      "witnessRole": "elder",
      "waterFeature": "rain barrel"
    },
    "sceneImage": "/case-scenes/toppled-totem.webp",
    "sceneImageAlt": "Scene photo for The Toppled Totem"
  },
  {
    "id": "missing-map",
    "title": "The Missing Map",
    "shortStory": "A hand-drawn route map vanished from the ranger station.",
    "crimeIcon": "🗺️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Ranger Desk",
      "traceArea": "Station Floor",
      "storageArea": "Map Shelf",
      "lockedObject": "File Cabinet",
      "witnessArea": "Lookout Porch",
      "witnessRole": "ranger",
      "waterFeature": "canteen crate"
    },
    "sceneImage": "/case-scenes/missing-map.webp",
    "sceneImageAlt": "Scene photo for The Missing Map"
  },
  {
    "id": "raided-berry-stall",
    "title": "The Raided Berry Stall",
    "shortStory": "A market stall was emptied of its ripest berries overnight.",
    "crimeIcon": "🫐",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Berry Stall",
      "traceArea": "Market Lane",
      "storageArea": "Crate Stack",
      "lockedObject": "Cash Box",
      "witnessArea": "Vendor Booth",
      "witnessRole": "vendor",
      "waterFeature": "rinse tub"
    },
    "sceneImage": "/case-scenes/raided-berry-stall.webp",
    "sceneImageAlt": "Scene photo for The Raided Berry Stall"
  },
  {
    "id": "stolen-silver-bell",
    "title": "The Stolen Silver Bell",
    "shortStory": "A silver bell disappeared from the town hall display.",
    "crimeIcon": "🔔",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Town Hall",
      "traceArea": "Marble Hallway",
      "storageArea": "Display Shelf",
      "lockedObject": "Bell Case",
      "witnessArea": "Clerk Office",
      "witnessRole": "clerk",
      "waterFeature": "water cooler"
    },
    "sceneImage": "/case-scenes/stolen-silver-bell.jpg",
    "sceneImageAlt": "Scene photo for The Stolen Silver Bell"
  },
  {
    "id": "scrambled-signal",
    "title": "The Scrambled Signal",
    "shortStory": "The radio tower's tuning crystal was disturbed during the night.",
    "crimeIcon": "📡",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Radio Tower",
      "traceArea": "Service Platform",
      "storageArea": "Cable Rack",
      "lockedObject": "Tuning Console",
      "witnessArea": "Control Booth",
      "witnessRole": "technician",
      "waterFeature": "cooling tank"
    },
    "sceneImage": "/case-scenes/scrambled-signal.jpg",
    "sceneImageAlt": "Scene photo for The Scrambled Signal"
  },
  {
    "id": "missing-museum-key",
    "title": "The Missing Museum Key",
    "shortStory": "The curator's master key vanished from a locked office.",
    "crimeIcon": "🗝️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Curator Office",
      "traceArea": "Gallery Hall",
      "storageArea": "Catalog Shelf",
      "lockedObject": "Key Cabinet",
      "witnessArea": "Ticket Desk",
      "witnessRole": "curator",
      "waterFeature": "cleaning bucket"
    },
    "sceneImage": "/case-scenes/missing-museum-key.jpg",
    "sceneImageAlt": "Scene photo for The Missing Museum Key"
  },
  {
    "id": "wrecked-workshop",
    "title": "The Wrecked Workshop",
    "shortStory": "A repair workshop was found open with parts scattered everywhere.",
    "crimeIcon": "🛠️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Repair Bench",
      "traceArea": "Workshop Floor",
      "storageArea": "Parts Shelf",
      "lockedObject": "Tool Chest",
      "witnessArea": "Service Window",
      "witnessRole": "mechanic",
      "waterFeature": "parts washer"
    },
    "sceneImage": "/case-scenes/wrecked-workshop.webp",
    "sceneImageAlt": "Scene photo for The Wrecked Workshop"
  },
  {
    "id": "empty-aquarium-cache",
    "title": "The Empty Aquarium Cache",
    "shortStory": "A hidden cache beside the aquarium tank was emptied overnight.",
    "crimeIcon": "🐠",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Aquarium Hall",
      "traceArea": "Tank Walkway",
      "storageArea": "Feed Shelf",
      "lockedObject": "Filter Cabinet",
      "witnessArea": "Viewing Room",
      "witnessRole": "aquarist",
      "waterFeature": "main tank"
    },
    "sceneImage": "/case-scenes/empty-aquarium-cache.jpg",
    "sceneImageAlt": "Scene photo for The Empty Aquarium Cache"
  },
  {
    "id": "lost-lantern",
    "title": "The Lost Lantern",
    "shortStory": "The festival lantern disappeared before the evening procession.",
    "crimeIcon": "🏮",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Festival Booth",
      "traceArea": "Lantern Path",
      "storageArea": "Decoration Rack",
      "lockedObject": "Supply Chest",
      "witnessArea": "Parade Gate",
      "witnessRole": "organizer",
      "waterFeature": "fountain basin"
    },
    "sceneImage": "/case-scenes/lost-lantern.jpg",
    "sceneImageAlt": "Scene photo for The Lost Lantern"
  },
  {
    "id": "stolen-snowglobe",
    "title": "The Stolen Snowglobe",
    "shortStory": "A souvenir snowglobe vanished from the lodge display.",
    "crimeIcon": "❄️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Lodge Lobby",
      "traceArea": "Carpet Runner",
      "storageArea": "Souvenir Shelf",
      "lockedObject": "Glass Display",
      "witnessArea": "Reception Desk",
      "witnessRole": "innkeeper",
      "waterFeature": "tea station"
    },
    "sceneImage": "/case-scenes/stolen-snowglobe.webp",
    "sceneImageAlt": "Scene photo for The Stolen Snowglobe"
  },
  {
    "id": "disturbed-dojo-locker",
    "title": "The Disturbed Dojo Locker",
    "shortStory": "A training badge was taken from the dojo locker room.",
    "crimeIcon": "🥋",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Dojo Floor",
      "traceArea": "Practice Mat",
      "storageArea": "Gear Rack",
      "lockedObject": "Badge Locker",
      "witnessArea": "Training Hall",
      "witnessRole": "sensei",
      "waterFeature": "wash basin"
    },
    "sceneImage": "/case-scenes/disturbed-dojo-locker.webp",
    "sceneImageAlt": "Scene photo for The Disturbed Dojo Locker"
  },
  {
    "id": "missing-honey-jar",
    "title": "The Missing Honey Jar",
    "shortStory": "A jar of rare honey vanished from the apiary shed.",
    "crimeIcon": "🍯",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Apiary Shed",
      "traceArea": "Hive Path",
      "storageArea": "Jar Shelf",
      "lockedObject": "Honey Cabinet",
      "witnessArea": "Bee Yard",
      "witnessRole": "beekeeper",
      "waterFeature": "smoker bucket"
    },
    "sceneImage": "/case-scenes/missing-honey-jar.webp",
    "sceneImageAlt": "Scene photo for The Missing Honey Jar"
  },
  {
    "id": "raided-rooftop-garden",
    "title": "The Raided Rooftop Garden",
    "shortStory": "A rooftop planter was stripped of its prize herbs.",
    "crimeIcon": "🪴",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Rooftop Garden",
      "traceArea": "Gravel Walkway",
      "storageArea": "Planter Rack",
      "lockedObject": "Seed Cabinet",
      "witnessArea": "Roof Door",
      "witnessRole": "caretaker",
      "waterFeature": "rain collector"
    },
    "sceneImage": "/case-scenes/raided-rooftop-garden.jpg",
    "sceneImageAlt": "Scene photo for The Raided Rooftop Garden"
  },
  {
    "id": "broken-observatory-case",
    "title": "The Broken Observatory Case",
    "shortStory": "A star chart was taken from the observatory display case.",
    "crimeIcon": "🔭",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Observatory Dome",
      "traceArea": "Telescope Platform",
      "storageArea": "Chart Shelf",
      "lockedObject": "Star Chart Case",
      "witnessArea": "Control Room",
      "witnessRole": "astronomer",
      "waterFeature": "lens rinse tray"
    },
    "sceneImage": "/case-scenes/broken-observatory-case.jpg",
    "sceneImageAlt": "Scene photo for The Broken Observatory Case"
  },
  {
    "id": "stolen-ticket-roll",
    "title": "The Stolen Ticket Roll",
    "shortStory": "A full roll of tickets disappeared from the arcade booth.",
    "crimeIcon": "🎟️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Arcade Booth",
      "traceArea": "Game Aisle",
      "storageArea": "Prize Shelf",
      "lockedObject": "Ticket Drawer",
      "witnessArea": "Token Counter",
      "witnessRole": "attendant",
      "waterFeature": "soda spill"
    },
    "sceneImage": "/case-scenes/stolen-ticket-roll.webp",
    "sceneImageAlt": "Scene photo for The Stolen Ticket Roll"
  },
  {
    "id": "missing-train-luggage",
    "title": "The Missing Train Luggage",
    "shortStory": "A passenger's luggage vanished from the station platform.",
    "crimeIcon": "🚂",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Station Platform",
      "traceArea": "Ticket Hall",
      "storageArea": "Luggage Rack",
      "lockedObject": "Storage Locker",
      "witnessArea": "Conductor Booth",
      "witnessRole": "conductor",
      "waterFeature": "platform puddle"
    },
    "sceneImage": "/case-scenes/missing-train-luggage.jpg",
    "sceneImageAlt": "Scene photo for The Missing Train Luggage"
  },
  {
    "id": "vandalized-clocktower",
    "title": "The Vandalized Clocktower",
    "shortStory": "The clocktower mechanism was tampered with before noon.",
    "crimeIcon": "🕰️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Clocktower Base",
      "traceArea": "Spiral Stair",
      "storageArea": "Gear Shelf",
      "lockedObject": "Mechanism Panel",
      "witnessArea": "Bell Room",
      "witnessRole": "timekeeper",
      "waterFeature": "maintenance pail"
    },
    "sceneImage": "/case-scenes/vandalized-clocktower.webp",
    "sceneImageAlt": "Scene photo for The Vandalized Clocktower"
  },
  {
    "id": "missing-tea-tin",
    "title": "The Missing Tea Tin",
    "shortStory": "A prized tea tin vanished from the cafe shelf.",
    "crimeIcon": "🍵",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Cafe Counter",
      "traceArea": "Tile Floor",
      "storageArea": "Tea Shelf",
      "lockedObject": "Tea Cabinet",
      "witnessArea": "Dining Nook",
      "witnessRole": "barista",
      "waterFeature": "kettle station"
    },
    "sceneImage": "/case-scenes/missing-tea-tin.webp",
    "sceneImageAlt": "Scene photo for The Missing Tea Tin"
  },
  {
    "id": "looted-market-cart",
    "title": "The Looted Market Cart",
    "shortStory": "A market cart was raided before the morning rush.",
    "crimeIcon": "🛒",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Market Cart",
      "traceArea": "Cobblestone Lane",
      "storageArea": "Crate Rack",
      "lockedObject": "Coin Drawer",
      "witnessArea": "Awning Post",
      "witnessRole": "merchant",
      "waterFeature": "produce tub"
    },
    "sceneImage": "/case-scenes/looted-market-cart.webp",
    "sceneImageAlt": "Scene photo for The Looted Market Cart"
  },
  {
    "id": "stolen-camp-badge",
    "title": "The Stolen Camp Badge",
    "shortStory": "A camp leader's badge disappeared from the notice board.",
    "crimeIcon": "🏕️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Camp Office",
      "traceArea": "Cabin Trail",
      "storageArea": "Notice Board",
      "lockedObject": "Badge Box",
      "witnessArea": "Fire Circle",
      "witnessRole": "camp leader",
      "waterFeature": "wash bucket"
    },
    "sceneImage": "/case-scenes/stolen-camp-badge.jpg",
    "sceneImageAlt": "Scene photo for The Stolen Camp Badge"
  },
  {
    "id": "cracked-fountain-box",
    "title": "The Cracked Fountain Box",
    "shortStory": "The donation box beside the fountain was found cracked open.",
    "crimeIcon": "⛲",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Fountain Plaza",
      "traceArea": "Wet Stone Path",
      "storageArea": "Bench Nook",
      "lockedObject": "Donation Box",
      "witnessArea": "Plaza Kiosk",
      "witnessRole": "groundskeeper",
      "waterFeature": "fountain edge"
    },
    "sceneImage": "/case-scenes/cracked-fountain-box.jpg",
    "sceneImageAlt": "Scene photo for The Cracked Fountain Box"
  },
  {
    "id": "missing-ship-log",
    "title": "The Missing Ship Log",
    "shortStory": "A ship log vanished from the harbor master's office.",
    "crimeIcon": "⚓",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Harbor Office",
      "traceArea": "Gangway",
      "storageArea": "Log Shelf",
      "lockedObject": "Chart Cabinet",
      "witnessArea": "Dock Gate",
      "witnessRole": "harbor master",
      "waterFeature": "dock puddle"
    },
    "sceneImage": "/case-scenes/missing-ship-log.jpg",
    "sceneImageAlt": "Scene photo for The Missing Ship Log"
  },
  {
    "id": "raided-archive-drawer",
    "title": "The Raided Archive Drawer",
    "shortStory": "A sealed archive drawer was opened and a record removed.",
    "crimeIcon": "🗄️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Archive Room",
      "traceArea": "Record Aisle",
      "storageArea": "Document Shelf",
      "lockedObject": "Archive Drawer",
      "witnessArea": "Reading Desk",
      "witnessRole": "archivist",
      "waterFeature": "humidifier tray"
    },
    "sceneImage": "/case-scenes/raided-archive-drawer.jpg",
    "sceneImageAlt": "Scene photo for The Raided Archive Drawer"
  },
  {
    "id": "stolen-circus-banner",
    "title": "The Stolen Circus Banner",
    "shortStory": "The circus banner vanished before the opening parade.",
    "crimeIcon": "🎪",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Circus Tent",
      "traceArea": "Ring Floor",
      "storageArea": "Banner Rack",
      "lockedObject": "Costume Chest",
      "witnessArea": "Ticket Wagon",
      "witnessRole": "ringmaster",
      "waterFeature": "animal trough"
    },
    "sceneImage": "/case-scenes/stolen-circus-banner.webp",
    "sceneImageAlt": "Scene photo for The Stolen Circus Banner"
  },
  {
    "id": "empty-orchard-crate",
    "title": "The Empty Orchard Crate",
    "shortStory": "A crate of perfect apples vanished from the orchard shed.",
    "crimeIcon": "🍎",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Orchard Shed",
      "traceArea": "Tree Row",
      "storageArea": "Apple Crate",
      "lockedObject": "Cold Box",
      "witnessArea": "Farm Gate",
      "witnessRole": "orchard keeper",
      "waterFeature": "irrigation ditch"
    },
    "sceneImage": "/case-scenes/empty-orchard-crate.webp",
    "sceneImageAlt": "Scene photo for The Empty Orchard Crate"
  },
  {
    "id": "broken-lighthouse-lens",
    "title": "The Broken Lighthouse Lens",
    "shortStory": "A spare lighthouse lens was damaged and moved from its case.",
    "crimeIcon": "🛟",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Lighthouse Entry",
      "traceArea": "Stone Stair",
      "storageArea": "Lens Shelf",
      "lockedObject": "Lens Case",
      "witnessArea": "Keeper Room",
      "witnessRole": "lighthouse keeper",
      "waterFeature": "seawater pail"
    },
    "sceneImage": "/case-scenes/broken-lighthouse-lens.webp",
    "sceneImageAlt": "Scene photo for The Broken Lighthouse Lens"
  },
  {
    "id": "missing-mining-tools",
    "title": "The Missing Mining Tools",
    "shortStory": "A set of mining tools disappeared from the quarry shed.",
    "crimeIcon": "⛏️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Quarry Shed",
      "traceArea": "Gravel Track",
      "storageArea": "Tool Rack",
      "lockedObject": "Supply Locker",
      "witnessArea": "Foreman Hut",
      "witnessRole": "foreman",
      "waterFeature": "sluice trough"
    },
    "sceneImage": "/case-scenes/missing-mining-tools.webp",
    "sceneImageAlt": "Scene photo for The Missing Mining Tools"
  },
  {
    "id": "ransacked-art-room",
    "title": "The Ransacked Art Room",
    "shortStory": "A rare paint box vanished from the school art room.",
    "crimeIcon": "🎨",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Art Room",
      "traceArea": "Paint Table",
      "storageArea": "Canvas Shelf",
      "lockedObject": "Supply Cabinet",
      "witnessArea": "Classroom Door",
      "witnessRole": "teacher",
      "waterFeature": "brush cup"
    },
    "sceneImage": "/case-scenes/ransacked-art-room.jpg",
    "sceneImageAlt": "Scene photo for The Ransacked Art Room"
  },
  {
    "id": "stolen-picnic-basket",
    "title": "The Stolen Picnic Basket",
    "shortStory": "A picnic basket vanished from the park pavilion.",
    "crimeIcon": "🧺",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Park Pavilion",
      "traceArea": "Grass Path",
      "storageArea": "Bench Shelf",
      "lockedObject": "Cooler Box",
      "witnessArea": "Picnic Table",
      "witnessRole": "park guest",
      "waterFeature": "drinking fountain"
    },
    "sceneImage": "/case-scenes/stolen-picnic-basket.webp",
    "sceneImageAlt": "Scene photo for The Stolen Picnic Basket"
  },
  {
    "id": "missing-courtyard-statue",
    "title": "The Missing Courtyard Statue",
    "shortStory": "A small statue disappeared from the academy courtyard.",
    "crimeIcon": "🗿",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Academy Courtyard",
      "traceArea": "Stone Walk",
      "storageArea": "Plaque Stand",
      "lockedObject": "Display Plinth",
      "witnessArea": "Lecture Hall",
      "witnessRole": "student",
      "waterFeature": "courtyard fountain"
    },
    "sceneImage": "/case-scenes/missing-courtyard-statue.webp",
    "sceneImageAlt": "Scene photo for The Missing Courtyard Statue"
  },
  {
    "id": "pilfered-lab-sample",
    "title": "The Pilfered Lab Sample",
    "shortStory": "A sealed lab sample disappeared from the research bench.",
    "crimeIcon": "🧪",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Research Lab",
      "traceArea": "Lab Counter",
      "storageArea": "Sample Shelf",
      "lockedObject": "Specimen Fridge",
      "witnessArea": "Observation Room",
      "witnessRole": "researcher",
      "waterFeature": "rinse station"
    },
    "sceneImage": "/case-scenes/pilfered-lab-sample.webp",
    "sceneImageAlt": "Scene photo for The Pilfered Lab Sample"
  },
  {
    "id": "tampered-radio-booth",
    "title": "The Tampered Radio Booth",
    "shortStory": "A broadcast booth was disturbed during a late-night show.",
    "crimeIcon": "🎙️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Radio Booth",
      "traceArea": "Studio Floor",
      "storageArea": "Record Shelf",
      "lockedObject": "Mixer Panel",
      "witnessArea": "Producer Desk",
      "witnessRole": "host",
      "waterFeature": "water glass"
    },
    "sceneImage": "/case-scenes/tampered-radio-booth.webp",
    "sceneImageAlt": "Scene photo for The Tampered Radio Booth"
  },
  {
    "id": "missing-inn-register",
    "title": "The Missing Inn Register",
    "shortStory": "The inn's guest register vanished from the front desk.",
    "crimeIcon": "🏨",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Inn Lobby",
      "traceArea": "Front Hall",
      "storageArea": "Key Shelf",
      "lockedObject": "Register Drawer",
      "witnessArea": "Reception Desk",
      "witnessRole": "innkeeper",
      "waterFeature": "tea tray"
    },
    "sceneImage": "/case-scenes/missing-inn-register.webp",
    "sceneImageAlt": "Scene photo for The Missing Inn Register"
  },
  {
    "id": "ransacked-flower-cart",
    "title": "The Ransacked Flower Cart",
    "shortStory": "A flower cart was overturned and its rare blooms taken.",
    "crimeIcon": "💐",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Flower Cart",
      "traceArea": "Garden Lane",
      "storageArea": "Bloom Crate",
      "lockedObject": "Cash Tin",
      "witnessArea": "Street Corner",
      "witnessRole": "flower seller",
      "waterFeature": "flower bucket"
    },
    "sceneImage": "/case-scenes/ransacked-flower-cart.webp",
    "sceneImageAlt": "Scene photo for The Ransacked Flower Cart"
  },
  {
    "id": "stolen-wind-chime",
    "title": "The Stolen Wind Chime",
    "shortStory": "A handmade wind chime disappeared from a porch display.",
    "crimeIcon": "🎐",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Porch Display",
      "traceArea": "Wooden Deck",
      "storageArea": "Craft Shelf",
      "lockedObject": "Display Hook",
      "witnessArea": "Workshop Door",
      "witnessRole": "artisan",
      "waterFeature": "rain bowl"
    },
    "sceneImage": "/case-scenes/stolen-wind-chime.webp",
    "sceneImageAlt": "Scene photo for The Stolen Wind Chime"
  },
  {
    "id": "disturbed-ranger-cache",
    "title": "The Disturbed Ranger Cache",
    "shortStory": "A ranger supply cache was opened and emergency gear removed.",
    "crimeIcon": "🎒",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Forest Cache",
      "traceArea": "Trail Bend",
      "storageArea": "Supply Shelf",
      "lockedObject": "Emergency Box",
      "witnessArea": "Trail Post",
      "witnessRole": "trail ranger",
      "waterFeature": "stream crossing"
    },
    "sceneImage": "/case-scenes/disturbed-ranger-cache.webp",
    "sceneImageAlt": "Scene photo for The Disturbed Ranger Cache"
  },
  {
    "id": "missing-ferry-token",
    "title": "The Missing Ferry Token",
    "shortStory": "A ferry token was stolen from the dock office drawer.",
    "crimeIcon": "⛴️",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Dock Office",
      "traceArea": "Boardwalk",
      "storageArea": "Ticket Shelf",
      "lockedObject": "Token Drawer",
      "witnessArea": "Ferry Gate",
      "witnessRole": "deckhand",
      "waterFeature": "harbor edge"
    },
    "sceneImage": "/case-scenes/missing-ferry-token.jpg",
    "sceneImageAlt": "Scene photo for The Missing Ferry Token"
  },
  {
    "id": "raided-candy-counter",
    "title": "The Raided Candy Counter",
    "shortStory": "A candy counter was raided and the rarest sweets disappeared.",
    "crimeIcon": "🍬",
    "difficulty": "easy",
    "maxInvestigations": 5,
    "template": {
      "area": "Candy Counter",
      "traceArea": "Shop Floor",
      "storageArea": "Sweet Shelf",
      "lockedObject": "Treat Case",
      "witnessArea": "Checkout Desk",
      "witnessRole": "shopkeeper",
      "waterFeature": "syrup sink"
    },
    "sceneImage": "/case-scenes/raided-candy-counter.jpg",
    "sceneImageAlt": "Scene photo for The Raided Candy Counter"
  }
] satisfies RawCaseConfig[]
