import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GaleriaCarrossel from '../components/GaleriaCarrossel'

export default function Landing() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 40%, #EDE9FE 75%, #FCE7F3 100%)' }}>
      <header className="bg-[#0F172A] shadow-lg py-4 relative">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 onClick={() => navigate('/')} className="text-2xl md:text-3xl font-bold cursor-pointer transition">
            OS <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">BOLEIRO</span>
          </h1>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/comprar')} className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#7C3AED] transition shadow-lg hover:shadow-purple-500/30">
              Comprar
            </button>
            <button onClick={() => navigate('/admin')} className="px-5 py-2.5 border border-cyan-500/40 text-cyan-300 rounded-lg font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-200 transition">
              Admin
            </button>
          </div>
          <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden p-2 text-gray-300 hover:text-cyan-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAberto ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuAberto && (
          <div ref={menuRef} className="absolute top-full left-0 right-0 bg-[#0F172A] border-t border-gray-700 md:hidden animate-slide-down z-50 shadow-lg">
            <button onClick={() => { navigate('/comprar'); setMenuAberto(false) }} className="w-full px-4 py-4 text-left text-white hover:bg-gray-800 hover:text-cyan-400 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Comprar
            </button>
            <button onClick={() => { navigate('/admin'); setMenuAberto(false) }} className="w-full px-4 py-4 text-left text-gray-300 hover:bg-gray-800 hover:text-cyan-400 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Admin
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <GaleriaCarrossel />
          </div>
        </section>

        <section className="py-20 md:py-28 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-azul-suave/50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-rosa-principal rounded-full animate-pulse"></span>
              <span className="text-sm text-azul-principal font-medium">Terra Nova - BA</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-texto-principal mb-6 leading-tight">
              O primeiro e único bloco dedicado aos amantes de{' '}
              <span className="text-rosa-principal">futebol</span> em Terra Nova
            </h2>
            <p className="text-xl md:text-2xl text-texto-secundario mb-10 max-w-2xl mx-auto">
              E você vai querer ficar de fora?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/comprar')} className="px-10 py-5 bg-gradient-to-r from-azul-principal to-blue-500 text-white text-lg font-bold rounded-full hover:from-blue-600 hover:to-azul-principal transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 border border-blue-400/30">
                Comprar agora
              </button>
              <button onClick={() => document.getElementById('sobre').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-5 border-2 border-borda-suave text-texto-secundario text-lg font-semibold rounded-full hover:border-rosa-principal hover:text-rosa-principal transition-all duration-300">
                Saber mais
              </button>
            </div>
          </div>
        </section>

        <section id="sobre" className="py-20 px-4 bg-fundo-card/50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-texto-principal mb-6">
              Sobre <span className="text-rosa-principal">Os Boleiro</span>
            </h3>
            <p className="text-lg md:text-xl text-texto-secundario leading-relaxed max-w-2xl mx-auto">
              Os Boleiro nasceu da resenha, da amizade e da tradição do São João de Terra Nova.
              Mais do que um grupo, somos um bloco que carrega alegria, união e presença forte nos festas juninas.
            </p>
          </div>
        </section>

        <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.05) 0%, transparent 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-texto-principal text-center mb-8">
              Terra Nova - <span className="text-rosa-principal">Bahia</span>
            </h3>
            <p className="text-lg md:text-xl text-texto-secundario leading-relaxed text-center mb-12 max-w-2xl mx-auto">
              Terra Nova é uma cidade baiana conhecida por sua tradição, cultura e clima acolhedor.
              No período junino, a cidade ganha ainda mais vida com música, encontros, quadrilhas, festas e muita resenha.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: '🔥', title: 'Tradição Junina' },
                { icon: '🌴', title: 'Cultura Baiana' },
                { icon: '😊', title: 'Alegria do Povo' },
                { icon: '🎉', title: 'Festa e União' }
              ].map((item, index) => (
                <div key={index} className="bg-fundo-card p-6 rounded-2xl text-center hover:shadow-xl hover:border-rosa-principal/20 border border-borda-suave transition-all duration-300 transform hover:-translate-y-1">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <p className="text-texto-principal font-semibold">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 50%, #F8FAFC 100%)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-texto-principal mb-6">
              Garanta sua camisa oficial e faça parte dessa história.
            </h3>
            <button onClick={() => navigate('/comprar')} className="px-10 py-5 bg-azul-principal text-white text-xl font-bold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-azul-principal/30 transform hover:scale-105">
              Comprar minha camisa
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F172A] py-8 text-center border-t border-gray-800">
        <p className="text-gray-400">&copy; 2024 Os Boleiro - Todos os direitos reservados</p>
      </footer>
    </div>
  )
}