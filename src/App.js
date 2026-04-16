import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

// Esto crea un acceso directo a tu servidor
const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Interceptor para el token
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
  const [activeTab, setActiveTab] = useState("Mi Impacto Social");
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
        // Validación de campos vacíos
        if (!authData.name || !authData.email || !authData.pass) { 
          setAuthError("Llena todos los campos."); 
          return; 
        }

        // --- NUEVA VALIDACIÓN DE SEGURIDAD ---
        // Expresión regular: Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial
        const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!strongPassword.test(authData.pass)) {
          setAuthError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.");
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

      <section id="nuestra-mision" style={{padding: '80px 20px', background: '#fff'}}>
        <div style={{maxWidth: '1100px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center'}}>
            <div>
              <span style={{color: '#10b981', fontWeight: 'bold', letterSpacing: '1px'}}>NUESTRA HISTORIA</span>
              <h2 style={{fontSize: '2.5rem', color: '#1e293b', margin: '15px 0'}}>¿Por qué empezamos?</h2>
              <p style={{color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem'}}>
                EcoGuardian nació de una frustración compartida: la falta de transparencia en las donaciones ambientales.
              </p>
              <div style={{marginTop: '30px', borderLeft: '4px solid #10b981', paddingLeft: '20px'}}>
                <h4 style={{margin: '0', color: '#1e293b'}}>Nuestra Misión</h4>
                <p style={{fontStyle: 'italic', color: '#64748b'}}>"Garantizar que la tecnología y la generosidad humana trabajen juntas."</p>
              </div>
            </div>
            <div style={{position: 'relative'}}>
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000" alt="Mision" style={{width: '100%', borderRadius: '20px'}} />
            </div>
          </div>
        </div>
      </section>

      <section id="impacto" className="impact-section">
        {isPendingImpact && (
          <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px', border: '2px dashed #10b981'}}>
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
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>
                    {info.recaudado.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-view-container" style={{padding: '20px'}}>
            <button onClick={() => setSelectedImpact(null)}>← Regresar</button>
            <h2 style={{textAlign: 'center'}}>{projects[selectedImpact].titulo}</h2>
            <p>Total Recaudado: ${projects[selectedImpact].recaudado.toLocaleString()}</p>
          </div>
        )}
      </section>

      {showDonate && (
        <div className="modal-overlay">
          <div className="modal-card animate-pop" style={{maxWidth: '450px'}}>
            <button className="btn-close-circle" onClick={() => setShowDonate(false)}>✕</button>
            <h2 style={{marginBottom: '20px'}}>Contribución Segura</h2>
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
                    <p style={{fontSize: '0.7rem', color: 'gray'}}>Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.</p>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <div style={{background: '#eee', padding: '10px', fontWeight: 'bold'}}>{captchaCode}</div>
                        <input placeholder="Captcha" className="input-field" onChange={(e)=>setAuthData({...authData, captchaInput: e.target.value})} />
                    </div>
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
