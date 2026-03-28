import React from 'react'

const HeroBanner = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '480px', 
      position: 'relative', 
      overflow: 'hidden', 
      borderRadius: '0 0 32px 32px',
      background: '#000'
    }}>
      {/* Background Image */}
      <img 
        src="/assets/images/hero_banner_golden.png" 
        alt="HPOWER Hero Banner"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* Subtle Overlay to ensure text legibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
        zIndex: 1
      }} />

      {/* TEXT OVERLAY */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          animation: 'titleFade 1.2s ease forwards',
        }}>
          <style>{`
            @keyframes titleFade { 
              0% { opacity: 0; transform: translateY(20px); } 
              100% { opacity: 1; transform: translateY(0); } 
            }
          `}</style>
          
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '96px',
            letterSpacing: '12px',
            color: '#FFFFFF',
            margin: 0,
            lineHeight: '1',
            textShadow: '0 4px 24px rgba(0,0,0,0.6)'
          }}>
            HPOWER
          </h1>
          
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '38px',
            letterSpacing: '18px',
            color: '#FF4D4D',
            margin: '10px 0 20px',
            lineHeight: '1',
            textShadow: '0 2px 12px rgba(255,77,77,0.4)'
          }}>
            CAR RENTAL
          </h2>
          
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            letterSpacing: '4px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            textTransform: 'uppercase',
            fontWeight: '500',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            MANEJA LA EXPERIENCIA QUE MERECES
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
