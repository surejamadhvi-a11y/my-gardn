import { useState } from "react"
import { useGarden } from "./GardenContext"

const plants = [
  {
    id: 1,
    name: "Cherry Tomatoes",
    category: "Edibles",
    sun: "Full Sun ☀️",
    location: "Balcony / Backyard",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80",
    difficulty: "Easy",
    harvest: "60–80 days",
    tip: "Use compost tea instead of synthetic fertilizer. Water at the base to avoid fungal issues.",
  },
  {
    id: 2,
    name: "Mint",
    category: "Edibles",
    sun: "Partial Sun 🌤️",
    location: "Indoor / Balcony",
    image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&q=80",
    difficulty: "Easy",
    harvest: "30–40 days",
    tip: "Grow in a separate pot — mint spreads aggressively. No pesticides needed, it naturally repels pests.",
  },
  {
    id: 3,
    name: "Basil",
    category: "Edibles",
    sun: "Full Sun ☀️",
    location: "Indoor / Balcony",
    image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&q=80",
    difficulty: "Easy",
    harvest: "25–35 days",
    tip: "Pinch off flower buds to keep leaves growing. Neem oil spray works great for aphids.",
  },
  {
    id: 4,
    name: "Marigolds",
    category: "Flowers",
    sun: "Full Sun ☀️",
    location: "Balcony / Backyard",
    image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&q=80",
    difficulty: "Easy",
    harvest: "45–50 days to bloom",
    tip: "Plant near vegetables — marigolds naturally repel whiteflies and nematodes. Zero chemicals needed.",
  },
  {
    id: 5,
    name: "Lavender",
    category: "Flowers",
    sun: "Full Sun ☀️",
    location: "Balcony / Backyard",
    image: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=400&q=80",
    difficulty: "Moderate",
    harvest: "90–100 days to bloom",
    tip: "Avoid overwatering — lavender thrives in dry soil. Great natural pest deterrent when dried.",
  },
  {
    id: 6,
    name: "Strawberries",
    category: "Edibles",
    sun: "Full Sun ☀️",
    location: "Balcony / Backyard",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80",
    difficulty: "Moderate",
    harvest: "60–90 days",
    tip: "Mulch with straw to retain moisture and prevent fungal disease. No chemicals needed with good airflow.",
  },
  {
    id: 7,
    name: "Spinach",
    category: "Edibles",
    sun: "Partial Sun 🌤️",
    location: "Indoor / Balcony",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
    difficulty: "Easy",
    harvest: "40–50 days",
    tip: "Grows well in cool weather. Use diluted fish emulsion as a natural fertilizer boost.",
  },
  {
    id: 8,
    name: "Sunflowers",
    category: "Flowers",
    sun: "Full Sun ☀️",
    location: "Backyard / Balcony",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80",
    difficulty: "Easy",
    harvest: "70–100 days to bloom",
    tip: "Plant in well-draining soil. Attract pollinators naturally — no sprays needed.",
  },
]

const PLANT_EMOJIS = {
  "Cherry Tomatoes": "🍅", "Mint": "🌿", "Basil": "🌿", "Marigolds": "🌼",
  "Lavender": "💜", "Strawberries": "🍓", "Spinach": "🥬", "Sunflowers": "🌻",
}
const PLANT_COLORS = ["#C8E6C9","#FFCDD2","#B2EBF2","#DCEDC8","#E1BEE7","#FFF9C4","#FFCCBC","#D1C4E9"]
function plantColor(name) {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return PLANT_COLORS[h % PLANT_COLORS.length]
}

const difficultyColor = { Easy: "#5A8A5A", Moderate: "#E9A84C", Hard: "#D96B6B" }

