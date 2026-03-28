import React from 'react'

const HeroBanner = () => {
  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '0 0 32px 32px' }}>
      <style>{`
        @keyframes carMove1 { 0% { transform: translateX(-220px); } 100% { transform: translateX(1400px); } }
        @keyframes carMove2 { 0% { transform: translateX(-180px); } 100% { transform: translateX(1400px); } }
        @keyframes carMove3 { 0% { transform: translateX(-200px); } 100% { transform: translateX(1400px); } }
        @keyframes cloudDrift { 0% { transform: translateX(0); } 100% { transform: translateX(-120px); } }
        @keyframes waterShimmer { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes lightPulse { 0%,100% { opacity: 0.15; } 50% { opacity: 0.35; } }
        @keyframes titleFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes subtitleFade { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes seagull { 0%,100% { d: path("M0,0 Q4,-3 8,0 Q12,-3 16,0"); } 50% { d: path("M0,2 Q4,-2 8,2 Q12,-2 16,2"); } }
        @keyframes wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        @keyframes wave2 { 0% { transform: translateX(0); } 100% { transform: translateX(-160px); } }
        @keyframes lampBlink { 0%,100% { opacity:1; } 90% { opacity:0.85; } }

        .car-1 { animation: carMove1 7s linear infinite; }
        .car-2 { animation: carMove2 9.5s linear infinite 3s; }
        .car-3 { animation: carMove3 6s linear infinite 1.5s; }
        .cloud-a { animation: cloudDrift 40s linear infinite; }
        .cloud-b { animation: cloudDrift 55s linear infinite 10s; }
        .water-anim { animation: waterShimmer 3s ease-in-out infinite; }
        .light-beam { animation: lightPulse 4s ease-in-out infinite; }
        .banner-title { animation: titleFade 1.2s ease forwards; }
        .banner-sub { animation: subtitleFade 1.2s 0.3s ease both; }
        .wave-1 { animation: wave1 6s linear infinite; }
        .wave-2 { animation: wave2 8s linear infinite 2s; }
        .lamp-glow { animation: lampBlink 3s ease-in-out infinite; }
      `}</style>

      <svg
        width="100%"
        viewBox="0 0 1200 480"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* ── SKY GRADIENT ── */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="40%" stopColor="#1A2E55" />
            <stop offset="75%" stopColor="#2A4A7F" />
            <stop offset="100%" stopColor="#3D6B9C" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A4A7A" />
            <stop offset="100%" stopColor="#0A1E38" />
          </linearGradient>
          <linearGradient id="bridgeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8BA3BE" />
            <stop offset="100%" stopColor="#4A6278" />
          </linearGradient>
          <linearGradient id="buildL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C2E4A" />
            <stop offset="100%" stopColor="#0E1B30" />
          </linearGradient>
          <linearGradient id="buildR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243550" />
            <stop offset="100%" stopColor="#111E35" />
          </linearGradient>
          <linearGradient id="moonGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFF8DC" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="moonRad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF5C0" />
            <stop offset="100%" stopColor="#FFE680" />
          </radialGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C3E52" />
            <stop offset="100%" stopColor="#1A2838" />
          </linearGradient>
          <linearGradient id="waterRefl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2060AA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="sceneClip">
            <rect x="0" y="0" width="1200" height="480"/>
          </clipPath>
        </defs>

        <g clipPath="url(#sceneClip)">

          {/* ── SKY ── */}
          <rect x="0" y="0" width="1200" height="480" fill="url(#skyGrad)" />

          {/* ── MOON ── */}
          <circle cx="960" cy="70" r="55" fill="#FFF5C0" opacity="0.12" filter="url(#softglow)" />
          <circle cx="960" cy="70" r="34" fill="url(#moonRad)" />
          <circle cx="948" cy="62" r="22" fill="#FFE050" opacity="0.4" />

          {/* ── STARS ── */}
          {[
            [80,40],[160,25],[240,55],[320,30],[420,45],[500,20],[600,38],[700,28],[820,50],[880,30],
            [100,90],[200,75],[350,85],[470,95],[550,70],[640,88],[750,60],[900,80],[1050,35],[1130,60],
            [130,15],[280,10],[490,8],[720,18],[1000,12],[1150,22]
          ].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="#FFF" opacity={0.4+Math.random()*0.5} />
          ))}

          {/* ── CLOUDS ── */}
          <g className="cloud-a" opacity="0.12">
            <ellipse cx="200" cy="95" rx="90" ry="28" fill="#8AACCC"/>
            <ellipse cx="260" cy="82" rx="60" ry="24" fill="#A0BDD6"/>
            <ellipse cx="140" cy="100" rx="50" ry="18" fill="#8AACCC"/>
          </g>
          <g className="cloud-b" opacity="0.09">
            <ellipse cx="750" cy="75" rx="110" ry="30" fill="#8AACCC"/>
            <ellipse cx="820" cy="62" rx="70" ry="26" fill="#A0BDD6"/>
          </g>

          {/* ── DISTANT CITY GLOW ── */}
          <ellipse cx="600" cy="220" rx="500" ry="60" fill="#3A5A8A" opacity="0.25" />

          {/* ══ BUILDINGS LEFT SIDE ══ */}
          {/* Tallest tower */}
          <rect x="0" y="30" width="72" height="310" fill="url(#buildL)" />
          <rect x="4" y="30" width="64" height="310" fill="#1A2E4A" />
          {/* Antenna */}
          <rect x="34" y="15" width="4" height="20" fill="#4A6278" />
          <circle cx="36" cy="13" r="3" fill="#FF4444" opacity="0.9" filter="url(#glow)" />
          {/* Windows left tower */}
          {Array.from({length:18}, (_,row) => Array.from({length:4}, (_,col) => (
            <rect key={`wl1-${row}-${col}`} x={9+col*15} y={40+row*15} width={9} height={9}
              fill={Math.random()>0.35 ? '#FFE090' : Math.random()>0.5 ? '#90C8FF' : '#1A2E4A'}
              opacity={0.7+Math.random()*0.3}
            />
          )))}

          {/* Medium building */}
          <rect x="75" y="95" width="55" height="245" fill="url(#buildL)" />
          {Array.from({length:12}, (_,row) => Array.from({length:3}, (_,col) => (
            <rect key={`wl2-${row}-${col}`} x={80+col*16} y={105+row*17} width={10} height={11}
              fill={Math.random()>0.4 ? '#FFE090' : '#1A2E4A'} opacity={0.65}
            />
          )))}

          {/* Short building */}
          <rect x="133" y="155" width="40" height="185" fill="#1C2E45" />
          {Array.from({length:8}, (_,row) => Array.from({length:2}, (_,col) => (
            <rect key={`wl3-${row}-${col}`} x={138+col*16} y={165+row*18} width={10} height={11}
              fill={Math.random()>0.5 ? '#FFE090' : '#1A2E4A'} opacity={0.6}
            />
          )))}

          {/* ══ BUILDINGS RIGHT SIDE ══ */}
          {/* Giant right tower */}
          <rect x="1120" y="20" width="80" height="320" fill="url(#buildR)" />
          <rect x="1124" y="20" width="72" height="320" fill="#1E2E48" />
          <rect x="1156" y="8" width="6" height="16" fill="#4A6278" />
          <circle cx="1159" cy="6" r="3.5" fill="#FF4444" opacity="0.9" filter="url(#glow)" />
          {Array.from({length:20}, (_,row) => Array.from({length:4}, (_,col) => (
            <rect key={`wr1-${row}-${col}`} x={1127+col*16} y={28+row*14} width={10} height={9}
              fill={Math.random()>0.3 ? '#FFE090' : Math.random()>0.5 ? '#90C8FF' : '#1A2E4A'}
              opacity={0.7}
            />
          )))}

          {/* Mid-right tower */}
          <rect x="1040" y="70" width="65" height="270" fill="url(#buildR)" />
          {Array.from({length:14}, (_,row) => Array.from({length:3}, (_,col) => (
            <rect key={`wr2-${row}-${col}`} x={1045+col*18} y={80+row*16} width={11} height={11}
              fill={Math.random()>0.4 ? '#FFE090' : '#1A2E4A'} opacity={0.65}
            />
          )))}

          {/* Slim right building */}
          <rect x="990" y="120" width="44" height="220" fill="#1C2A44" />
          {Array.from({length:10}, (_,row) => Array.from({length:2}, (_,col) => (
            <rect key={`wr3-${row}-${col}`} x={995+col*18} y={130+row*18} width={11} height={12}
              fill={Math.random()>0.5 ? '#FFE090' : '#1A2E4A'} opacity={0.6}
            />
          )))}

          {/* ══ OCEAN / BEACH ══ */}
          <rect x="0" y="345" width="1200" height="135" fill="url(#seaGrad)" />

          {/* Beach strip */}
          <path d="M0,345 Q300,338 600,342 Q900,346 1200,340 L1200,365 Q900,362 600,358 Q300,362 0,360 Z" fill="#C8A96A" opacity="0.55" />

          {/* Water shimmer */}
          <g className="water-anim">
            <path d="M0,365 Q150,358 300,365 Q450,372 600,365 Q750,358 900,365 Q1050,372 1200,365 L1200,390 Q1050,382 900,375 Q750,382 600,375 Q450,382 300,375 Q150,382 0,390Z"
              fill="url(#waterRefl)" />
          </g>

          {/* Waves */}
          <g className="wave-1">
            <path d="M-200,400 Q-100,395 0,400 Q100,405 200,400 Q300,395 400,400 Q500,405 600,400 Q700,395 800,400 Q900,405 1000,400 Q1100,395 1200,400 Q1300,405 1400,400"
              fill="none" stroke="#5AADDF" strokeWidth="2" opacity="0.35" />
          </g>
          <g className="wave-2">
            <path d="M-200,420 Q-100,415 0,420 Q100,425 200,420 Q300,415 400,420 Q500,425 600,420 Q700,415 800,420 Q900,425 1000,420 Q1100,415 1200,420 Q1300,425 1400,420"
              fill="none" stroke="#5AADDF" strokeWidth="1.5" opacity="0.25" />
          </g>

          {/* Water reflections (building lights) */}
          <rect x="30" y="380" width="4" height="60" fill="#FFE090" opacity="0.12" />
          <rect x="46" y="390" width="3" height="50" fill="#90C8FF" opacity="0.1" />
          <rect x="1155" y="375" width="4" height="65" fill="#FFE090" opacity="0.12" />
          <rect x="1141" y="385" width="3" height="55" fill="#FFE090" opacity="0.1" />

          {/* Moon reflection */}
          <ellipse cx="960" cy="430" rx="40" ry="10" fill="#FFE680" opacity="0.18" />
          <rect x="956" y="370" width="8" height="60" fill="#FFE680" opacity="0.1" />

          {/* ══ BRIDGE STRUCTURE ══ */}
          {/* Main road deck */}
          <rect x="0" y="310" width="1200" height="38" fill="url(#roadGrad)" />
          <rect x="0" y="310" width="1200" height="3" fill="#4A6A8A" opacity="0.6" />
          <rect x="0" y="345" width="1200" height="3" fill="#2A3A52" opacity="0.8" />

          {/* Road lane markings */}
          {Array.from({length:30}, (_,i) => (
            <rect key={`lane-${i}`} x={i*42} y={326} width={22} height={3} fill="#FFD700" opacity="0.45" />
          ))}
          {Array.from({length:30}, (_,i) => (
            <rect key={`edge-${i}`} x={i*42} y={330} width={22} height={1.5} fill="#FFF" opacity="0.2" />
          ))}

          {/* Sidewalk edges */}
          <rect x="0" y="310" width="1200" height="7" fill="#3A4E65" />
          <rect x="0" y="341" width="1200" height="4" fill="#3A4E65" />

          {/* Bridge support towers */}
          {[200, 600, 1000].map((x, i) => (
            <g key={`tower-${i}`}>
              {/* Tower main */}
              <rect x={x-10} y={160} width={20} height={155} fill="url(#bridgeGrad)" />
              <rect x={x-12} y={155} width={24} height={10} rx="2" fill="#7A9AB8" />
              <rect x={x-8} y={152} width={16} height={6} rx="1" fill="#8AACC8" />
              {/* Tower light */}
              <circle cx={x} cy={150} r="4" fill="#FFE090" opacity="0.9" filter="url(#glow)" />
              {/* Cables */}
              {[-5,-3,-1,1,3,5].map((offset, j) => (
                <g key={`cable-${i}-${j}`}>
                  <line x1={x} y1={152} x2={x + offset*40} y2={310}
                    stroke="#6A8AA8" strokeWidth="0.8" opacity="0.5" />
                  <line x1={x} y1={152} x2={x - offset*40} y2={310}
                    stroke="#6A8AA8" strokeWidth="0.8" opacity="0.5" />
                </g>
              ))}
            </g>
          ))}

          {/* Bridge lamp posts */}
          {Array.from({length:16}, (_,i) => (
            <g key={`lamp-${i}`} className="lamp-glow">
              <rect x={50+i*75} y={298} width={3} height={15} fill="#7A9AB8" />
              <circle cx={51.5+i*75} cy={296} r="5" fill="#FFE8A0" opacity="0.85" filter="url(#glow)" />
              {/* Light cone */}
              <path d={`M${46.5+i*75},299 L${36.5+i*75},320 L${66.5+i*75},320 L${56.5+i*75},299Z`}
                fill="#FFE090" opacity="0.06" />
            </g>
          ))}

          {/* ══ CARS ══ */}
          {/* Car 1 - Red sports car */}
          <g className="car-1">
            <g transform="translate(0, 295)">
              {/* Body */}
              <rect x="0" y="6" width="80" height="18" rx="4" fill="#CC2200" />
              <path d="M12,6 Q20,0 35,0 L60,0 Q72,0 75,6Z" fill="#E03010" />
              {/* Windows */}
              <rect x="22" y="1" width="16" height="8" rx="2" fill="#A8D0E8" opacity="0.85" />
              <rect x="42" y="1" width="16" height="8" rx="2" fill="#A8D0E8" opacity="0.85" />
              {/* Wheels */}
              <circle cx="18" cy="24" r="7" fill="#1A1A1A" />
              <circle cx="18" cy="24" r="4" fill="#444" />
              <circle cx="62" cy="24" r="7" fill="#1A1A1A" />
              <circle cx="62" cy="24" r="4" fill="#444" />
              {/* Headlights */}
              <rect x="74" y="9" width="7" height="5" rx="1" fill="#FFFACC" opacity="0.95" filter="url(#glow)" />
              {/* Tail lights */}
              <rect x="0" y="9" width="5" height="5" rx="1" fill="#FF2200" opacity="0.9" />
              {/* Detail */}
              <rect x="5" y="12" width="60" height="2" fill="#FF4422" opacity="0.4" />
            </g>
          </g>

          {/* Car 2 - White SUV */}
          <g className="car-2">
            <g transform="translate(0, 290)">
              <rect x="0" y="4" width="95" height="22" rx="5" fill="#D8DDE5" />
              <path d="M8,4 Q16,0 30,0 L70,0 Q82,2 85,4Z" fill="#E8ECF2" />
              <rect x="0" y="3" width="95" height="4" fill="#C5CDD8" opacity="0.5" />
              <rect x="18" y="0" width="20" height="8" rx="2" fill="#A8C8E0" opacity="0.8" />
              <rect x="44" y="0" width="20" height="8" rx="2" fill="#A8C8E0" opacity="0.8" />
              <circle cx="20" cy="26" r="8" fill="#1A1A1A" /><circle cx="20" cy="26" r="4.5" fill="#444" />
              <circle cx="75" cy="26" r="8" fill="#1A1A1A" /><circle cx="75" cy="26" r="4.5" fill="#444" />
              <rect x="88" y="8" width="8" height="6" rx="1" fill="#FFFACC" opacity="0.9" filter="url(#glow)" />
              <rect x="0" y="8" width="6" height="5" rx="1" fill="#FF3300" opacity="0.85" />
              {/* Roof rack */}
              <rect x="20" y="-1" width="52" height="2" rx="1" fill="#AAB4C0" />
            </g>
          </g>

          {/* Car 3 - Black luxury sedan */}
          <g className="car-3">
            <g transform="translate(0, 297)">
              <rect x="0" y="5" width="88" height="19" rx="5" fill="#1A1A2E" />
              <path d="M14,5 Q22,0 38,0 L62,0 Q74,0 78,5Z" fill="#252540" />
              <rect x="22" y="0" width="18" height="8" rx="2" fill="#90B8D0" opacity="0.75" />
              <rect x="46" y="0" width="18" height="8" rx="2" fill="#90B8D0" opacity="0.75" />
              <circle cx="18" cy="24" r="7" fill="#0A0A12" /><circle cx="18" cy="24" r="4" fill="#333" />
              <circle cx="70" cy="24" r="7" fill="#0A0A12" /><circle cx="70" cy="24" r="4" fill="#333" />
              <rect x="82" y="8" width="7" height="5" rx="1" fill="#FFFACC" opacity="0.95" filter="url(#glow)" />
              <rect x="0" y="8" width="5" height="5" rx="1" fill="#FF2200" opacity="0.9" />
              {/* Chrome strip */}
              <rect x="4" y="13" width="72" height="1.5" fill="#8090A8" opacity="0.5" />
            </g>
          </g>

          {/* ══ OVERLAY GRADIENT (depth) ══ */}
          <rect x="0" y="0" width="200" height="480" fill="url(#buildL)" opacity="0.55" />
          <rect x="1000" y="0" width="200" height="480" fill="url(#buildR)" opacity="0.55" />

          {/* ══ TEXT OVERLAY ══ */}
          <g className="banner-title">
            <text
              x="600" y="175"
              textAnchor="middle"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="96"
              letterSpacing="10"
              fill="#FFFFFF"
              opacity="0.97"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }}
            >
              HPOWER
            </text>
            <text
              x="600" y="220"
              textAnchor="middle"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="36"
              letterSpacing="18"
              fill="#FF4D4D"
              opacity="0.95"
              style={{ filter: 'drop-shadow(0 2px 12px rgba(255,77,77,0.5))' }}
            >
              CAR RENTAL
            </text>
          </g>
          <g className="banner-sub">
            <text
              x="600" y="258"
              textAnchor="middle"
              fontFamily="'DM Sans', sans-serif"
              fontSize="16"
              letterSpacing="3"
              fill="rgba(255,255,255,0.7)"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
            >
              MANEJA LA EXPERIENCIA QUE MERECES
            </text>
          </g>

        </g>
      </svg>
    </div>
  )
}

export default HeroBanner
