import { useState, useEffect } from "react";
import PlantProfile from "./PlantProfile";

const STORAGE_KEY = "myPlants";

const PLANT_CATALOG = [
  // Vegetables
  "Cherry Tomatoes","Beefsteak Tomatoes","Lettuce","Spinach","Kale","Arugula",
  "Swiss Chard","Spinach (Baby)","Pak Choi","Cabbage","Savoy Cabbage",
  "Brussels Sprouts","Broccoli","Cauliflower","Radishes","Beetroot",
  "Carrots","Parsnips","Turnips","Kohlrabi","Sweet Potatoes","Potatoes",
  "Jerusalem Artichoke","Asparagus","Cucumber","Zucchini","Pumpkin",
  "Butternut Squash","Eggplant","Bell Peppers","Chili Peppers","Jalapeño",
  "Sweetcorn","Okra","Peas","Sugar Snap Peas","Runner Beans",
  "French Beans","Broad Beans","Edamame","Celery","Fennel","Leeks",
  "Onions","Red Onions","Shallots","Spring Onions","Garlic",
  "Microgreens","Watercress","Endive","Radicchio",
  // Fruits
  "Strawberries","Blueberries","Raspberries","Blackberries","Gooseberries",
  "Red Currants","Black Currants","Goji Berries","Figs","Grapes",
  "Dwarf Apple","Dwarf Pear","Container Lemon","Container Lime",
  "Container Orange","Avocado","Passion Fruit","Kiwi","Physalis",
  "Pomegranate","Elderberries",
  // Herbs
  "Basil","Mint","Rosemary","Thyme","Cilantro","Parsley",
  "Chives","Dill","Sage","Oregano","Tarragon","Lemongrass",
  "Lemon Balm","Ginger","Turmeric","Bay Laurel","Marjoram","Sorrel",
  "Stevia","Holy Basil / Tulsi","Thai Basil","Borage","Lemon Verbena",
  "Chervil","Lovage","Hyssop","Catnip","Valerian","Feverfew",
  "Vietnamese Coriander","Garlic Chives",
  // Flowers
  "Marigolds","Lavender","Sunflowers","Roses","Pansies","Zinnias",
  "Dahlias","Nasturtiums","Chamomile","Calendula","Cosmos","Hibiscus",
  "Snapdragons","Sweet Peas","Echinacea","Poppies","Cornflowers",
  "Foxgloves","Hollyhocks","Delphiniums","Lupins","Verbena","Salvia",
  "Alyssum","Celosia","Portulaca","Scabiosa","Love in a Mist",
  "Nicotiana","Strawflower","Morning Glory","Bougainvillea","Clematis",
  "Jasmine","Honeysuckle","Wisteria","Hydrangea","Lilac","Azalea",
  "Camellia","Forsythia","Buddleja","Tulips","Daffodils","Crocuses",
  "Hyacinths","Alliums","Gladiolus","Lilies","Iris","Peonies",
  "Chrysanthemums","Ranunculus","Anemones","Baby's Breath","Statice",
  "Asters","Rudbeckia","Gaillardia","Helenium","Gerbera Daisy",
  "Agapanthus","Catmint","Phlox","Aquilegia / Columbine","Hellebore",
  "Bleeding Heart","Wallflower","Candytuft","Geranium (Hardy)",
  "Pelargonium","Impatiens","Begonia (Tuberous)","Fuchsia","Petunia",
];

const HEALTH_BADGES = {
  "Healthy":          { bg: "#EAF2EA", color: "#5A8A5A" },
  "Needs Attention":  { bg: "#FFF3E0", color: "#E9A84C" },
  "Critical":         { bg: "#FFEBEE", color: "#D96B6B" },
};

const FONT = "'Inter', system-ui, sans-serif";

function loadPlants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlants(plants) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plants)); }
  catch (e) { console.warn("Storage full:", e.message); }
}

function plantImageUrl(name) {
  return `https://source.unsplash.com/300x300/?${encodeURIComponent(name)},plant`;
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Plant Card ────────────────────────────────────────────────────────────────

function PlantCard({ plant, onClick }) {
  const badge = HEALTH_BADGES[plant.healthStatus] || HEALTH_BADGES["Healthy"];
  const [imgErr, setImgErr] = useState(false);
  const nextDate = formatDate(plant.nextWatering);

  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #E8E4DF",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        width: "100%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform 0.12s",
      }}
      onTouchStart={e => (e.currentTarget.style.transform = "scale(0.97)")}
      onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div
        style={{
          width: "100%",
          height: "130px",
          background: "#EAF2EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imgErr ? (
          <span style={{ fontSize: 48 }}>🌿</span>
        ) : (
          <img
            src={plantImageUrl(plant.name)}
            alt={plant.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgErr(true)}
          />
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: "13px",
            fontWeight: 600,
            color: "#1A1A1A",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {plant.name}
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: "6px",
            padding: "2px 8px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: 600,
            fontFamily: FONT,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {plant.healthStatus}
        </span>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: FONT,
            fontSize: "11px",
            color: "#999",
          }}
        >
          💧 {nextDate ? `Next: ${nextDate}` : "No schedule"}
        </p>
      </div>
    </button>
  );
}

