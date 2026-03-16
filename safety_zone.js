const SAFETY_ZONES = [
  // HIGH RISK (5) - Red
  { lat: 18.5204, lng: 73.8567, risk: 5, name: "MG Road Night Zone", area: "Central", radius: 300 },
  { lat: 18.5144, lng: 73.8477, risk: 5, name: "Shivajinagar Junction", area: "West", radius: 250 },
  { lat: 18.5314, lng: 73.8446, risk: 5, name: "Old Market Lane", area: "North", radius: 280 },
  { lat: 18.5089, lng: 73.8650, risk: 5, name: "Dark Alley - Camp Area", area: "East", radius: 200 },
  { lat: 18.4955, lng: 73.8600, risk: 5, name: "Isolated Road - Bibvewadi", area: "South", radius: 220 },
  { lat: 18.5230, lng: 73.8700, risk: 5, name: "Unlit Street - Ganj Peth", area: "Central", radius: 180 },
  { lat: 18.5380, lng: 73.8520, risk: 5, name: "Abandoned Lane - Bopodi", area: "North", radius: 260 },

  // HIGH-MODERATE RISK (4) - Orange-Red
  { lat: 18.5181, lng: 73.8553, risk: 4, name: "FC Road Evening Zone", area: "Central", radius: 350 },
  { lat: 18.5260, lng: 73.8600, risk: 4, name: "Deccan Gymkhana Side Lane", area: "West", radius: 300 },
  { lat: 18.5050, lng: 73.8560, risk: 4, name: "Swargate Bus Stand Area", area: "South", radius: 400 },
  { lat: 18.5420, lng: 73.8460, risk: 4, name: "Pimpri Industrial Zone", area: "North", radius: 350 },
  { lat: 18.5110, lng: 73.8750, risk: 4, name: "Wanowrie Night Market", area: "East", radius: 280 },
  { lat: 18.5290, lng: 73.8380, risk: 4, name: "Kothrud Back Streets", area: "West", radius: 320 },

  // MODERATE RISK (3) - Orange
  { lat: 18.5195, lng: 73.8553, risk: 3, name: "Bhandarkar Road", area: "Central", radius: 400 },
  { lat: 18.5160, lng: 73.8620, risk: 3, name: "Koregaon Park Lane 5", area: "East", radius: 380 },
  { lat: 18.5070, lng: 73.8500, risk: 3, name: "Sadashiv Peth Crossing", area: "Central", radius: 300 },
  { lat: 18.5350, lng: 73.8580, risk: 3, name: "Aundh Market Area", area: "North", radius: 420 },
  { lat: 18.5000, lng: 73.8650, risk: 3, name: "Fatima Nagar Road", area: "South", radius: 350 },
  { lat: 18.5230, lng: 73.8450, risk: 3, name: "Erandwane Park Road", area: "West", radius: 300 },
  { lat: 18.5460, lng: 73.8540, risk: 3, name: "Chinchwad Station Road", area: "North", radius: 380 },

  // LOW-MODERATE RISK (2) - Yellow
  { lat: 18.5218, lng: 73.8540, risk: 2, name: "Tilak Road", area: "Central", radius: 500 },
  { lat: 18.5170, lng: 73.8580, risk: 2, name: "North Main Road", area: "East", radius: 450 },
  { lat: 18.5120, lng: 73.8480, risk: 2, name: "Laxmi Road Market", area: "Central", radius: 480 },
  { lat: 18.5400, lng: 73.8620, risk: 2, name: "Wakad Road", area: "North", radius: 500 },
  { lat: 18.4980, lng: 73.8580, risk: 2, name: "Kondhwa Main Road", area: "South", radius: 420 },
  { lat: 18.5330, lng: 73.8500, risk: 2, name: "Baner Road", area: "West", radius: 480 },

  // SAFE (1) - Green
  { lat: 18.5204, lng: 73.8600, risk: 1, name: "Aga Khan Palace Area", area: "East", radius: 600 },
  { lat: 18.5280, lng: 73.8550, risk: 1, name: "University Campus Zone", area: "Central", radius: 700 },
  { lat: 18.5150, lng: 73.8500, risk: 1, name: "JM Road (Daytime)", area: "Central", radius: 550 },
  { lat: 18.5450, lng: 73.8480, risk: 1, name: "Aundh Well-Lit Zone", area: "North", radius: 650 },
  { lat: 18.5080, lng: 73.8620, risk: 1, name: "Viman Nagar Corridor", area: "East", radius: 600 },
  { lat: 18.5320, lng: 73.8450, risk: 1, name: "NIBM Road (Gated Area)", area: "South", radius: 580 },
  { lat: 18.5240, lng: 73.8480, risk: 1, name: "Prabhat Road", area: "West", radius: 620 },
  { lat: 18.5370, lng: 73.8600, risk: 1, name: "Pashan Lake Road", area: "West", radius: 700 },
];

const RISK_CONFIG = {
  1: { color: '#00e676', label: 'Safe', fill: 'rgba(0,230,118,0.25)', stroke: '#00e676' },
  2: { color: '#c6ff00', label: 'Low Risk', fill: 'rgba(198,255,0,0.25)', stroke: '#c6ff00' },
  3: { color: '#ffab40', label: 'Moderate', fill: 'rgba(255,171,64,0.30)', stroke: '#ffab40' },
  4: { color: '#ff6d00', label: 'High Risk', fill: 'rgba(255,109,0,0.35)', stroke: '#ff6d00' },
  5: { color: '#ff1744', label: 'Danger Zone', fill: 'rgba(255,23,68,0.40)', stroke: '#ff1744' },
};

const EMERGENCY_SERVICES = [
  { name: "Pune Police HQ", phone: "100", lat: 18.5195, lng: 73.8553, type: "police" },
  { name: "Ruby Hall Clinic", phone: "020-26163391", lat: 18.5186, lng: 73.8811, type: "hospital" },
  { name: "Sassoon General Hospital", phone: "020-26128000", lat: 18.5157, lng: 73.8573, type: "hospital" },
  { name: "KEM Hospital Pune", phone: "020-26128033", lat: 18.5130, lng: 73.8555, type: "hospital" },
  { name: "Deccan Queens Fire Station", phone: "101", lat: 18.5220, lng: 73.8480, type: "govt" },
  { name: "District Women's Cell", phone: "1091", lat: 18.5300, lng: 73.8560, type: "govt" },
  { name: "National Emergency", phone: "112", lat: 18.5204, lng: 73.8567, type: "police" },
  { name: "Ambulance Service", phone: "108", lat: 18.5250, lng: 73.8600, type: "hospital" },
];
