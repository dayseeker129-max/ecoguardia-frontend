import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

// Esto crea un acceso directo a tu servidor
const api = axios.create({
  baseURL: "https://ecoguardia-backend.onrender.com/api"
});

// ESTO ES LO QUE AGREGASTE (El interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [selectedImpact, setSelectedImpact] = useState(null);
  // ... el resto de tus estados siguen aquí abajo
  const [showDonate, setShowDonate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("Mi Impacto Social"); // Actualizado para coincidir con el nuevo nombre
  const [isPendingImpact, setIsPendingImpact] = useState(false);

  const [flipCard, setFlipCard] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", date: "", cvv: "" });
  const [tipoTarjeta, setTipoTarjeta] = useState("");
  const [amount, setAmount] = useState("");

  const [projects, setProjects] = useState({
    oceanos: {
      titulo: "Conservación Marina",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
      recaudado: 12500,
      areas: { texto: "Operamos en arrecifes del Caribe y costas del Pacífico.", foto: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000" },
      animales: { texto: "Protección de la Tortuga Carey y Corales.", foto: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?q=80&w=1000" },
      ayuda: { texto: "Limpieza de microplásticos y boyas de monitoreo.", foto: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1000" }
    },
    bosques: {
      titulo: "Reforestación Activa",
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000",
      recaudado: 85000,
      areas: { texto: "Reforestación en la Selva Lacandona y Amazonas.", foto: "https://images.unsplash.com/photo-1511497584788-8767fe771d21?q=80&w=1000" },
      animales: { texto: "Hábitat del Jaguar y el Quetzal.", foto: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1000" },
      ayuda: { texto: "Viveros comunitarios y brigadas contra incendios.", foto: "https://images.unsplash.com/photo-1464241353224-c62650703591?q=80&w=1000" }
    },
    fauna: {
      titulo: "Protección de Especies",
      img: "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?q=80&w=1000",
      recaudado: 1200,
      areas: { texto: "Reservas biológicas protegidas y santuarios.", foto: "https://images.unsplash.com/photo-1516422291022-b0582b97256c?q=80&w=1000" },
      animales: { texto: "Lobo Mexicano y Águila Real.", foto: "https://images.unsplash.com/photo-1611689225620-3e70248bc0f0?q=80&w=1000" },
      ayuda: { texto: "Rastreo satelital y medicina veterinaria silvestre.", foto: "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?q=80&w=1000" }
    }
  });

  const [authData, setAuthData] = useState({ name: "", email: "", pass: "", captchaInput: "" });
  const [captchaCode, setCaptchaCode] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setCaptchaCode(code);
  };

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAuthAction = async () => {
    setAuthError("");
    
    try {
      if (isLogin) {
        // Petición al endpoint de LOGIN que me pasaste
        const response = await api.post("/auth/login", {
          email: authData.email,
          pass: authData.pass
        });

        // Extraemos el token y los datos que configuraste en tu backend
        const { token, user: userData } = response.data;
        
        setUser(userData);
        localStorage.setItem("token", token); // Guardamos el token para futuras peticiones
        localStorage.setItem("user", JSON.stringify(userData));
        setShowAuth(false);

      } else {
        // Petición al endpoint de REGISTER
        if (!authData.name || !authData.email || !authData.pass) { 
          setAuthError("Llena todos los campos."); 
          return; 
        }
        if (authData.captchaInput !== captchaCode) { 
          setAuthError("Captcha incorrecto."); 
          generateCaptcha(); 
          return; 
        }

        const response = await api.post("/auth/register", {
          name: authData.name,
          email: authData.email,
          pass: authData.pass
        });

        alert("✅ " + response.data.msg);
        setIsLogin(true); // Lo movemos automáticamente a la pestaña de "Entrar"
      }
    } catch (error) {
      // Si el backend responde con un error (ej. "Usuario ya existe"), lo mostramos aquí
      const mensaje = error.response?.data?.msg || "Error de conexión";
      setAuthError(mensaje);
    }
  };

  const validarTarjetaReal = (num) => {
    let nCheck = 0, bEven = false;
    num = num.replace(/\D/g, "");
    if (num.length < 13 || num.length > 19) return false;
    for (var n = num.length - 1; n >= 0; n--) {
      var cDigit = num.charAt(n), nDigit = parseInt(cDigit, 10);
      if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
      nCheck += nDigit;
      bEven = !bEven;
    }
    return (nCheck % 10) === 0;
  };

  const handleDonacionExitosa = () => {
    // 1. Verificar sesión primero
    if (!user) {
        alert("❌ Debes iniciar sesión para realizar una donación.");
        setShowAuth(true);
        setShowDonate(false);
        return;
    }
    
    if (!amount || amount <= 0) { alert("❌ Ingresa un monto válido."); return; }
    if (!validarTarjetaReal(card.number)) { alert("❌ El número de tarjeta no es válido (Algoritmo de Luhn)."); return; }
    if (!card.date.includes("/") || card.date.length < 5) { alert("❌ Revisa la fecha (MM/YY)."); return; }
    if (card.cvv.length < 3) { alert("❌ El CVV debe tener 3 dígitos."); return; }

    setIsPendingImpact(true);
    alert(`✅ Pago de $${amount} procesado con éxito. ¡Elige el proyecto abajo!`);
    setShowDonate(false);
    setCard({ number: "", name: "", date: "", cvv: "" });
    setTipoTarjeta("");
    setTimeout(() => goTo("impacto"), 500);
  };

  const asignarDonacion = (proyectoId) => {
    const montoNum = parseFloat(amount);
    setProjects(prev => ({
      ...prev,
      [proyectoId]: { ...prev[proyectoId], recaudado: prev[proyectoId].recaudado + montoNum }
    }));
    alert(`❤️ ¡Gracias! $${amount} sumados a ${projects[proyectoId].titulo}`);
    setIsPendingImpact(false);
    setAmount("");
  };

  return (
    <div className="main-wrapper">
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => window.scrollTo(0,0)}>
            <span className="brand-dot"></span><h1>EcoGuardian</h1>
          </div>
          <div className="nav-menu">
            <button onClick={() => goTo("nuestra-mision")}>Nosotros</button>
            <button onClick={() => goTo("impacto")}>Impacto</button>
            <button onClick={() => goTo("dashboard")}>Estadísticas</button>
            <div className="nav-divider"></div>
            {user ? (
              <div className="user-profile-nav" onClick={() => {localStorage.removeItem("user"); setUser(null);}} style={{cursor: 'pointer'}}>
                <div className="avatar">{user.name.substring(0,2).toUpperCase()}</div><span>{user.name}</span>
              </div>
            ) : <button className="btn-auth-outline" onClick={() => setShowAuth(true)}>Acceder</button>}
            <button className="btn-primary-gradient" onClick={() => setShowDonate(true)}>Contribuir</button>
          </div>
        </div>
      </nav>

      <header className="premium-hero">
        <div className="hero-shape"></div>
        <div className="hero-inner">
          <span className="badge-new">Impacto 2026</span>
          <h2>Inversión Ética para un <br/><span>Planeta Sostenible</span></h2>
          <p>Tus donaciones actualizan nuestras métricas de conservación al instante.</p>
          <div className="hero-actions">
            <button className="btn-main" onClick={() => goTo("impacto")}>Explorar Proyectos</button>
          </div>
        </div>
      </header>

      // CAMBIA LOS VALORES POR ESTOS:
<section id="nuestra-mision" style={{
  padding: window.innerWidth < 768 ? '40px 15px' : '80px 20px', 
  background: '#fff'
}}>
  <div style={{maxWidth: '1100px', margin: '0 auto'}}>
    {/* El grid auto-fit que ya tienes está bien, pero asegúrate del gap */}
    <div style={{
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: window.innerWidth < 768 ? '20px' : '50px', 
      alignItems: 'center'
    }}>
            <div>
              <span style={{color: '#10b981', fontWeight: 'bold', letterSpacing: '1px'}}>NUESTRA HISTORIA</span>
              <h2 style={{fontSize: '2.5rem', color: '#1e293b', margin: '15px 0'}}>¿Por qué empezamos?</h2>
              <p style={{color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem'}}>
                EcoGuardian nació de una frustración compartida: la falta de transparencia en las donaciones ambientales.
                En 2024, decidimos crear una plataforma donde cada centavo pudiera rastrearse en tiempo real.
                Empezamos con un pequeño vivero y hoy protegemos miles de hectáreas gracias a personas como tú.
              </p>
              <div style={{marginTop: '30px', borderLeft: '4px solid #10b981', paddingLeft: '20px'}}>
                <h4 style={{margin: '0', color: '#1e293b'}}>Nuestra Misión</h4>
                <p style={{fontStyle: 'italic', color: '#64748b'}}>"Garantizar que la tecnología y la generosidad humana trabajen juntas para regenerar la biodiversidad del planeta con transparencia absoluta."</p>
              </div>
            </div>
            <div style={{position: 'relative'}}>
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000" alt="Mision" style={{width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
              <div style={{position: 'absolute', bottom: '-20px', right: '-20px', background: '#10b981', color: 'white', padding: '20px', borderRadius: '15px', fontWeight: 'bold'}}>
                +500 Proyectos <br/> Completados
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="impacto" className="impact-section">
        {isPendingImpact && (
          <div className="impact-selection-banner" style={{background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px', border: '2px dashed #10b981'}}>
            <h3 style={{color: '#10b981'}}>🌟 Donación lista: Selecciona el destino de tus ${amount}</h3>
          </div>
        )}
        {!selectedImpact ? (
          <div className="impact-cards-grid">
            {Object.entries(projects).map(([key, info]) => (
              <div key={key} className="modern-card" onClick={() => isPendingImpact ? asignarDonacion(key) : setSelectedImpact(key)}>
                <div className="card-image-wrapper"><img src={info.img} alt={info.titulo} /></div>
                <div className="card-body">
                  <h3>{info.titulo}</h3>
                  <span className="card-metrica" style={{color: '#10b981', fontWeight: 'bold'}}>
                    {info.recaudado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                  {isPendingImpact && <button className="btn-primary-gradient" style={{width: '100%', marginTop: '10px'}}>Asignar aquí</button>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-view-container" style={{padding: '20px'}}>
            <button className="btn-back-soft" onClick={() => setSelectedImpact(null)}>← Regresar</button>
            <h2 style={{textAlign: 'center', marginTop: '10px'}}>{projects[selectedImpact].titulo}</h2>
            
            <div className="chart-card" style={{background: 'white', padding: '20px', borderRadius: '15px', margin: '20px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <h3>Histórico de Impacto</h3>
                <div className="visual-chart-placeholder" style={{display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px', marginTop: '10px'}}>
                    {[40, 60, 45, 90, 75, 85, 60].map((h, i) => (
                        <div key={i} style={{flex: 1, background: '#10b981', height: `${h}%`, borderRadius: '4px'}}></div>
                    ))}
                </div>
                <p style={{marginTop: '15px', fontWeight: 'bold', color: '#10b981'}}>Total Recaudado: ${projects[selectedImpact].recaudado.toLocaleString()}</p>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px'}}>
                <div style={{background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                    <img src={projects[selectedImpact].areas.foto} style={{width: '100%', height: '150px', objectFit: 'cover'}} alt="Areas"/>
                    <div style={{padding: '15px'}}>
                        <h4>📍 Áreas de Trabajo</h4>
                        <p style={{fontSize: '0.9rem'}}>{projects[selectedImpact].areas.texto}</p>
                    </div>
                </div>
                <div style={{background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                    <img src={projects[selectedImpact].animales.foto} style={{width: '100%', height: '150px', objectFit: 'cover'}} alt="Animales"/>
                    <div style={{padding: '15px'}}>
                        <h4>🐾 Animales Protegidos</h4>
                        <p style={{fontSize: '0.9rem'}}>{projects[selectedImpact].animales.texto}</p>
                    </div>
                </div>
                <div style={{background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                    <img src={projects[selectedImpact].ayuda.foto} style={{width: '100%', height: '150px', objectFit: 'cover'}} alt="Ayuda"/>
                    <div style={{padding: '15px'}}>
                        <h4>💰 Destino del Dinero</h4>
                        <p style={{fontSize: '0.9rem'}}>{projects[selectedImpact].ayuda.texto}</p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </section>

      <section id="dashboard" className="dashboard-section-premium" style={{background: '#f1f5f9', padding: '100px 20px'}}>
        {(() => {
          const tabData = {
            "Cursos Completados": {
              subtitulo: "Progreso de tu formación académica",
              foto: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400",
              metrica1: { label: "Módulos Teóricos", val: "12 / 15", icon: "📚" },
              metrica2: { label: "Promedio Global", val: "9.8/10", icon: "⭐" },
              metrica3: { label: "Diplomas", val: "3 Digitales", icon: "📜" },
              footer: "🎯 Objetivo: Completa 3 módulos para el certificado de 'Ecología Aplicada'."
            },
            "Próximas Expediciones": {
              subtitulo: "Tus salidas programadas al campo",
              foto: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=400",
              metrica1: { label: "Salidas este mes", val: "2 Viajes", icon: "🥾" },
              metrica2: { label: "Horas de Campo", val: "48.5 Horas", icon: "🌍" },
              metrica3: { label: "Grupo Asignado", val: "Alfa-9", icon: "👥" },
              footer: "📍 Siguiente parada: Reserva de la Biósfera el próximo lunes 8:00 AM."
            },
            "Bóveda de Recompensas": {
              subtitulo: "Beneficios por tu impacto positivo",
              foto: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400",
              metrica1: { label: "Puntos Eco", val: "4,500 pts", icon: "🪙" },
              metrica2: { label: "Insignias", val: "8 Bronce", icon: "🎖️" },
              metrica3: { label: "Descuentos", val: "15% Tienda", icon: "🛍️" },
              footer: "🎁 ¡Canjea 500 puntos más por un kit de herramientas de reforestación!"
            }
          };

          const current = tabData[activeTab] || tabData["Cursos Completados"];

          return (
            <div className="dashboard-wrapper" style={{maxWidth: '1150px', margin: '0 auto', background: '#fff', borderRadius: '25px', display: 'flex', minHeight: '550px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
              
              {/* BARRA LATERAL */}
              // BUSCA ESTA LÍNEA Y REEMPLÁZALA:
<div className="dashboard-wrapper" style={{
  maxWidth: '1150px', 
  margin: '0 auto', 
  background: '#fff', 
  borderRadius: '25px', 
  display: 'flex', 
  flexDirection: window.innerWidth < 768 ? 'column' : 'row', // <--- CAMBIO CLAVE
  minHeight: 'auto', // <--- CAMBIO CLAVE
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  overflow: 'hidden'
}}>

  {/* BARRA LATERAL: Cambia width fixed por 100% en móvil */}
  <div className="dash-sidebar" style={{
    width: window.innerWidth < 768 ? '100%' : '280px', // <--- CAMBIO CLAVE
    background: '#0f172a', 
    padding: '20px', 
    color: '#f8fafc'
  }}>
                    </div>
                
              </div>

              {/* CONTENIDO PRINCIPAL DINÁMICO */}
              <div className="dash-main-content" style={{flex: '1', padding: '60px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px'}}>
                  <div>
                    <h2 style={{fontSize: '2rem', color: '#1e293b', fontWeight: '800'}}>{activeTab}</h2>
                    <p style={{color: '#64748b', marginTop: '8px'}}>{current.subtitulo}</p>
                  </div>
                  <img src={current.foto} alt="Contexto" style={{width: '75px', height: '75px', borderRadius: '18px', objectFit: 'cover', transform: 'rotate(-3deg)', border: '4px solid #fff', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                </div>
                
                <div className="metrics-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px'}}>
                    <div className="metric-card" style={{padding: '25px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9'}}>
                      <span style={{fontSize: '1.5rem'}}>{current.metrica1.icon}</span>
                      <div style={{color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginTop: '10px'}}>{current.metrica1.label}</div>
                      <div style={{fontSize: '1.7rem', fontWeight: 'bold', color: '#0f172a', marginTop: '5px'}}>{current.metrica1.val}</div>
                    </div>
                    <div className="metric-card" style={{padding: '25px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9'}}>
                      <span style={{fontSize: '1.5rem'}}>{current.metrica2.icon}</span>
                      <div style={{color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginTop: '10px'}}>{current.metrica2.label}</div>
                      <div style={{fontSize: '1.7rem', fontWeight: 'bold', color: '#10b981', marginTop: '5px'}}>{current.metrica2.val}</div>
                    </div>
                    <div className="metric-card" style={{padding: '25px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9'}}>
                      <span style={{fontSize: '1.5rem'}}>{current.metrica3.icon}</span>
                      <div style={{color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginTop: '10px'}}>{current.metrica3.label}</div>
                      <div style={{fontSize: '1.7rem', fontWeight: 'bold', color: '#6366f1', marginTop: '5px'}}>{current.metrica3.val}</div>
                    </div>
                </div>

                <div style={{marginTop: '45px', padding: '30px', background: 'linear-gradient(to right, #f8fafc, #eff6ff)', borderRadius: '20px'}}>
                   <h4 style={{color: '#1e293b'}}>{current.footer}</h4>
                   <div style={{width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '20px', marginTop: '20px'}}>
                      <div style={{width: activeTab === "Cursos Completados" ? "80%" : activeTab === "Próximas Expediciones" ? "40%" : "65%", height: '100%', background: '#10b981', borderRadius: '20px'}}></div>
                   </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {showDonate && (
        <div className="modal-overlay">
          <div className="modal-card animate-pop" style={{maxWidth: '400px'}}>
            <button className="btn-close-circle" onClick={() => setShowDonate(false)}>✕</button>
            <h2 style={{marginBottom: '20px'}}>Contribución Segura</h2>
            <div className={`card-visual-wrapper`} style={{perspective: '1000px', marginBottom: '20px', height: '180px'}}>
                <div className={`card-inner ${flipCard ? 'is-flipped' : ''}`} style={{position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d'}}>
                    <div className="card-front-design" style={{position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: tipoTarjeta === "visa" ? "#1a1f71" : tipoTarjeta === "mastercard" ? "#eb001b" : "#334155", borderRadius: '15px', padding: '20px', color: 'white'}}>
                        <span style={{float: 'right', fontWeight: 'bold'}}>{tipoTarjeta.toUpperCase()}</span>
                        <div style={{marginTop: '50px', fontSize: '1.3rem'}}>{card.number || "•••• •••• •••• ••••"}</div>
                    </div>
                    <div className="card-back-design" style={{position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: '#0f172a', borderRadius: '15px', transform: 'rotateY(180deg)', padding: '20px', color: 'white'}}>
                        <div style={{background: '#fff', color: '#000', padding: '5px', width: '50px', marginLeft: 'auto', marginTop: '40px'}}>{card.cvv || "•••"}</div>
                    </div>
                </div>
            </div>
            <div className="pro-form" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <input placeholder="Monto ($)" type="number" className="input-field" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                <input placeholder="Número de Tarjeta" className="input-field" maxLength="19" value={card.number} onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || "";
                    setCard({...card, number: v});
                    if(v.startsWith("4")) setTipoTarjeta("visa"); else if(v.startsWith("5")) setTipoTarjeta("mastercard"); else setTipoTarjeta("");
                }} />
                <div style={{display: 'flex', gap: '10px'}}>
                    <input placeholder="MM/YY" className="input-field" maxLength="5" value={card.date} onChange={(e)=>setCard({...card, date: e.target.value})} />
                    <input placeholder="CVV" className="input-field" maxLength="3" onFocus={() => setFlipCard(true)} onBlur={() => setFlipCard(false)} value={card.cvv} onChange={(e)=>setCard({...card, cvv: e.target.value})} />
                </div>
                <button className="btn-primary-gradient" style={{width: '100%'}} onClick={handleDonacionExitosa}>Pagar Ahora</button>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-card animate-pop" style={{maxWidth: '400px'}}>
            <button className="btn-close-circle" onClick={() => setShowAuth(false)}>✕</button>
            <h2 style={{textAlign: 'center'}}>{isLogin ? "Acceder" : "Crear Cuenta"}</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {authError && <p style={{color: '#ff4444', textAlign: 'center', background: '#ffebeb', padding: '8px', borderRadius: '8px'}}>{authError}</p>}
                {!isLogin && <input placeholder="Nombre de usuario" className="input-field" onChange={(e)=>setAuthData({...authData, name: e.target.value})} />}
                <input placeholder="Email" className="input-field" onChange={(e)=>setAuthData({...authData, email: e.target.value})} />
                <input type="password" placeholder="Contraseña" className="input-field" onChange={(e)=>setAuthData({...authData, pass: e.target.value})} />
                {!isLogin && (
                  <>
                    <p style={{fontSize: '0.7rem', color: 'gray'}}>Mínimo 8 caracteres, 1 mayúscula y 1 número.</p>
                    <div style={{display: 'flex', gap: '10px'}}><div style={{background: '#eee', padding: '10px', fontWeight: 'bold'}}>{captchaCode}</div><input placeholder="Captcha" className="input-field" onChange={(e)=>setAuthData({...authData, captchaInput: e.target.value})} /></div>
                  </>
                )}
                <button className="btn-primary-gradient" onClick={handleAuthAction}>{isLogin ? "Entrar" : "Registrarse"}</button>
                <p style={{textAlign: 'center', cursor: 'pointer', color: '#10b981'}} onClick={()=>{setIsLogin(!isLogin); setAuthError("");}}>{isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