export default function Encyclopedia() {
  const { gardenPlants, addPlant } = useGarden()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [justAdded, setJustAdded] = useState(null)

  function handleAddToGarden(plant) {
    addPlant({
      id: String(Date.now()),
      name: plant.name,
      nickname: plant.name,
      emoji: PLANT_EMOJIS[plant.name] || (plant.category === "Flowers" ? "🌸" : "🌿"),
      color: plantColor(plant.name),
      category: plant.category,
      dateAdded: new Date().toISOString().split("T")[0],
    })
    setJustAdded(plant.name)
    setTimeout(() => setJustAdded(null), 2000)
  }

  const tabs = ["All", "Edibles", "Flowers"]

  const filtered = plants.filter(function(p) {
    const matchTab = activeTab === "All" || p.category === activeTab
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div style={{fontFamily: "'Inter', sans-serif", background: "#F7F5F2", minHeight: "100vh", maxWidth: "390px", margin: "0 auto", paddingBottom: "100px"}}>

      {/* Header */}
      <div style={{padding: "20px 24px 0"}}>
        <div style={{fontSize: "13px", color: "#9A9690", fontWeight: 400, marginBottom: "4px"}}>Explore</div>
        <div style={{fontSize: "26px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.5px", marginBottom: "16px"}}>
          Encyclopedia <span style={{color: "#5A8A5A"}}>✦</span>
        </div>

        {/* Search */}
        <div style={{background: "#EEECEA", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px"}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <circle cx="7" cy="7" r="5" stroke="#B0ADA8" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={function(e) { setSearch(e.target.value) }}
            placeholder="Search plants..."
            style={{border: "none", background: "transparent", fontSize: "14px", color: "#1a1a1a", outline: "none", flex: 1, fontFamily: "'Inter', sans-serif"}}
          />
          {search && (
            <span onClick={function() { setSearch("") }} style={{fontSize: "14px", color: "#B0ADA8", cursor: "pointer"}}>✕</span>
          )}
        </div>

        {/* Tabs */}
        <div style={{display: "flex", gap: "8px", marginBottom: "20px"}}>
          {tabs.map(function(tab) {
            const active = activeTab === tab
            return (
              <div key={tab} onClick={function() { setActiveTab(tab) }} style={{padding: "7px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: active ? "#5A8A5A" : "#EEECEA", color: active ? "#fff" : "#9A9690", transition: "all 0.15s"}}>
                {tab}
              </div>
            )
          })}
        </div>
      </div>

      {/* Plant count */}
      <div style={{padding: "0 24px", fontSize: "12px", color: "#B0ADA8", fontWeight: 500, marginBottom: "12px"}}>
        {filtered.length} plant{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Grid */}
      <div style={{padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
        {filtered.map(function(plant) {
          return (
            <div key={plant.id} onClick={function() { setSelectedPlant(plant) }} style={{background: "#fff", borderRadius: "18px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer"}}>
              <img
                src={plant.image}
                alt={plant.name}
                style={{width: "100%", height: "110px", objectFit: "cover", display: "block"}}
                onError={function(e) { e.target.style.background = "#EEECEA"; e.target.style.display = "none" }}
              />
              <div style={{padding: "10px 12px"}}>
                <div style={{fontSize: "13px", fontWeight: 600, color: "#1a1a1a", marginBottom: "6px"}}>{plant.name}</div>
                <div style={{fontSize: "10px", color: "#9A9690", marginBottom: "3px"}}>{plant.sun}</div>
                <div style={{fontSize: "10px", color: "#9A9690"}}>{plant.location}</div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign: "center", padding: "60px 24px", color: "#B0ADA8", fontSize: "14px"}}>
          No plants found for "{search}"
        </div>
      )}

      {/* Modal */}
      {selectedPlant && (
        <div onClick={function() { setSelectedPlant(null) }} style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center"}}>
          <div onClick={function(e) { e.stopPropagation() }} style={{background: "#F7F5F2", borderRadius: "24px 24px 0 0", width: "390px", maxHeight: "85vh", overflowY: "auto", paddingBottom: "40px"}}>

            <img src={selectedPlant.image} alt={selectedPlant.name} style={{width: "100%", height: "200px", objectFit: "cover", borderRadius: "24px 24px 0 0", display: "block"}}/>

            <div style={{padding: "20px 24px"}}>
              {/* Close */}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"}}>
                <div>
                  <div style={{fontSize: "22px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.5px"}}>{selectedPlant.name}</div>
                  <div style={{fontSize: "12px", color: "#9A9690", marginTop: "2px"}}>{selectedPlant.category}</div>
                </div>
                <div onClick={function() { setSelectedPlant(null) }} style={{width: "32px", height: "32px", borderRadius: "50%", background: "#EEECEA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", color: "#9A9690"}}>✕</div>
              </div>

              {/* Stats */}
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px"}}>
                {[
                  {label: "Difficulty", value: selectedPlant.difficulty, color: difficultyColor[selectedPlant.difficulty]},
                  {label: "Harvest", value: selectedPlant.harvest, color: "#1a1a1a"},
                  {label: "Sun", value: selectedPlant.sun, color: "#1a1a1a"},
                ].map(function(stat) {
                  return (
                    <div key={stat.label} style={{background: "#fff", borderRadius: "14px", padding: "12px 10px", border: "1px solid rgba(0,0,0,0.05)"}}>
                      <div style={{fontSize: "10px", color: "#B0ADA8", fontWeight: 500, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em"}}>{stat.label}</div>
                      <div style={{fontSize: "12px", fontWeight: 600, color: stat.color, lineHeight: 1.3}}>{stat.value}</div>
                    </div>
                  )
                })}
              </div>

              {/* Location */}
              <div style={{background: "#fff", borderRadius: "14px", padding: "14px 16px", marginBottom: "14px", border: "1px solid rgba(0,0,0,0.05)"}}>
                <div style={{fontSize: "11px", color: "#B0ADA8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px"}}>Best Location</div>
                <div style={{fontSize: "13px", color: "#1a1a1a", fontWeight: 500}}>{selectedPlant.location}</div>
              </div>

              {/* Tip */}
              <div style={{background: "#EEF4EE", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(90,138,90,0.15)", marginBottom: "16px"}}>
                <div style={{fontSize: "11px", color: "#5A8A5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px"}}>🌱 Chemical-Free Tip</div>
                <div style={{fontSize: "13px", color: "#3a3a3a", lineHeight: 1.6}}>{selectedPlant.tip}</div>
              </div>

              {/* Add to garden */}
              {gardenPlants.find(p => p.name === selectedPlant.name) ? (
                <div style={{width: "100%", padding: "14px", borderRadius: "14px", background: "#EAF2EA", border: "1.5px solid #C8DEC8", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#3A6E3A"}}>
                  ✓ In Your Garden
                </div>
              ) : (
                <button
                  onClick={() => handleAddToGarden(selectedPlant)}
                  style={{width: "100%", padding: "14px", borderRadius: "14px", border: "none", background: justAdded === selectedPlant.name ? "#3D6B3D" : "#5A8A5A", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background 0.2s"}}>
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