// ── Add Plant Modal ───────────────────────────────────────────────────────────

function AddPlantModal({ onAdd, onClose }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? PLANT_CATALOG.filter(n =>
        n.toLowerCase().includes(search.toLowerCase())
      )
    : PLANT_CATALOG;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(28,28,26,0.5)",
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxHeight: "85vh",
          background: "#F7F5F2",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 12px",
            borderBottom: "1px solid #ECEAE6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: "17px",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            Add a Plant
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: "none",
              background: "#ECEAE6",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 14,
              color: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
            }}
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div style={{ padding: "12px 20px", flexShrink: 0 }}>
          <input
            autoFocus
            placeholder="Search 300+ plants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #E8E4DF",
              background: "#EEECEA",
              fontFamily: FONT,
              fontSize: "14px",
              color: "#1A1A1A",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => (e.target.style.borderColor = "#5A8A5A")}
            onBlur={e => (e.target.style.borderColor = "#E8E4DF")}
          />
        </div>

        {/* Results list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px 32px" }}>
          {filtered.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#999",
                fontFamily: FONT,
                fontSize: "14px",
              }}
            >
              No plants found
            </p>
          ) : (
            filtered.map(name => (
              <button
                key={name}
                onClick={() => onAdd(name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  background: "#fff",
                  border: "1px solid #ECEAE6",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: FONT,
                }}
                onMouseDown={e => (e.currentTarget.style.background = "#EAF2EA")}
                onMouseUp={e => (e.currentTarget.style.background = "#fff")}
                onTouchStart={e => (e.currentTarget.style.background = "#EAF2EA")}
                onTouchEnd={e => (e.currentTarget.style.background = "#fff")}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#EAF2EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 20,
                  }}
                >
                  🌿
                </div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1A1A1A",
                  }}
                >
                  {name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 32px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
      <h2
        style={{
          margin: "0 0 8px",
          fontFamily: FONT,
          fontSize: "20px",
          fontWeight: 700,
          color: "#1A1A1A",
        }}
      >
        No plants yet
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: FONT,
          fontSize: "14px",
          color: "#888",
          lineHeight: 1.5,
        }}
      >
        Tap + to add your first plant
      </p>
    </div>
  );
}

// ── MyPlants ──────────────────────────────────────────────────────────────────

export default function MyPlants() {
  const [plants, setPlants] = useState(loadPlants);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  function handleAddPlant(name) {
    const newPlant = {
      id: Date.now(),
      name,
      photo: null,
      healthStatus: "Healthy",
      growthStage: "Vegetative",
      lastWatered: null,
      nextWatering: null,
      notes: [],
      addedDate: new Date().toISOString(),
    };
    setPlants(prev => [...prev, newPlant]);
    setShowAddModal(false);
    setSelectedPlant(newPlant);
  }

  function handleUpdatePlant(updated) {
    setPlants(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setSelectedPlant(updated);
  }

  // Show profile view
  if (selectedPlant) {
    const current = plants.find(p => p.id === selectedPlant.id) || selectedPlant;
    return (
      <PlantProfile
        plant={current}
        onBack={() => setSelectedPlant(null)}
        onUpdate={handleUpdatePlant}
      />
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 20px 120px",
        background: "#F7F5F2",
        minHeight: "100%",
      }}
    >
      <h1
        style={{
          margin: "0 0 20px",
          fontFamily: FONT,
          fontSize: "22px",
          fontWeight: 700,
          color: "#1A1A1A",
          letterSpacing: "-0.3px",
        }}
      >
        My Plants
      </h1>

      {plants.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {plants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onClick={() => setSelectedPlant(plant)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        aria-label="Add plant"
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "#5A8A5A",
          color: "#fff",
          border: "none",
          fontSize: "28px",
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(90,138,90,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          fontFamily: FONT,
        }}
      >
        +
      </button>

      {showAddModal && (
        <AddPlantModal
          onAdd={handleAddPlant}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
