import { useState, useEffect } from "react"
import { useGarden } from "./GardenContext"

// iNaturalist scientific name hints for plants where common name is ambiguous
const INAT_NAME = {
  "Pak Choi":                    "brassica rapa chinensis",
  "Jerusalem Artichoke":         "helianthus tuberosus",
  "Swiss Chard":                 "beta vulgaris cicla",
  "Sweetcorn":                   "zea mays",
  "Butternut Squash":            "cucurbita moschata",
  "Sugar Snap Peas":             "pisum sativum",
  "Runner Beans":                "phaseolus coccineus",
  "French Beans":                "phaseolus vulgaris",
  "Broad Beans":                 "vicia faba",
  "Savoy Cabbage":               "brassica oleracea sabauda",
  "Dwarf Apple":                 "malus domestica",
  "Dwarf Pear":                  "pyrus communis",
  "Container Lemon":             "citrus limon",
  "Container Lime":              "citrus aurantiifolia",
  "Container Orange":            "citrus sinensis",
  "Red Currants":                "ribes rubrum",
  "Black Currants":              "ribes nigrum",
  "Goji Berries":                "lycium barbarum",
  "Physalis":                    "physalis peruviana",
  "Holy Basil / Tulsi":          "ocimum tenuiflorum",
  "Thai Basil":                  "ocimum basilicum",
  "Lemon Balm":                  "melissa officinalis",
  "Bay Laurel":                  "laurus nobilis",
  "Garlic Chives":               "allium tuberosum",
  "Vietnamese Coriander":        "persicaria odorata",
  "Lemon Verbena":               "aloysia citrodora",
  "Catnip":                      "nepeta cataria",
  "Valerian":                    "valeriana officinalis",
  "Feverfew":                    "tanacetum parthenium",
  "Hyssop":                      "hyssopus officinalis",
  "Love in a Mist":              "nigella damascena",
  "Monarda / Bee Balm":          "monarda didyma",
  "Achillea / Yarrow":           "achillea millefolium",
  "Kniphofia / Red Hot Poker":   "kniphofia uvaria",
  "Stachys / Lamb's Ear":        "stachys byzantina",
  "Liatris / Blazing Star":      "liatris spicata",
  "Platycodon / Balloon Flower": "platycodon grandiflorus",
  "Echinops / Globe Thistle":    "echinops ritro",
  "Tithonia / Mexican Sunflower":"tithonia rotundifolia",
  "Cleome / Spider Flower":      "cleome hassleriana",
  "Aquilegia / Columbine":       "aquilegia vulgaris",
  "Digitalis (Foxglove)":        "digitalis purpurea",
  "Geranium (Hardy)":            "geranium pratense",
  "Begonia (Tuberous)":          "begonia",
  "Alliums":                     "allium giganteum",
  "Sweet Peas":                  "lathyrus odoratus",
  "Baby's Breath":               "gypsophila paniculata",
  "Statice":                     "limonium sinuatum",
  "Globe Amaranth":              "gomphrena globosa",
  "Lisianthus":                  "eustoma grandiflorum",
  "Nigella":                     "nigella damascena",
  "Scabiosa":                    "scabiosa columbaria",
  "Heuchera":                    "heuchera micrantha",
  "Erigeron":                    "erigeron karvinskianus",
  "Rudbeckia":                   "rudbeckia hirta",
  "Gaillardia":                  "gaillardia pulchella",
  "Helenium":                    "helenium autumnale",
  "Gerbera Daisy":               "gerbera jamesonii",
  "Agapanthus":                  "agapanthus africanus",
  "Catmint":                     "nepeta racemosa",
  "Veronicastrum":               "veronicastrum virginicum",
  "Thalictrum":                  "thalictrum aquilegiifolium",
  "Hollyhocks":                  "alcea rosea",
}

