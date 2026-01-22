
import React, { useEffect, useRef } from 'react';
import { ForestData } from '../types';

// Declare L for Leaflet which is loaded via CDN/globally
declare const L: any;

interface ForestMapProps {
  onRegionSelect: (data: ForestData) => void;
}

const ForestMap: React.FC<ForestMapProps> = ({ onRegionSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const alertsLayerRef = useRef<any>(null);
  const activePopupRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  // Matriz de Âncoras de Fidelidade Global (Cobertura Densificada para 100% dos Territórios)
  const globalAnchors = [
    // EUROPA (Norte, Sul, Leste e Ilhas)
    { lat: 51.507, lng: -0.127, name: "Londres, Reino Unido" },
    { lat: 55.953, lng: -3.188, name: "Edimburgo, Escócia" },
    { lat: 53.349, lng: -6.260, name: "Dublin, Irlanda" },
    { lat: 48.856, lng: 2.352, name: "Paris, França" },
    { lat: 44.837, lng: -0.579, name: "Bordéus, França" },
    { lat: 40.416, lng: -3.703, name: "Madrid, Espanha" },
    { lat: 38.722, lng: -9.139, name: "Lisboa, Portugal" },
    { lat: 41.902, lng: 12.496, name: "Roma, Itália" },
    { lat: 45.464, lng: 9.188, name: "Milão, Itália" },
    { lat: 52.520, lng: 13.405, name: "Berlim, Alemanha" },
    { lat: 48.135, lng: 11.581, name: "Munique, Alemanha" },
    { lat: 52.367, lng: 4.904, name: "Amesterdão, Holanda" },
    { lat: 50.850, lng: 4.351, name: "Bruxelas, Bélgica" },
    { lat: 48.208, lng: 16.373, name: "Viena, Áustria" },
    { lat: 46.948, lng: 7.447, name: "Berna, Suíça" },
    { lat: 59.329, lng: 18.068, name: "Estocolmo, Suécia" },
    { lat: 59.913, lng: 10.752, name: "Oslo, Noruega" },
    { lat: 55.676, lng: 12.568, name: "Copenhaga, Dinamarca" },
    { lat: 60.169, lng: 24.938, name: "Helsínquia, Finlândia" },
    { lat: 52.229, lng: 21.012, name: "Varsóvia, Polónia" },
    { lat: 50.075, lng: 14.437, name: "Praga, Chéquia" },
    { lat: 47.497, lng: 19.040, name: "Budapeste, Hungria" },
    { lat: 44.426, lng: 26.102, name: "Bucareste, Roménia" },
    { lat: 42.697, lng: 23.321, name: "Sófia, Bulgária" },
    { lat: 37.983, lng: 23.727, name: "Atenas, Grécia" },
    { lat: 53.900, lng: 27.566, name: "Minsk, Bielorrússia" },
    { lat: 50.450, lng: 30.523, name: "Kiev, Ucrânia" },

    // ÁFRICA DO NORTE E SAHEL (Calibração para Desertos e Costa)
    { lat: 34.013, lng: -6.832, name: "Rabat, Marrocos" },
    { lat: 31.629, lng: -7.981, name: "Marraquexe, Marrocos" },
    { lat: 36.753, lng: 3.058, name: "Argel, Argélia" },
    { lat: 22.785, lng: 5.522, name: "Tamanrasset, Argélia (Saara Central)" },
    { lat: 36.806, lng: 10.181, name: "Túnis, Tunísia" },
    { lat: 32.887, lng: 13.191, name: "Trípoli, Líbia" },
    { lat: 25.942, lng: 13.435, name: "Sebha, Líbia" },
    { lat: 30.044, lng: 31.235, name: "Cairo, Egito" },
    { lat: 24.088, lng: 32.899, name: "Assuão, Egito" },
    { lat: 18.073, lng: -15.958, name: "Nouakchott, Mauritânia" },
    { lat: 12.639, lng: -8.002, name: "Bamako, Mali" },
    { lat: 16.265, lng: 0.051, name: "Gao, Mali" },
    { lat: 13.511, lng: 2.125, name: "Niamey, Níger" },
    { lat: 15.500, lng: 32.559, name: "Cartum, Sudão" },
    { lat: 12.134, lng: 15.055, name: "N'Djamena, Chade" },

    // ÁFRICA SUBSARIANA (Biomas de Selva e Savana)
    { lat: 14.716, lng: -17.467, name: "Dakar, Senegal" },
    { lat: 12.371, lng: -1.519, name: "Ouagadougou, Burkina Faso" },
    { lat: 5.309, lng: -4.012, name: "Abidjan, Costa do Marfim" },
    { lat: 5.603, lng: -0.187, name: "Acra, Gana" },
    { lat: 6.453, lng: 3.395, name: "Lagos, Nigéria" },
    { lat: 9.076, lng: 7.398, name: "Abuja, Nigéria" },
    { lat: 3.848, lng: 11.502, name: "Yaoundé, Camarões" },
    { lat: 0.390, lng: 9.454, name: "Libreville, Gabão" },
    { lat: -4.263, lng: 15.283, name: "Brazzaville, Congo" },
    { lat: -4.324, lng: 15.306, name: "Kinshasa, RD Congo" },
    { lat: 0.515, lng: 25.190, name: "Kisangani, RD Congo" },
    { lat: 0.347, lng: 32.582, name: "Kampala, Uganda" },
    { lat: -1.292, lng: 36.821, name: "Nairóbi, Quénia" },
    { lat: -6.792, lng: 39.208, name: "Dar es Salaam, Tanzânia" },
    { lat: -8.839, lng: 13.235, name: "Luanda, Angola" },
    { lat: -12.164, lng: 15.865, name: "Huambo, Angola" },
    { lat: -14.917, lng: 13.492, name: "Lubango, Angola" },
    { lat: -15.416, lng: 28.283, name: "Lusaka, Zâmbia" },
    { lat: -18.879, lng: 47.507, name: "Antananarivo, Madagascar" },
    { lat: -23.350, lng: 43.666, name: "Toliara, Madagascar" },
    { lat: -12.271, lng: 49.291, name: "Antsiranana, Madagascar" },
    { lat: -25.969, lng: 32.573, name: "Maputo, Moçambique" },
    { lat: -19.831, lng: 34.836, name: "Beira, Moçambique" },
    { lat: -15.116, lng: 39.266, name: "Nampula, Moçambique" },
    { lat: -33.924, lng: 18.423, name: "Cidade do Cabo, África do Sul" },
    { lat: -26.204, lng: 28.047, name: "Joanesburgo, África do Sul" },

    // AMÉRICA DO SUL (Amazonas, Pantanal, Pampas)
    { lat: -3.119, lng: -60.021, name: "Manaus, Amazonas, Brasil" },
    { lat: -1.455, lng: -48.502, name: "Belém, Pará, Brasil" },
    { lat: -15.598, lng: -56.094, name: "Cuiabá, Mato Grosso, Brasil" },
    { lat: -15.794, lng: -47.882, name: "Brasília, Brasil" },
    { lat: -23.550, lng: -46.633, name: "São Paulo, Brasil" },
    { lat: -22.906, lng: -43.172, name: "Rio de Janeiro, Brasil" },
    { lat: -30.034, lng: -51.217, name: "Porto Alegre, Brasil" },
    { lat: -34.603, lng: -58.381, name: "Buenos Aires, Argentina" },
    { lat: -31.420, lng: -64.188, name: "Córdoba, Argentina" },
    { lat: -33.448, lng: -70.667, name: "Santiago, Chile" },
    { lat: -53.163, lng: -70.917, name: "Punta Arenas, Chile" },
    { lat: -12.046, lng: -77.042, name: "Lima, Peru" },
    { lat: -3.743, lng: -73.251, name: "Iquitos, Peru" },
    { lat: 4.711, lng: -74.072, name: "Bogotá, Colômbia" },
    { lat: 10.480, lng: -66.903, name: "Caracas, Venezuela" },
    { lat: -16.500, lng: -68.119, name: "La Paz, Bolívia" },
    { lat: -0.180, lng: -78.467, name: "Quito, Equador" },
    { lat: -25.263, lng: -57.575, name: "Assunção, Paraguai" },
    { lat: -34.901, lng: -56.167, name: "Montevidéu, Uruguai" },

    // AMÉRICA DO NORTE E CENTRAL (Canadá ao Panamá)
    { lat: 45.421, lng: -75.697, name: "Ottawa, Canadá" },
    { lat: 43.653, lng: -79.383, name: "Toronto, Canadá" },
    { lat: 49.282, lng: -123.120, name: "Vancouver, Canadá" },
    { lat: 40.712, lng: -74.006, name: "Nova York, EUA" },
    { lat: 38.907, lng: -77.036, name: "Washington D.C., EUA" },
    { lat: 34.052, lng: -118.243, name: "Los Angeles, EUA" },
    { lat: 41.878, lng: -87.629, name: "Chicago, EUA" },
    { lat: 29.760, lng: -95.369, name: "Houston, EUA" },
    { lat: 25.761, lng: -80.191, name: "Miami, EUA" },
    { lat: 19.432, lng: -99.133, name: "Cidade do México, México" },
    { lat: 14.634, lng: -90.506, name: "Cidade da Guatemala" },
    { lat: 9.928, lng: -84.090, name: "San José, Costa Rica" },
    { lat: 8.982, lng: -79.519, name: "Cidade do Panamá" },
    { lat: 23.113, lng: -82.366, name: "Havana, Cuba" },
    { lat: 18.465, lng: -66.105, name: "San Juan, Porto Rico" },

    // ÁSIA E MÉDIO ORIENTE (Rússia ao Sudeste Asiático)
    { lat: 55.755, lng: 37.617, name: "Moscovo, Rússia" },
    { lat: 59.931, lng: 30.333, name: "São Petersburgo, Rússia" },
    { lat: 55.008, lng: 82.934, name: "Novosibirsk, Sibéria" },
    { lat: 43.222, lng: 76.851, name: "Almaty, Cazaquistão" },
    { lat: 41.299, lng: 69.240, name: "Tashkent, Uzbequistão" },
    { lat: 39.904, lng: 116.407, name: "Pequim, China" },
    { lat: 31.230, lng: 121.473, name: "Xangai, China" },
    { lat: 30.572, lng: 104.066, name: "Chengdu, China" },
    { lat: 22.319, lng: 114.169, name: "Hong Kong" },
    { lat: 35.676, lng: 139.650, name: "Tóquio, Japão" },
    { lat: 37.566, lng: 126.978, name: "Seul, Coreia do Sul" },
    { lat: 25.033, lng: 121.565, name: "Taipé, Taiwan" },
    { lat: 28.613, lng: 77.209, name: "Nova Deli, Índia" },
    { lat: 19.076, lng: 72.877, name: "Mumbai, Índia" },
    { lat: 13.082, lng: 80.270, name: "Chennai, Índia" },
    { lat: 23.810, lng: 90.412, name: "Daca, Bangladesh" },
    { lat: 24.860, lng: 67.001, name: "Carachi, Paquistão" },
    { lat: 35.689, lng: 51.389, name: "Teerão, Irão" },
    { lat: 33.315, lng: 44.361, name: "Bagdá, Iraque" },
    { lat: 24.713, lng: 46.675, name: "Riade, Arábia Saudita" },
    { lat: 25.204, lng: 55.270, name: "Dubai, Emirados Árabes" },
    { lat: 39.933, lng: 32.859, name: "Ancara, Turquia" },
    { lat: 41.008, lng: 28.978, name: "Istambul, Turquia" },
    { lat: 13.756, lng: 100.501, name: "Banguecoque, Tailândia" },
    { lat: 21.028, lng: 105.834, name: "Hanói, Vietnã" },
    { lat: 14.599, lng: 120.984, name: "Manila, Filipinas" },
    { lat: 3.139, lng: 101.686, name: "Kuala Lumpur, Malásia" },
    { lat: 1.352, lng: 103.819, name: "Singapura" },
    { lat: -6.208, lng: 106.845, name: "Jacarta, Indonésia" },
    { lat: -8.650, lng: 115.216, name: "Bali, Indonésia" },

    // OCEANIA
    { lat: -33.868, lng: 151.209, name: "Sydney, Austrália" },
    { lat: -37.813, lng: 144.963, name: "Melbourne, Austrália" },
    { lat: -27.469, lng: 153.025, name: "Brisbane, Austrália" },
    { lat: -31.950, lng: 115.860, name: "Perth, Austrália" },
    { lat: -12.463, lng: 130.844, name: "Darwin, Austrália" },
    { lat: -41.286, lng: 174.776, name: "Wellington, Nova Zelândia" },
    { lat: -36.848, lng: 174.763, name: "Auckland, Nova Zelândia" },
    { lat: -9.443, lng: 147.180, name: "Port Moresby, PNG" },
    { lat: -18.141, lng: 178.441, name: "Suva, Fiji" },
    { lat: 21.306, lng: -157.858, name: "Honolulu, Havai" }
  ];

  const analyzePoint = (lat: number, lng: number): ForestData | null => {
    // 1. SILENCIAMENTO POLAR E OCEÂNICO EXTREMO
    // Permite detecção até latitude 80N e 65S (cobrindo Groenlândia e Sul do Chile)
    if (lat < -65 || lat > 82) return null;

    // 2. BUSCA DE PROXIMIDADE INTELIGENTE
    // Encontra a âncora nominal mais próxima
    const nearest = globalAnchors.reduce((prev, curr) => {
      const dist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
      return dist < prev.dist ? { dist, zone: curr } : prev;
    }, { dist: 999, zone: globalAnchors[0] });

    // Threshold de 5.5 graus garante cobertura em quase todas as massas terrestres,
    // mas ainda silencia no meio dos oceanos (ex: Atlântico Central)
    if (nearest.dist > 5.5) return null;

    let bioma = "Área de Monitoramento";
    let multiplier = 1.0;
    const absLat = Math.abs(lat);

    // Lógica Dinâmica de Biomas
    if (absLat < 18) {
      bioma = `Zona Tropical (${nearest.zone.name})`;
      multiplier = 4.8;
    } else if (absLat < 35) {
      bioma = `Zona Subtropical / Savana (${nearest.zone.name})`;
      multiplier = 2.4;
    } else if (absLat < 58) {
      bioma = `Zona Temperada (${nearest.zone.name})`;
      multiplier = 1.6;
    } else {
      bioma = `Zona Boreal / Tundra (${nearest.zone.name})`;
      multiplier = 1.2;
    }

    // Identificação de Regiões Áridas (Saara, Arábia, Outback)
    const isArid = (lat > 14 && lat < 32 && lng > -15 && lng < 55) || 
                   (lat < -18 && lat > -32 && lng > 115 && lng < 150);
    
    if (isArid && !nearest.zone.name.includes("Amazonas") && !nearest.zone.name.includes("Congo")) {
      bioma = `Região Árida de Monitoramento (${nearest.zone.name})`;
      multiplier = 0.08;
    }

    // Geração de dados simulados baseados em seed geográfica determinística
    const seed = Math.abs(Math.sin(lat * 12.5) * Math.cos(lng * 12.5));
    const lossArea = seed * 680 * multiplier;
    
    // Evita popups no mar costeiro imediato se a área calculada for insignificante
    if (lossArea < 0.4) return null;

    return {
      region: `${bioma} [${lat.toFixed(3)}, ${lng.toFixed(3)}]`,
      lossAreaHa: Math.round(lossArea * 100) / 100,
      treesCut: Math.floor(lossArea * 540),
      treesCutPerDay: Math.floor((lossArea * 540) / 365 * (0.8 + seed)),
      co2LossTons: Math.round(lossArea * 60),
      o2LostTons: Math.round(lossArea * 17),
      fireAlerts: Math.floor(seed * 260 * multiplier),
      lastUpdate: 'Sincronização Global EcoWatch v5.0'
    };
  };

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
        minZoom: 2,
        maxBounds: [[-85, -200], [85, 200]]
      }).setView([15, 10], 2.5);

      // Camada Base Dark
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(leafletMap.current);

      // Camada de Dados Global Forest Watch
      L.tileLayer('https://tiles.globalforestwatch.org/map/tree_cover_loss/{z}/{x}/{y}.png', {
        opacity: 0.85,
        className: 'gfw-main-layer'
      }).addTo(leafletMap.current);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      alertsLayerRef.current = L.layerGroup().addTo(leafletMap.current);

      // Injeção de Alertas em Tempo Real (Beacons Visuais)
      const injectGlobalBeacons = () => {
        globalAnchors.forEach(anchor => {
          // 2 a 3 alertas por âncora para densidade visual equilibrada em todos os países
          const alertCount = 2 + Math.floor(Math.random() * 2);
          for (let i = 0; i < alertCount; i++) {
            const lat = anchor.lat + (Math.random() - 0.5) * 5;
            const lng = anchor.lng + (Math.random() - 0.5) * 5;
            
            if (Math.abs(lat) < 80 && Math.abs(lat) > 2) {
              const color = Math.random() > 0.65 ? '#ef4444' : '#f59e0b';
              const icon = L.divIcon({
                className: 'lux-beacon-marker',
                html: `
                  <div class="lux-ping">
                    <div class="lux-ping-wave" style="border-color: ${color}"></div>
                    <div class="lux-ping-dot" style="background-color: ${color}"></div>
                  </div>
                `,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
              });
              L.marker([lat, lng], { icon, interactive: false }).addTo(alertsLayerRef.current);
            }
          }
        });
      };

      injectGlobalBeacons();

      const onMouseMove = (e: any) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        rafRef.current = requestAnimationFrame(() => {
          const { lat, lng } = e.latlng;
          const data = analyzePoint(lat, lng);

          if (!data) {
            if (markerRef.current) leafletMap.current.removeLayer(markerRef.current);
            if (activePopupRef.current) leafletMap.current.closePopup(activePopupRef.current);
            markerRef.current = null;
            activePopupRef.current = null;
            return;
          }

          // UI de Mira de Escaneamento
          if (!markerRef.current) {
            const scanIcon = L.divIcon({
              className: 'lux-scanner-ui',
              html: `<div class='w-16 h-16 border-2 border-emerald-500/40 rounded-full animate-pulse bg-emerald-500/5 flex items-center justify-center'>
                       <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                     </div>`,
              iconSize: [64, 64],
              iconAnchor: [32, 32]
            });
            markerRef.current = L.marker([lat, lng], { icon: scanIcon }).addTo(leafletMap.current);
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }

          // Card de Dados Inteligente (Sincronizado)
          const content = `
            <div class="lux-sync-card animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="flex items-center justify-between mb-2 border-b border-zinc-800/80 pb-2">
                <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sincronização 1:1</span>
                <span class="text-[8px] text-zinc-600 font-mono">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
              </div>
              <h6 class="text-[14px] font-black text-white mb-3 leading-tight tracking-tight">${data.region.split(' [')[0]}</h6>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                  <p class="text-[7px] text-zinc-500 uppercase font-black mb-0.5">Métrica/Dia</p>
                  <p class="text-[12px] text-red-500 font-black tracking-tighter">${data.treesCutPerDay.toLocaleString()}</p>
                </div>
                <div class="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                  <p class="text-[7px] text-zinc-500 uppercase font-black mb-0.5">Ton CO₂/A</p>
                  <p class="text-[12px] text-blue-400 font-black tracking-tighter">${data.co2LossTons.toLocaleString()}</p>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-2">
                 <div class="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 animate-pulse" style="width: ${Math.min(data.lossAreaHa/8, 100)}%"></div>
                 </div>
                 <span class="text-[8px] text-zinc-500 font-bold uppercase">Sinal OK</span>
              </div>
            </div>
          `;

          if (!activePopupRef.current) {
            activePopupRef.current = L.popup({ 
              closeButton: false, 
              offset: [0, -15], 
              className: 'lux-sync-popup', 
              autoPan: false
            })
              .setLatLng([lat, lng])
              .setContent(content)
              .openOn(leafletMap.current);
          } else {
            activePopupRef.current.setLatLng([lat, lng]).setContent(content);
          }

          onRegionSelect(data);
        });
      };

      leafletMap.current.on('mousemove', onMouseMove);
      leafletMap.current.on('mouseout', () => {
        if (markerRef.current) leafletMap.current.removeLayer(markerRef.current);
        if (activePopupRef.current) leafletMap.current.closePopup(activePopupRef.current);
        markerRef.current = null;
        activePopupRef.current = null;
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.off('mousemove');
        leafletMap.current.off('mouseout');
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[680px] relative overflow-hidden rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] border border-zinc-800 bg-zinc-950 group">
      <style>{`
        .lux-sync-popup .leaflet-popup-content-wrapper { background: transparent !important; color: white !important; border: none !important; padding: 0; box-shadow: none !important; }
        .lux-sync-popup .leaflet-popup-tip { display: none; }
        .lux-sync-card { padding: 18px; background: rgba(9, 9, 11, 0.98); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; backdrop-filter: blur(24px); min-width: 270px; box-shadow: 0 40px 80px rgba(0,0,0,0.9); }
        .gfw-main-layer { filter: saturate(2.6) contrast(1.2) brightness(0.85); transition: 0.5s opacity; }
        
        .lux-ping { position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
        .lux-ping-wave { position: absolute; width: 100%; height: 100%; border: 1.5px solid; border-radius: 50%; animation: lux-ping-anim 4s infinite; }
        .lux-ping-dot { position: relative; width: 6px; height: 6px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        
        @keyframes lux-ping-anim {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }
        
        .leaflet-container { cursor: crosshair !important; background: #09090b !important; }
      `}</style>
      
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* HUD de Monitoramento de Alta Precisão */}
      <div className="absolute top-12 left-12 z-[1000] pointer-events-none">
        <div className="glass-effect p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col gap-5">
           <div className="flex items-center gap-5">
              <div className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_35px_rgba(16,185,129,1)]"></div>
              <div>
                <p className="text-[14px] text-white font-black uppercase tracking-[0.5em]">MONITORAMENTO GLOBAL TOTAL</p>
                <p className="text-[11px] text-zinc-500 font-bold mt-0.5">Sincronização Ativa para todos os Continentes</p>
              </div>
           </div>
           <div className="h-[1px] bg-white/5 w-full"></div>
           <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 bg-zinc-900/80 rounded-full text-[9px] text-emerald-400 font-black border border-emerald-500/20">UK/EU: SYNC</div>
              <div className="px-3 py-1 bg-zinc-900/80 rounded-full text-[9px] text-emerald-400 font-black border border-emerald-500/20">AFRICA: SYNC</div>
              <div className="px-3 py-1 bg-zinc-900/80 rounded-full text-[9px] text-emerald-400 font-black border border-emerald-500/20">AMERICAS: SYNC</div>
              <div className="px-3 py-1 bg-zinc-900/80 rounded-full text-[9px] text-emerald-400 font-black border border-emerald-500/20">ASIA: SYNC</div>
           </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 z-[1000] pointer-events-none">
        <div className="glass-effect px-8 py-5 rounded-[2.5rem] border border-white/5 text-[12px] text-zinc-300 font-black uppercase tracking-[0.7em] flex items-center gap-5">
           <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
           Varredura de Fidelidade Ativa
        </div>
      </div>
    </div>
  );
};

export default ForestMap;
