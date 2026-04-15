import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

// Instancia de conexión al backend en Render
const api = axios.create({
  baseURL: "https://ecoguardia-backend.onrender.com/api"
});

// Interceptor para enviar el token de seguridad
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
  const [showDonate, setShowDonate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("Cursos Completados"); 
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
        const response = await api.post("/auth/login", {
          email: authData.email,
          pass: authData.pass
        });
        const { token, user: userData } = response.data;
        setUser(userData);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setShowAuth(false);
      } else {
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
        setIsLogin(true);
      }
    } catch (error) {
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
    if (!user) {
        alert("❌ Debes iniciar sesión para realizar una donación.");
        setShowAuth(true);
        setShowDonate(false);
        return;
    }
    if (!amount || amount <= 0) { alert("❌ Ingresa un monto válido."); return; }
    if (!validarTarjetaReal(card.number)) { alert("❌ El número de tarjeta no es válido."); return; }
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
              <div className="user-profile-nav" onClick={() => {localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null);}} style={{cursor: 'pointer'}}>
                <div className="avatar">{user.name.substring(0,2).toUpperCase()}</div><span>{user.name} (Salir)</span>
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

      <section id="nuestra-mision" style={{ padding: window.innerWidth < 768 ? '40px 15px' : '80px 20px', background: '#fff' }}>
        <div style={{maxWidth: '1100px', margin: '0 auto'}}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: window.innerWidth < 768 ? '20px' : '50px', alignItems: 'center' }}>
            <div>
              <span style={{color: '#10b981', fontWeight: 'bold', letterSpacing: '1px'}}>NUESTRA HISTORIA</span>
              <h2 style={{fontSize: '2.5rem', color: '#1e293b', margin: '15px 0'}}>¿Por qué empezamos?</h2>
              <p style={{color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem'}}>
                EcoGuardian nació de una frustración compartida: la falta de transparencia en las donaciones ambientales.
                En 2024, decidimos crear una plataforma donde cada centavo pudiera rastrearse en tiempo real.
              </p>
            </div>
            <div style={{position: 'relative'}}>
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000" alt="Mision" style={{width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
            </div>
          </div>
        </div>
      </section>

      <section id="impacto" className="impact-section">
        {isPendingImpact && (
          <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px', border: '2px dashed #10b981'}}>
            <h3 style={{color: '#10b981'}}>🌟 Donación lista: Selecciona un destino</h3>
          </div>
        )}
        {!selectedImpact ? (
          <div className="impact-cards-grid">
            {Object.entries(projects).map(([key, info]) => (
              <div key={key} className="modern-card" onClick={() => isPendingImpact ? asignarDonacion(key) : setSelectedImpact(key)}>
                <div className="card-image-wrapper"><img src={info.img} alt={info.titulo} /></div>
                <div className="card-body">
                  <h3>{info.titulo}</h3>
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>{info.recaudado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-view-container" style={{padding: '20px'}}>
            <button className="btn-back-soft" onClick={() => setSelectedImpact(null)}>← Regresar</button>
            <h2 style={{textAlign: 'center'}}>{projects[selectedImpact].titulo}</h2>
            <p style={{textAlign: 'center'}}>Métricas detalladas del proyecto seleccionadas.</p>
          </div>
        )}
      </section>

      <section id="dashboard" style={{background: '#f1f5f9', padding: '100px 20px'}}>
        {(() => {
          const tabData = {
            "Cursos Completados": {
              subtitulo: "Progreso de tu formación académica",
              foto: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400",
              metrica1: { label: "Módulos Teóricos", val: "12 / 15", icon: "📚" },
              metrica2: { label: "Promedio Global", val: "9.8/10", icon: "⭐" },
              metrica3: { label: "Diplomas", val: "3 Digitales", icon: "📜" },
              footer: "🎯 Objetivo: Completa 3 módulos para el certificado."
            },
            "Próximas Expediciones": {
              subtitulo: "Tus salidas programadas al campo",
              foto: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=400",
              metrica1: { label: "Salidas este mes", val: "2 Viajes", icon: "🥾" },
              metrica2: { label: "Horas de Campo", val: "48.5 Horas", icon: "🌍" },
              metrica3: { label: "Grupo Asignado", val: "Alfa-9", icon: "👥" },
              footer: "📍 Siguiente parada: Reserva de la Biósfera."
            },
            "Bóveda de Recompensas": {
              subtitulo: "Beneficios por tu impacto positivo",
              foto: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400",
              metrica1: { label: "Puntos Eco", val: "4,500 pts", icon: "🪙" },
              metrica2: { label: "Insignias", val: "8 Bronce", icon: "🎖️" },
              metrica3: { label: "Descuentos", val: "15% Tienda", icon: "🛍️" },
              footer: "🎁 ¡Canjea tus puntos por herramientas!"
            }
          };
          const current = tabData[activeTab] || tabData["Cursos Completados"];

          return (
            <div className="dashboard-wrapper" style={{
              maxWidth: '1150px', margin: '0 auto', background: '#fff', borderRadius: '25px', 
              display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', 
              minHeight: '550px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden'
            }}>
              <div className="dash-sidebar" style={{ width: window.innerWidth < 768 ? '100%' : '280px', background: '#0f172a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(tabData).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? '#10b981' : 'transparent', color: 'white', border: 'none', padding: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: '10px' }}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="dash-main-content" style={{flex: '1', padding: '40px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px'}}>
                  <div><h2>{activeTab}</h2><p>{current.subtitulo}</p></div>
                  <img src={current.foto} style={{width: '70px', height: '70px', borderRadius: '15px', objectFit: 'cover'}} alt="Icon" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                  <div style={{padding: '20px', border: '1px solid #eee', borderRadius: '15px'}}>
                    <span>{current.metrica1.icon}</span><br/><b>{current.metrica1.label}</b><p>{current.metrica1.val}</p>
                  </div>
                  <div style={{padding: '20px', border: '1px solid #eee', borderRadius: '15px'}}>
                    <span>{current.metrica2.icon}</span><br/><b>{current.metrica2.label}</b><p>{current.metrica2.val}</p>
                  </div>
                  <div style={{padding: '20px', border: '1px solid #eee', borderRadius: '15px'}}>
                    <span>{current.metrica3.icon}</span><br/><b>{current.metrica3.label}</b><p>{current.metrica3.val}</p>
                  </div>
                </div>
                <p style={{marginTop: '30px', fontWeight: 'bold'}}>{current.footer}</p>
              </div>
            </div>
          );
        })()}
      </section>

      {showDonate && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '400px', background: 'white', padding: '30px', borderRadius: '20px'}}>
            <button onClick={() => setShowDonate(false)} style={{float: 'right', border: 'none', background: 'none', cursor: 'pointer'}}>✕</button>
            <h2>Donación</h2>
            <input placeholder="Monto ($)" type="number" className="input-field" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{width: '100%', marginBottom: '10px'}}/>
            <input placeholder="Tarjeta" className="input-field" value={card.number} onChange={(e)=>setCard({...card, number: e.target.value})} style={{width: '100%', marginBottom: '10px'}}/>
            <button className="btn-primary-gradient" onClick={handleDonacionExitosa} style={{width: '100%'}}>Pagar</button>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-card" style={{maxWidth: '400px', background: 'white', padding: '30px', borderRadius: '20px'}}>
            <button onClick={() => setShowAuth(false)} style={{float: 'right', border: 'none', background: 'none', cursor: 'pointer'}}>✕</button>
            <h2>{isLogin ? "Acceder" : "Registro"}</h2>
            {authError && <p style={{color: 'red'}}>{authError}</p>}
            {!isLogin && <input placeholder="Nombre" className="input-field" onChange={(e)=>setAuthData({...authData, name: e.target.value})} style={{width: '100%', marginBottom: '10px'}}/>}
            <input placeholder="Email" className="input-field" onChange={(e)=>setAuthData({...authData, email: e.target.value})} style={{width: '100%', marginBottom: '10px'}}/>
            <input type="password" placeholder="Pass" className="input-field" onChange={(e)=>setAuthData({...authData, pass: e.target.value})} style={{width: '100%', marginBottom: '10px'}}/>
            <button className="btn-primary-gradient" onClick={handleAuthAction} style={{width: '100%'}}>{isLogin ? "Entrar" : "Crear"}</button>
            <p onClick={()=>setIsLogin(!isLogin)} style={{cursor: 'pointer', textAlign: 'center', marginTop: '10px'}}>Cambiar a {isLogin ? "Registro" : "Login"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;