function plantSearchTerm(plant) {
  return INAT_NAME[plant.name] || plant.name.split(/\s*[/(]\s*/)[0].trim()
}

function useInatPhotos(plants) {
  const [photos, setPhotos] = useState(() => {
    const initial = {}
    for (const p of plants) {
      const v = sessionStorage.getItem(`inat_${p.name}`)
      if (v && v !== "err") initial[p.name] = v
    }
    return initial
  })

  useEffect(() => {
    let cancelled = false
    const toFetch = plants.filter(p => !sessionStorage.getItem(`inat_${p.name}`))
    if (!toFetch.length) return

    const CONCURRENCY = 6
    let idx = 0

    async function worker() {
      while (idx < toFetch.length) {
        if (cancelled) return
        const plant = toFetch[idx++]
        try {
          const q = encodeURIComponent(plantSearchTerm(plant))
          const r = await fetch(
            `https://api.inaturalist.org/v1/taxa?q=${q}&per_page=5&rank=species,subspecies,variety,form&iconic_taxa=Plantae&order_by=observations_count`
          )
          const d = await r.json()
          let url = ""
          for (const t of (d.results || [])) {
            if (t.default_photo?.medium_url) { url = t.default_photo.medium_url; break }
          }
          sessionStorage.setItem(`inat_${plant.name}`, url || "err")
          if (url && !cancelled) setPhotos(prev => ({ ...prev, [plant.name]: url }))
        } catch {
          sessionStorage.setItem(`inat_${plant.name}`, "err")
        }
      }
    }

    Promise.all(Array.from({ length: CONCURRENCY }, worker))
    return () => { cancelled = true }
  }, [])

  return photos
}

const plants = [
  // ── VEGETABLES ──────────────────────────────────────────────────────────────
  { id:1,   name:"Cherry Tomatoes",     category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–80 days",        tip:"Water at the base, not the leaves. Compost tea once a fortnight beats any synthetic fertilizer." },
  { id:2,   name:"Beefsteak Tomatoes",  category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"80–90 days",        tip:"Remove side shoots (suckers) weekly. Stake early — heavy fruit will topple an unsupported plant." },
  { id:3,   name:"Lettuce",             category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"30–45 days",        tip:"Cut leaves from the outside and the plant keeps growing for weeks. No fertilizer needed in good compost." },
  { id:4,   name:"Spinach",             category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"40–50 days",        tip:"Grows best in cool weather. Diluted fish emulsion every 2 weeks gives a natural nitrogen boost." },
  { id:5,   name:"Kale",                category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"55–75 days",        tip:"Frost sweetens the flavour. Harvest outer leaves first. One of the easiest brassicas to grow organically." },
  { id:6,   name:"Arugula",             category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"21–40 days",        tip:"Cut-and-come-again at 5 cm height. Spicy flavour intensifies with maturity and heat." },
  { id:7,   name:"Swiss Chard",         category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–60 days",        tip:"Harvest outer stalks so the centre keeps producing. Colourful stems make it a garden showpiece too." },
  { id:8,   name:"Spinach (Baby)",      category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"25–30 days",        tip:"Sow thickly and harvest as microgreens or thin to full plants. Succession sow every 3 weeks." },
  { id:9,   name:"Pak Choi",            category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"45–60 days",        tip:"Best grown in autumn — bolts in summer heat. Slug-resistant compared to other brassicas." },
  { id:10,  name:"Cabbage",             category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"70–120 days",       tip:"Net against cabbage white butterfly — the organic alternative to pesticides. Firm soil well before planting." },
  { id:11,  name:"Savoy Cabbage",       category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"80–100 days",       tip:"More frost-tolerant than regular cabbage. Crinkled leaves are harder for pests to grip." },
  { id:12,  name:"Brussels Sprouts",    category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"90–120 days",       tip:"Firm planting prevents rocking in wind which causes loose sprouts. Harvest from the bottom up." },
  { id:13,  name:"Broccoli",            category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Moderate", harvest:"70–100 days",       tip:"After cutting the main head, side shoots keep producing for weeks. Net against butterflies." },
  { id:14,  name:"Cauliflower",         category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"70–120 days",       tip:"Tie leaves over the curd when it forms to keep it white. Needs consistent moisture — drying causes stress." },
  { id:15,  name:"Radishes",            category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"25–30 days",        tip:"One of the fastest vegetables. Thinning is essential — crowded radishes go woody and hot." },
  { id:16,  name:"Beetroot",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–90 days",        tip:"The leaves are edible too — eat them like spinach. Twist off rather than cut to avoid bleeding." },
  { id:17,  name:"Carrots",             category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"70–80 days",        tip:"Deep, loose, stone-free soil prevents forking. Sow thinly — thinning attracts carrot fly." },
  { id:18,  name:"Parsnips",            category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"100–120 days",      tip:"Frost converts starch to sugar — best harvested after the first frost. Slow to germinate; mark the row." },
  { id:19,  name:"Turnips",             category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"40–60 days",        tip:"Harvest small (golf ball size) for best flavour. Greens are edible and nutritious too." },
  { id:20,  name:"Kohlrabi",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"45–60 days",        tip:"Harvest when the swollen stem is 5–7 cm wide — bigger gets woody. Both leaves and bulb are edible." },
  { id:21,  name:"Sweet Potatoes",      category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"90–120 days",       tip:"Needs warmth — grow through black plastic mulch to retain heat. Trailing vines look beautiful." },
  { id:22,  name:"Potatoes",            category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"70–120 days",       tip:"Earth up stems as they grow to increase yield. Harvest when the flowers die back." },
  { id:23,  name:"Jerusalem Artichoke", category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Autumn",            tip:"Almost too easy — can become invasive. Grow in a container to control spread. Nutty, sweet flavour." },
  { id:24,  name:"Asparagus",           category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"Year 3+",           tip:"A long-term investment — do not harvest in years 1 or 2. Once established, produces for 20+ years." },
  { id:25,  name:"Cucumber",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"50–70 days",        tip:"Needs a trellis or support. Irregular watering causes bitterness — keep consistently moist." },
  { id:26,  name:"Zucchini",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–65 days",        tip:"One plant is usually enough — they're prolific. Harvest small for best taste; large zucchinis go watery." },
  { id:27,  name:"Pumpkin",             category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"90–110 days",       tip:"Each vine needs 1–2 m² of space. Pollinate by hand with a paintbrush if bees are scarce." },
  { id:28,  name:"Butternut Squash",    category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"80–100 days",       tip:"Cure harvested squash in a warm spot for 10 days to harden the skin for long storage." },
  { id:29,  name:"Eggplant",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"70–85 days",        tip:"Loves heat. Start indoors 8 weeks before last frost. Harvest before the skin loses its shine." },
  { id:30,  name:"Bell Peppers",        category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"70–90 days",        tip:"Let green peppers ripen to red, yellow, or orange for sweeter flavour and more vitamins." },
  { id:31,  name:"Chili Peppers",       category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"70–90 days",        tip:"Water stress increases capsaicin (heat). Companion plant with basil to deter aphids naturally." },
  { id:32,  name:"Jalapeño",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"70–85 days",        tip:"One of the easiest chilis to grow. Harvest green or let ripen red for a sweeter, hotter flavour." },
  { id:33,  name:"Sweetcorn",           category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"70–90 days",        tip:"Plant in blocks not rows — corn is wind-pollinated and needs neighbours. Eat within hours of picking." },
  { id:34,  name:"Okra",                category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"55–65 days",        tip:"Harvest pods when 7–10 cm — older pods become fibrous. Likes heat; great for warm climates." },
  { id:35,  name:"Peas",                category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–70 days",        tip:"Fix nitrogen into the soil — great companion plant. Pick frequently to encourage more pods." },
  { id:36,  name:"Sugar Snap Peas",     category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–70 days",        tip:"Eat pod and all — sweetest right off the vine. Needs support; even a few twigs helps." },
  { id:37,  name:"Runner Beans",        category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"60–70 days",        tip:"Flowers are edible too. Pick regularly to prevent stringy pods and keep the plant producing." },
  { id:38,  name:"French Beans",        category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–60 days",        tip:"Dwarf varieties need no support — ideal for containers. Harvest young before seeds swell." },
  { id:39,  name:"Broad Beans",         category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"80–90 days",        tip:"Plant in autumn for the best harvest. Pinch out growing tips once in flower to deter blackfly." },
  { id:40,  name:"Edamame",             category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"70–80 days",        tip:"Harvest when pods feel plump but still bright green. Boil in salted water for 5 minutes." },
  { id:41,  name:"Celery",              category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Hard",     harvest:"85–120 days",       tip:"Needs consistent moisture and feeding. Blanch stems with cardboard for milder flavour." },
  { id:42,  name:"Fennel",              category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"65–90 days",        tip:"Keep away from tomatoes and beans — fennel inhibits their growth. Bronze fennel is ornamental too." },
  { id:43,  name:"Leeks",               category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"120–150 days",      tip:"Start indoors and transplant when pencil-thick. Drop into deep holes — no backfilling needed." },
  { id:44,  name:"Onions",              category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"100–120 days",      tip:"Harvest when tops fall over naturally. Cure in the sun for 2 weeks before storing." },
  { id:45,  name:"Red Onions",          category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"100–120 days",      tip:"Milder and sweeter than white onions. Grow from sets for easiest results." },
  { id:46,  name:"Shallots",            category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"90–100 days",       tip:"Each planted bulb multiplies into a cluster of 8–12. Gourmet flavour with minimal effort." },
  { id:47,  name:"Spring Onions",       category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"8 weeks",           tip:"Regrow from the white root end in a glass of water on a windowsill — completely zero waste." },
  { id:48,  name:"Garlic",              category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"9 months",          tip:"Plant cloves in autumn, harvest in summer. Natural antifungal — great companion for roses." },
  { id:49,  name:"Microgreens",         category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor",              difficulty:"Easy",     harvest:"7–14 days",         tip:"Grow in shallow trays on a windowsill year-round. Harvest with scissors just above the soil." },
  { id:50,  name:"Watercress",          category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"30–40 days",        tip:"Keep roots in shallow water — watercress is semi-aquatic. One of the most nutrient-dense greens." },
  { id:51,  name:"Endive",              category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"85–100 days",       tip:"Blanch by covering with a plate for 2 weeks before harvest to reduce bitterness." },
  { id:52,  name:"Radicchio",           category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"80–90 days",        tip:"Cut plants down in late summer — they regrow as beautiful red and white headed chicory." },

  // ── FRUITS ──────────────────────────────────────────────────────────────────
  { id:60,  name:"Strawberries",        category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"60–90 days",        tip:"Mulch with straw to retain moisture and prevent fungal disease. Remove runners unless propagating." },
  { id:61,  name:"Blueberries",         category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Hard",     harvest:"2–3 years to fruit",tip:"Needs acidic soil (pH 4.5–5.5). Use ericaceous compost. Plant two varieties for better pollination." },
  { id:62,  name:"Raspberries",         category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Summer / Autumn",   tip:"Cut summer-fruiting canes to ground after harvest. Autumn varieties fruit on new growth." },
  { id:63,  name:"Blackberries",        category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late summer",       tip:"Thornless varieties are much easier to manage. They fruit on second-year canes — label them." },
  { id:64,  name:"Gooseberries",        category:"Edibles", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"June–July",         tip:"One of the easiest soft fruits. Prune to an open goblet shape for good air circulation." },
  { id:65,  name:"Red Currants",        category:"Edibles", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"July",              tip:"Incredibly productive. Can be trained flat against a fence to save space." },
  { id:66,  name:"Black Currants",      category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"July–August",       tip:"Fruit on one-year-old wood — remove one third of old stems each year after harvest." },
  { id:67,  name:"Goji Berries",        category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Year 2+",           tip:"Drought-tolerant once established. Harvest when berries are deep red." },
  { id:68,  name:"Figs",                category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Late summer",       tip:"Root restriction increases fruiting — grow in a container or line the planting pit with slabs." },
  { id:69,  name:"Grapes",              category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"September–October", tip:"Prune hard every winter. Thin grape clusters in summer for larger, sweeter individual fruits." },
  { id:70,  name:"Dwarf Apple",         category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"August–October",    tip:"M27 rootstock stays under 1.2 m — perfect for pots. Needs a pollination partner nearby." },
  { id:71,  name:"Dwarf Pear",          category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"August–October",    tip:"Quince A or C rootstock for containers. Pears need two varieties for cross-pollination." },
  { id:72,  name:"Container Lemon",     category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Moderate", harvest:"Year-round",        tip:"Bring inside before first frost. Feed with citrus fertilizer from spring to autumn." },
  { id:73,  name:"Container Lime",      category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Moderate", harvest:"Year-round",        tip:"Needs more warmth than lemon. Spray leaves with rainwater to prevent brown tips." },
  { id:74,  name:"Container Orange",    category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Moderate", harvest:"Winter–Spring",     tip:"Calamondin varieties are easiest indoors. Fruits are tart but great for marmalade." },
  { id:75,  name:"Avocado",             category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Backyard",   difficulty:"Hard",     harvest:"3–5 years",         tip:"Grow from a pit in water for a fun houseplant. Fruiting outdoors requires a frost-free climate." },
  { id:76,  name:"Passion Fruit",       category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"Year 2+",           tip:"Vigorous climber — give it a strong trellis. Hand-pollinate with a brush for a reliable set." },
  { id:77,  name:"Kiwi",                category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"Autumn, year 3+",   tip:"Need one male for every 6 female plants. 'Jenny' is self-fertile if space is limited." },
  { id:78,  name:"Physalis",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"75–85 days",        tip:"Fruits are ripe when the papery husk turns golden. Self-seeds freely." },
  { id:79,  name:"Pomegranate",         category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"Year 3+",           tip:"Drought-tolerant once established. Dwarf varieties fruit well in large pots." },
  { id:80,  name:"Elderberries",        category:"Edibles", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Late summer",       tip:"Flowers and berries both useable. Never eat raw berries — always cook them." },

  // ── HERBS ────────────────────────────────────────────────────────────────────
  { id:90,  name:"Basil",               category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"25–35 days",        tip:"Pinch off flower buds to keep leaves growing. Neem oil spray works great for aphids." },
  { id:91,  name:"Mint",                category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"30–40 days",        tip:"Grow in a separate pot — spreads aggressively. Naturally repels pests." },
  { id:92,  name:"Rosemary",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Drought-tolerant once established. Never overwater — prefers dry, well-draining soil." },
  { id:93,  name:"Thyme",               category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Harvest before flowering for best flavour. A natural antiseptic — no chemical sprays needed." },
  { id:94,  name:"Cilantro",            category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"20–30 days",        tip:"Bolts quickly in heat — grow in cool weather or light shade. Succession sow every 2 weeks." },
  { id:95,  name:"Parsley",             category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"70–90 days",        tip:"Slow to germinate — soak seeds in warm water overnight to speed things up." },
  { id:96,  name:"Chives",              category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"30 days",           tip:"Cut 2 cm above the soil and they regrow endlessly. Great companion plant." },
  { id:97,  name:"Dill",                category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"40–60 days",        tip:"Harvest feathery leaves before flowering. Attracts beneficial insects like lacewings." },
  { id:98,  name:"Sage",                category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Cut back hard after flowering to keep bushy. Purple sage is ornamental too." },
  { id:99,  name:"Oregano",             category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Flavour intensifies in dry conditions — under-watered oregano actually tastes better." },
  { id:100, name:"Tarragon",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"French tarragon (not Russian) has the best flavour. Divide clumps every 2–3 years." },
  { id:101, name:"Lemongrass",          category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"3–4 months",        tip:"Naturally repels mosquitoes. Bring indoors over winter in cooler climates." },
  { id:102, name:"Lemon Balm",          category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Spreads like mint — grow in a pot. Calming tea plant; rub leaves for an instant lemon scent." },
  { id:103, name:"Ginger",              category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Moderate", harvest:"8–10 months",       tip:"Plant a shop-bought knob in spring. Keep warm and moist. Harvest in autumn when leaves yellow." },
  { id:104, name:"Turmeric",            category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Moderate", harvest:"8–10 months",       tip:"Grow exactly like ginger. The bright orange rhizomes are a bonus — rinse and grate fresh." },
  { id:105, name:"Bay Laurel",          category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Slow-growing but long-lived — a bay tree can last decades. Clip into a lollipop shape." },
  { id:106, name:"Marjoram",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Sweeter and more delicate than oregano. Dry bunches upside down for intensified flavour." },
  { id:107, name:"Sorrel",              category:"Edibles", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"One of the earliest spring greens. Lemony flavour; add raw to salads." },
  { id:108, name:"Stevia",              category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Leaves are 200× sweeter than sugar. Dry and crumble as a natural zero-calorie sweetener." },
  { id:109, name:"Holy Basil / Tulsi",  category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Sacred in Ayurvedic tradition. Stronger, clove-like flavour vs sweet basil. Makes excellent tea." },
  { id:110, name:"Thai Basil",          category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"25–35 days",        tip:"More heat-tolerant than Italian basil and holds up in cooked dishes without losing flavour." },
  { id:111, name:"Borage",              category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–60 days",        tip:"Edible blue star flowers taste like cucumber. Attracts bees powerfully." },
  { id:112, name:"Lemon Verbena",       category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Intensely lemony — one leaf perfumes a whole room. Deciduous; don't panic when it drops leaves." },
  { id:113, name:"Chervil",             category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"40–50 days",        tip:"Anise-flavoured and feathery. Add raw at the end of cooking — heat destroys its delicate taste." },
  { id:114, name:"Lovage",              category:"Edibles", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Year 2+",           tip:"Giant perennial herb — can reach 2 m. Tastes like celery; use leaves, seeds, and stems." },
  { id:115, name:"Hyssop",              category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Aromatic and medicinal. Blue flowers attract bees. Good companion for cabbages." },
  { id:116, name:"Catnip",              category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Repels mosquitoes and aphids. If you have cats, grow in a pot they can't reach." },
  { id:117, name:"Valerian",            category:"Edibles", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Year 2",            tip:"Roots are used as a natural sleep aid. Attracts earthworms — a sign of great garden health." },
  { id:118, name:"Feverfew",            category:"Edibles", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Harvest anytime",   tip:"White daisy-like flowers. Self-seeds prolifically. Traditionally used for headache relief." },
  { id:119, name:"Vietnamese Coriander",category:"Edibles", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Doesn't bolt like regular coriander. Perfect for Asian dishes. Pinch tips to keep bushy." },
  { id:120, name:"Garlic Chives",       category:"Edibles", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Harvest anytime",   tip:"Flat leaves taste of mild garlic. White flowers are edible and pretty." },

  // ── FLOWERS ──────────────────────────────────────────────────────────────────
  { id:200, name:"Marigolds",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"45–50 days to bloom",  tip:"Plant near vegetables to naturally repel whiteflies and nematodes. Zero chemicals needed." },
  { id:201, name:"Lavender",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"90–100 days to bloom", tip:"Avoid overwatering — thrives in dry soil. Great natural pest deterrent when dried." },
  { id:202, name:"Sunflowers",          category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"70–100 days to bloom", tip:"Plant in well-draining soil. Attract pollinators powerfully. Dwarf varieties suit containers." },
  { id:203, name:"Roses",               category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Moderate", harvest:"6–8 weeks to bloom",   tip:"Plant garlic nearby to deter aphids naturally. Mulch heavily to retain moisture." },
  { id:204, name:"Pansies",             category:"Flowers", sun:"Partial Sun 🌤️",  location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"8–10 weeks to bloom",  tip:"Edible flowers! Perfect for cool weather — they fade in summer heat. Deadhead to prolong blooming." },
  { id:205, name:"Zinnias",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–70 days to bloom",  tip:"Direct sow after frost. Cutting flowers encourages more blooms." },
  { id:206, name:"Dahlias",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Moderate", harvest:"8 weeks to bloom",     tip:"Pinch the main stem at 30 cm to encourage bushier growth and more flowers." },
  { id:207, name:"Nasturtiums",         category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"35–52 days to bloom",  tip:"Both flowers and leaves are edible with a peppery taste. Thrives in poor soil." },
  { id:208, name:"Chamomile",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60 days to bloom",     tip:"Harvest flowers when fully open and dry them for tea. Self-seeds freely." },
  { id:209, name:"Calendula",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"45–60 days to bloom",  tip:"Edible petals great in salads. Companion plant that deters tomato hornworm naturally." },
  { id:210, name:"Cosmos",              category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"7–8 weeks to bloom",   tip:"Thrives in poor, dry soil — over-fertilizing causes leaves over flowers. Self-seeds year after year." },
  { id:211, name:"Hibiscus",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"2–3 months to bloom",  tip:"Flowers are edible — used in teas and jams. Keep consistently moist and feed with potassium." },
  { id:212, name:"Snapdragons",         category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"8–12 weeks to bloom",  tip:"Prefer cool weather. Pinch growing tips when young to encourage more flower spikes." },
  { id:213, name:"Sweet Peas",          category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"12–16 weeks to bloom", tip:"Soak seeds overnight before planting. Pick flowers regularly to extend blooming." },
  { id:214, name:"Echinacea",           category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"2nd year to bloom",    tip:"Drought tolerant once established. Leave seed heads in winter — birds love them." },
  { id:215, name:"Poppies",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"60–90 days to bloom",  tip:"Direct sow in autumn or early spring — they need a cold period to germinate. Never transplant." },
  { id:216, name:"Cornflowers",         category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"65–75 days to bloom",  tip:"Edible blue flowers loved by bees. Direct sow in autumn for early colour." },
  { id:217, name:"Foxgloves",           category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Year 2 to bloom",      tip:"Biennial — flowers in the second year. Toxic to humans and pets; handle with gloves." },
  { id:218, name:"Hollyhocks",          category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Year 2 to bloom",      tip:"Tall and dramatic against walls or fences. Edible flowers; petals make a natural blue-black dye." },
  { id:219, name:"Delphiniums",         category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"70–90 days to bloom",  tip:"Needs staking in wind. Cut spent spikes to the base for a second flush of blooms." },
  { id:220, name:"Lupins",              category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Moderate", harvest:"Year 2 to bloom",      tip:"Fix nitrogen into the soil — excellent for garden health. Deadhead promptly." },
  { id:221, name:"Verbena",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"8–10 weeks to bloom",  tip:"Drought tolerant once established. Attracts butterflies. Cut back mid-summer for a second flush." },
  { id:222, name:"Salvia",              category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"70–90 days to bloom",  tip:"Pollinator magnet — bumblebees adore it. Annual salvias bloom all summer without deadheading." },
  { id:223, name:"Alyssum",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"45–60 days to bloom",  tip:"Honey-scented white flowers. Attracts hoverflies that eat aphids — brilliant companion plant." },
  { id:224, name:"Celosia",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–80 days to bloom",  tip:"Fascinating velvet or feathery flower heads. Loves heat and humidity — keep well watered." },
  { id:225, name:"Portulaca",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–60 days to bloom",  tip:"Thrives in hot, dry conditions where other plants fail. Flowers close at night." },
  { id:226, name:"Scabiosa",            category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"70–90 days to bloom",  tip:"A magnet for bees and butterflies. Deadhead regularly for non-stop flowering all summer." },
  { id:227, name:"Love in a Mist",      category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"50–65 days to bloom",  tip:"Direct sow in autumn or spring. Unusual inflated seed pods are great for dried arrangements." },
  { id:228, name:"Nicotiana",           category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"60–80 days to bloom",  tip:"Intensely fragrant especially in the evening. Attracts moths as pollinators." },
  { id:229, name:"Strawflower",         category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–80 days to bloom",  tip:"Papery petals retain colour when dried — perfect for wreaths and arrangements year-round." },
  { id:230, name:"Morning Glory",       category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"60–70 days to bloom",  tip:"Fast-growing climber — provides quick shade and privacy. Flowers open in morning light only." },
  { id:231, name:"Bougainvillea",       category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Moderate", harvest:"Year 2+",              tip:"The colourful 'petals' are actually bracts. Needs root restriction to bloom." },
  { id:232, name:"Clematis",            category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Moderate", harvest:"Year 2 to bloom",      tip:"Heads in the sun, roots in the shade. Mulch the base to keep roots cool." },
  { id:233, name:"Jasmine",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"Summer to autumn",     tip:"One of the most fragrant climbers. Prune after flowering to keep in check." },
  { id:234, name:"Honeysuckle",         category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Summer",               tip:"Intensely fragrant, especially in the evening. Brilliant for wildlife." },
  { id:235, name:"Wisteria",            category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Hard",     harvest:"Year 3–7 to bloom",    tip:"Train and prune twice a year (summer and winter). Once it blooms, the spectacle is worth the wait." },
  { id:236, name:"Hydrangea",           category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Mid–late summer",      tip:"Change flower colour with soil pH — acidic for blue, alkaline for pink." },
  { id:237, name:"Lilac",               category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Spring",               tip:"One of the most intoxicating scents in the garden. Deadhead promptly to encourage next year's buds." },
  { id:238, name:"Azalea",              category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Moderate", harvest:"Spring",               tip:"Needs acidic soil (pH 5.5–6.0). Use rainwater for watering — tap water is often too alkaline." },
  { id:239, name:"Camellia",            category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Moderate", harvest:"Winter–Spring",        tip:"Flowers in the depths of winter — a rare treat. Protect from morning frost which damages buds." },
  { id:240, name:"Forsythia",           category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Early spring",         tip:"One of the first flowers of spring. Prune immediately after flowering." },
  { id:241, name:"Buddleja",            category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Summer–Autumn",        tip:"Cut back hard in spring for the best flowering. Literally called butterfly bush." },
  { id:242, name:"Tulips",              category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Spring",               tip:"Plant bulbs in autumn, pointy end up. Lifting and storing bulbs gives more reliable blooms." },
  { id:243, name:"Daffodils",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Spring",               tip:"Never cut the leaves — they feed the bulb for next year. Naturalise in grass for a wild look." },
  { id:244, name:"Crocuses",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Late winter–Spring",   tip:"Among the first flowers of the year. Plant in autumn in drifts for best effect." },
  { id:245, name:"Hyacinths",           category:"Flowers", sun:"Full Sun ☀️",     location:"Indoor / Balcony",    difficulty:"Easy",     harvest:"Spring",               tip:"Incredibly fragrant — one bulb fills a room. Force indoors in water-filled glass vases in autumn." },
  { id:246, name:"Alliums",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late spring",          tip:"Architectural purple globe flowers. Naturalise well and come back year after year stronger." },
  { id:247, name:"Gladiolus",           category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Moderate", harvest:"Summer",               tip:"Plant corms in succession 2 weeks apart for continuous blooms. Lift in autumn in cold climates." },
  { id:248, name:"Lilies",              category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Summer",               tip:"Plant with the tip 15 cm deep. Watch for the scarlet lily beetle — pick off by hand." },
  { id:249, name:"Iris",                category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late spring",          tip:"Plant rhizomes with the top half above soil — they need sun to bake. Divide every 3–4 years." },
  { id:250, name:"Peonies",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late spring",          tip:"Plant with the eyes no more than 2–5 cm below the surface — too deep and they won't flower." },
  { id:251, name:"Chrysanthemums",      category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Autumn",               tip:"Pinch growing tips in early summer for a bushy plant with more flowers." },
  { id:252, name:"Ranunculus",          category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Spring",               tip:"Plant claw-like corms with the claws pointing downward. Prefers cool weather." },
  { id:253, name:"Anemones",            category:"Flowers", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Spring",               tip:"Soak corms in water for a few hours before planting. 'De Caen' variety is easiest." },
  { id:254, name:"Baby's Breath",       category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"65–75 days to bloom",  tip:"Perfect filler for bouquets. Prefers alkaline soil. Drought tolerant." },
  { id:255, name:"Asters",              category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late summer–Autumn",   tip:"One of the last flowers of the season — vital for late pollinators. Divide clumps every 2–3 years." },
  { id:256, name:"Rudbeckia",           category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"Mid–late summer",      tip:"Black-eyed Susan is almost indestructible. Deadhead for non-stop flowering or leave for birds." },
  { id:257, name:"Gaillardia",          category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"Mid summer",           tip:"Blanket flower thrives in heat and poor soil. More sun means more vibrant colour." },
  { id:258, name:"Helenium",            category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Late summer–Autumn",   tip:"Divide clumps every 3 years to keep them flowering vigorously. Bees go wild for them." },
  { id:259, name:"Gerbera Daisy",       category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"10–14 weeks to bloom", tip:"Don't bury the crown — it rots. Feed fortnightly for bold, long-lasting blooms." },
  { id:260, name:"Agapanthus",          category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Summer",               tip:"Root restriction improves flowering. Evergreen varieties need frost protection in cooler climates." },
  { id:261, name:"Monarda / Bee Balm",  category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Mid summer",           tip:"Bees and hummingbirds love it. Divide every 2–3 years to prevent mildew at the centre." },
  { id:262, name:"Erigeron",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Summer–Autumn",        tip:"Fleabane self-seeds freely between paving cracks. Almost no care needed once established." },
  { id:263, name:"Heuchera",            category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"Summer",               tip:"Grown primarily for dramatic foliage in bronze, purple, lime, and caramel." },
  { id:264, name:"Echinops / Globe Thistle", category:"Flowers", sun:"Full Sun ☀️", location:"Backyard",           difficulty:"Easy",     harvest:"Mid summer",           tip:"Dramatic blue drumstick flowers. Loved by bees. Incredibly drought tolerant." },
  { id:265, name:"Thalictrum",          category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Moderate", harvest:"Summer",               tip:"Airy, cloud-like lilac flowers on tall stems. Needs no staking despite its height." },
  { id:266, name:"Achillea / Yarrow",   category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Summer",               tip:"Flat-topped flower clusters in every colour. Extremely drought tolerant." },
  { id:267, name:"Kniphofia / Red Hot Poker", category:"Flowers", sun:"Full Sun ☀️", location:"Backyard",          difficulty:"Easy",     harvest:"Summer–Autumn",        tip:"Spiky orange and yellow torches that hummingbirds and bees adore." },
  { id:268, name:"Stachys / Lamb's Ear",category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Summer",               tip:"Grown for its irresistibly soft, silver-grey foliage. Purple flower spikes attract bees." },
  { id:269, name:"Liatris / Blazing Star", category:"Flowers", sun:"Full Sun ☀️",  location:"Backyard",            difficulty:"Easy",     harvest:"Mid–late summer",      tip:"Unusual — it flowers from the top of the spike downward. Monarch butterflies love it." },
  { id:270, name:"Platycodon / Balloon Flower", category:"Flowers", sun:"Full Sun ☀️", location:"Backyard",        difficulty:"Easy",     harvest:"Mid summer",           tip:"Named for its balloon-like buds. Long-lived and slow to emerge in spring — mark the spot." },
  { id:271, name:"Catmint",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Late spring–Autumn",   tip:"Cut back by half after flowering for a second flush. Bees love it. Repels aphids naturally." },
  { id:272, name:"Phlox",               category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Summer",               tip:"Intensely fragrant. Divide every 3 years and discard the woody centre." },
  { id:273, name:"Aquilegia / Columbine", category:"Flowers", sun:"Partial Sun 🌤️", location:"Backyard",           difficulty:"Easy",     harvest:"Late spring",          tip:"Beautiful spurred flowers in every colour. Self-seeds and hybridises freely." },
  { id:274, name:"Digitalis (Foxglove)", category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",           difficulty:"Easy",     harvest:"Year 2 to bloom",      tip:"Towering spikes of tubular flowers. Let them self-seed for a naturalistic woodland effect." },
  { id:275, name:"Hellebore",           category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Moderate", harvest:"Winter–Spring",        tip:"Flowers in the darkest months. Nodding heads — tilt the pot to admire the intricate centres." },
  { id:276, name:"Bleeding Heart",      category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Late spring",          tip:"Goes dormant after flowering — plant summer perennials nearby to fill the gap. Toxic if ingested." },
  { id:277, name:"Wallflower",          category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Spring",               tip:"Intensely spiced fragrance. Plant in autumn for magnificent spring colour alongside tulips." },
  { id:278, name:"Candytuft",           category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"50–65 days to bloom",  tip:"Neat mounds of white flowers in spring. Shear back after flowering for a second flush." },
  { id:279, name:"Aubrieta",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Spring",               tip:"Cascades over walls and rockeries in brilliant purple. Cut back hard after flowering." },
  { id:280, name:"Geranium (Hardy)",    category:"Flowers", sun:"Partial Sun 🌤️",  location:"Backyard",            difficulty:"Easy",     harvest:"Summer",               tip:"Completely different from tender Pelargoniums. Indestructible ground cover that smothers weeds." },
  { id:281, name:"Pelargonium",         category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Summer–Autumn",        tip:"What most people call a 'geranium'. Deadhead regularly. Bring cuttings inside before first frost." },
  { id:282, name:"Impatiens",           category:"Flowers", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"8–10 weeks to bloom",  tip:"One of the only bedding plants that thrives in shade. Keep consistently watered in containers." },
  { id:283, name:"Begonia (Tuberous)",  category:"Flowers", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Mid summer",           tip:"Plant tubers hollow-side up. Lift and store in autumn — they're frost tender." },
  { id:284, name:"Fuchsia",             category:"Flowers", sun:"Partial Sun 🌤️",  location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"Summer–Autumn",        tip:"Hanging varieties are spectacular in baskets. Bring inside before frost; they can live for decades." },
  { id:285, name:"Freesias",            category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Moderate", harvest:"Spring",               tip:"Exquisitely fragrant. Plant corms in autumn. In cold climates, grow indoors in pots." },
  { id:286, name:"Statice",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"80–90 days to bloom",  tip:"Papery flowers dry perfectly on the plant. Cut for arrangements at full colour and hang to dry." },
  { id:287, name:"Petunia",             category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"8–10 weeks to bloom",  tip:"Pinch early to prevent leggy growth. Feed fortnightly with liquid potassium for prolific blooms." },
  { id:288, name:"Cleome / Spider Flower", category:"Flowers", sun:"Full Sun ☀️",  location:"Backyard",            difficulty:"Easy",     harvest:"70–90 days to bloom",  tip:"Towering airy flowers with unusual spider-like stamens. Self-seeds readily." },
  { id:289, name:"Tithonia / Mexican Sunflower", category:"Flowers", sun:"Full Sun ☀️", location:"Backyard",       difficulty:"Easy",     harvest:"Mid summer",           tip:"Vivid orange flowers on 1.5 m plants. Thrives in heat. Butterflies and bees flock to it." },
  { id:290, name:"Nigella",             category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard / Balcony",  difficulty:"Easy",     harvest:"50–65 days to bloom",  tip:"Direct sow in autumn for best results. Feathery foliage and intriguing seed pods for drying." },
  { id:291, name:"Lisianthus",          category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Hard",     harvest:"5–6 months to bloom",  tip:"Looks like a rose but much easier to grow in warm climates. Long vase life." },
  { id:292, name:"Veronicastrum",       category:"Flowers", sun:"Full Sun ☀️",     location:"Backyard",            difficulty:"Easy",     harvest:"Mid summer",           tip:"Tall elegant spires in purple or white. Combines beautifully with ornamental grasses." },
  { id:293, name:"Globe Amaranth",      category:"Flowers", sun:"Full Sun ☀️",     location:"Balcony / Backyard",  difficulty:"Easy",     harvest:"60–80 days to bloom",  tip:"Clover-like papery flowers that hold colour when dried. Very heat and drought tolerant." },
]

const PLANT_EMOJIS = {
  "Cherry Tomatoes":"🍅","Beefsteak Tomatoes":"🍅","Lettuce":"🥬","Spinach":"🥬","Spinach (Baby)":"🥬",
  "Kale":"🥬","Arugula":"🥬","Swiss Chard":"🥬","Pak Choi":"🥬","Cabbage":"🥬","Savoy Cabbage":"🥬",
  "Brussels Sprouts":"🥦","Broccoli":"🥦","Cauliflower":"🥦","Radishes":"🫚","Beetroot":"🫚",
  "Carrots":"🥕","Parsnips":"🫚","Turnips":"🫚","Kohlrabi":"🫚","Sweet Potatoes":"🍠","Potatoes":"🥔",
  "Jerusalem Artichoke":"🫚","Asparagus":"🌿","Cucumber":"🥒","Zucchini":"🥒","Pumpkin":"🎃",
  "Butternut Squash":"🎃","Eggplant":"🍆","Bell Peppers":"🫑","Chili Peppers":"🌶️","Jalapeño":"🌶️",
  "Sweetcorn":"🌽","Okra":"🌿","Peas":"🫛","Sugar Snap Peas":"🫛","Runner Beans":"🫛",
  "French Beans":"🫛","Broad Beans":"🫛","Edamame":"🫛","Celery":"🌿","Fennel":"🌿","Leeks":"🌿",
  "Onions":"🧅","Red Onions":"🧅","Shallots":"🧅","Spring Onions":"🌱","Garlic":"🧄",
  "Microgreens":"🌱","Watercress":"🥬","Endive":"🥬","Radicchio":"🥬",
  "Strawberries":"🍓","Blueberries":"🫐","Raspberries":"🍓","Blackberries":"🍇","Gooseberries":"🍇",
  "Red Currants":"🍒","Black Currants":"🍇","Goji Berries":"🍒","Figs":"🌿","Grapes":"🍇",
  "Dwarf Apple":"🍎","Dwarf Pear":"🍐","Container Lemon":"🍋","Container Lime":"🍋",
  "Container Orange":"🍊","Avocado":"🥑","Passion Fruit":"🌸","Kiwi":"🥝","Physalis":"🍊",
  "Pomegranate":"🍎","Elderberries":"🫐",
  "Basil":"🌿","Mint":"🌿","Rosemary":"🌿","Thyme":"🌿","Cilantro":"🌿","Parsley":"🌿",
  "Chives":"🌿","Dill":"🌿","Sage":"🌿","Oregano":"🌿","Tarragon":"🌿","Lemongrass":"🌿",
  "Lemon Balm":"🌿","Ginger":"🫚","Turmeric":"🫚","Bay Laurel":"🌿","Marjoram":"🌿","Sorrel":"🌿",
  "Stevia":"🌿","Holy Basil / Tulsi":"🌿","Thai Basil":"🌿","Borage":"🌸","Lemon Verbena":"🌿",
  "Chervil":"🌿","Lovage":"🌿","Hyssop":"🌸","Catnip":"🌿","Valerian":"🌸","Feverfew":"🌼",
  "Vietnamese Coriander":"🌿","Garlic Chives":"🌿",
  "Marigolds":"🌼","Lavender":"💜","Sunflowers":"🌻","Roses":"🌹","Pansies":"🌸","Zinnias":"🌸",
  "Dahlias":"🌸","Nasturtiums":"🌸","Chamomile":"🌼","Calendula":"🌼","Cosmos":"🌸","Hibiscus":"🌺",
  "Snapdragons":"🌸","Sweet Peas":"🌸","Echinacea":"🌸","Poppies":"🌸","Cornflowers":"💙",
  "Foxgloves":"🌸","Hollyhocks":"🌸","Delphiniums":"💜","Lupins":"💜","Verbena":"🌸","Salvia":"💜",
  "Alyssum":"🌸","Celosia":"🌸","Portulaca":"🌸","Scabiosa":"🌸","Love in a Mist":"💙",
  "Nicotiana":"🌸","Strawflower":"🌸","Morning Glory":"💙","Bougainvillea":"🌺","Clematis":"💜",
  "Jasmine":"🌸","Honeysuckle":"🌸","Wisteria":"💜","Hydrangea":"💙","Lilac":"💜","Azalea":"🌸",
  "Camellia":"🌸","Forsythia":"🌼","Buddleja":"💜","Tulips":"🌷","Daffodils":"🌼","Crocuses":"💜",
  "Hyacinths":"💜","Alliums":"💜","Gladiolus":"🌸","Lilies":"🌸","Iris":"💜","Peonies":"🌸",
  "Chrysanthemums":"🌸","Ranunculus":"🌸","Anemones":"🌸","Baby's Breath":"🌸","Statice":"💜",
  "Asters":"🌸","Rudbeckia":"🌼","Gaillardia":"🌼","Helenium":"🌼","Gerbera Daisy":"🌸",
  "Agapanthus":"💜","Monarda / Bee Balm":"🌸","Erigeron":"💜","Heuchera":"🌸",
  "Echinops / Globe Thistle":"💙","Thalictrum":"💜","Achillea / Yarrow":"🌼",
  "Kniphofia / Red Hot Poker":"🔥","Stachys / Lamb's Ear":"🌿","Liatris / Blazing Star":"💜",
  "Platycodon / Balloon Flower":"💙","Catmint":"💜","Phlox":"🌸","Aquilegia / Columbine":"💜",
  "Digitalis (Foxglove)":"🌸","Hellebore":"🌸","Bleeding Heart":"🌸","Wallflower":"🌼",
  "Candytuft":"🌸","Aubrieta":"💜","Geranium (Hardy)":"🌸","Pelargonium":"🌸","Impatiens":"🌸",
  "Begonia (Tuberous)":"🌸","Fuchsia":"🌺","Freesias":"🌸","Petunia":"🌸",
  "Cleome / Spider Flower":"🌸","Tithonia / Mexican Sunflower":"🌻","Nigella":"💙",
  "Lisianthus":"💜","Veronicastrum":"💜","Globe Amaranth":"🌸",
}

const COLORS = ["#C8E6C9","#FFCDD2","#B2EBF2","#DCEDC8","#E1BEE7","#FFF9C4","#FFCCBC","#D1C4E9","#F8BBD0","#C5CAE9","#B3E5FC"]
function plantColor(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff
  return COLORS[Math.abs(h) % COLORS.length]
}
function plantEmoji(plant) {
  return PLANT_EMOJIS[plant.name] || (plant.category === "Flowers" ? "🌸" : "🌿")
}
const difficultyColor = { Easy:"#5A8A5A", Moderate:"#E9A84C", Hard:"#D96B6B" }

function PlantImage({ plant, height, radius, photoUrl }) {
  return (
    <div style={{ width:"100%", height, background:plantColor(plant.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize: height > 120 ? 56 : 32, borderRadius: radius || 0, overflow:"hidden", position:"relative", flexShrink:0 }}>
      <span style={{ position:"absolute", zIndex:1 }}>{plantEmoji(plant)}</span>
      {photoUrl && (
        <img
          src={photoUrl}
          alt={plant.name}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:2 }}
          onError={e => { e.target.style.display = "none" }}
        />
      )}
    </div>
  )
}

export default function Encyclopedia() {
  const { gardenPlants, addPlant } = useGarden()
  const [search, setSearch]               = useState("")
  const [activeTab, setActiveTab]         = useState("All")
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [justAdded, setJustAdded]         = useState(null)
  const photos = useInatPhotos(plants)

  function handleAddToGarden(plant) {
    addPlant({
      id: String(Date.now()),
      name: plant.name,
      nickname: plant.name,
      emoji: plantEmoji(plant),
      color: plantColor(plant.name),
      category: plant.category,
      dateAdded: new Date().toISOString().split("T")[0],
    })
    setJustAdded(plant.name)
    setTimeout(() => setJustAdded(null), 2000)
  }

  const tabs = ["All", "Edibles", "Flowers"]
  const filtered = plants.filter(p =>
    (activeTab === "All" || p.category === activeTab) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily:"'Inter', sans-serif", background:"#F7F5F2", minHeight:"100%", paddingBottom:"100px" }}>

      <div style={{ padding:"20px 24px 0" }}>
        <div style={{ fontSize:"13px", color:"#9A9690", fontWeight:400, marginBottom:"4px" }}>Explore</div>
        <div style={{ fontSize:"26px", fontWeight:600, color:"#1a1a1a", letterSpacing:"-0.5px", marginBottom:"16px" }}>
          Encyclopedia <span style={{ color:"#5A8A5A" }}>✦</span>
        </div>

        <div style={{ background:"#EEECEA", borderRadius:"14px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" stroke="#B0ADA8" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search 300+ plants…" style={{ border:"none", background:"transparent", fontSize:"14px", color:"#1a1a1a", outline:"none", flex:1, fontFamily:"'Inter', sans-serif" }} />
          {search && <span onClick={() => setSearch("")} style={{ fontSize:"14px", color:"#B0ADA8", cursor:"pointer" }}>✕</span>}
        </div>

        <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
          {tabs.map(tab => {
            const active = activeTab === tab
            return (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding:"7px 16px", borderRadius:"20px", fontSize:"13px", fontWeight:500, cursor:"pointer", background: active ? "#5A8A5A" : "#EEECEA", color: active ? "#fff" : "#9A9690", transition:"all 0.15s" }}>
                {tab}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding:"0 24px", fontSize:"12px", color:"#B0ADA8", fontWeight:500, marginBottom:"12px" }}>
        {filtered.length} plant{filtered.length !== 1 ? "s" : ""}
      </div>

      <div style={{ padding:"0 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        {filtered.map(plant => (
          <div key={plant.id} onClick={() => setSelectedPlant(plant)} style={{ background:"#fff", borderRadius:"18px", overflow:"hidden", border:"1px solid rgba(0,0,0,0.05)", cursor:"pointer" }}>
            <PlantImage plant={plant} height={110} photoUrl={photos[plant.name]} />
            <div style={{ padding:"10px 12px" }}>
              <div style={{ fontSize:"13px", fontWeight:600, color:"#1a1a1a", marginBottom:"4px" }}>{plant.name}</div>
              <div style={{ fontSize:"10px", color:"#9A9690", marginBottom:"2px" }}>{plant.sun}</div>
              <div style={{ fontSize:"10px", color: difficultyColor[plant.difficulty], fontWeight:600 }}>{plant.difficulty}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 24px", color:"#B0ADA8", fontSize:"14px" }}>
          No plants found for "{search}"
        </div>
      )}

      {selectedPlant && (
        <div onClick={() => setSelectedPlant(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#F7F5F2", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:"390px", maxHeight:"88vh", overflowY:"auto", paddingBottom:"40px" }}>

            <PlantImage plant={selectedPlant} height={200} radius="24px 24px 0 0" photoUrl={photos[selectedPlant.name]} />

            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
                <div>
                  <div style={{ fontSize:"22px", fontWeight:600, color:"#1a1a1a", letterSpacing:"-0.5px" }}>{selectedPlant.name}</div>
                  <div style={{ fontSize:"12px", color:"#9A9690", marginTop:"2px" }}>{selectedPlant.category}</div>
                </div>
                <div onClick={() => setSelectedPlant(null)} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#EEECEA", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"14px", color:"#9A9690", flexShrink:0 }}>✕</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"20px" }}>
                {[
                  { label:"Difficulty", value: selectedPlant.difficulty, color: difficultyColor[selectedPlant.difficulty] },
                  { label:"Harvest",    value: selectedPlant.harvest,    color:"#1a1a1a" },
                  { label:"Sun",        value: selectedPlant.sun,        color:"#1a1a1a" },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"#fff", borderRadius:"14px", padding:"12px 10px", border:"1px solid rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize:"10px", color:"#B0ADA8", fontWeight:500, marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.04em" }}>{stat.label}</div>
                    <div style={{ fontSize:"12px", fontWeight:600, color:stat.color, lineHeight:1.3 }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:"#fff", borderRadius:"14px", padding:"14px 16px", marginBottom:"14px", border:"1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:"11px", color:"#B0ADA8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Best Location</div>
                <div style={{ fontSize:"13px", color:"#1a1a1a", fontWeight:500 }}>{selectedPlant.location}</div>
              </div>

              <div style={{ background:"#EEF4EE", borderRadius:"14px", padding:"14px 16px", border:"1px solid rgba(90,138,90,0.15)", marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", color:"#5A8A5A", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>🌱 Chemical-Free Tip</div>
                <div style={{ fontSize:"13px", color:"#3a3a3a", lineHeight:1.6 }}>{selectedPlant.tip}</div>
              </div>

              {gardenPlants.find(p => p.name === selectedPlant.name) ? (
                <div style={{ width:"100%", padding:"14px", borderRadius:"14px", background:"#EAF2EA", border:"1.5px solid #C8DEC8", textAlign:"center", fontSize:"14px", fontWeight:600, color:"#3A6E3A" }}>✓ In Your Garden</div>
              ) : (
                <button onClick={() => handleAddToGarden(selectedPlant)} style={{ width:"100%", padding:"14px", borderRadius:"14px", border:"none", background: justAdded === selectedPlant.name ? "#3D6B3D" : "#5A8A5A", color:"#fff", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"background 0.2s" }}>
                  {justAdded === selectedPlant.name ? "Added! 🌱" : "Add to My Garden"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
