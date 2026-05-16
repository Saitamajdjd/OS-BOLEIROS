import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XG', 'EXGG']

export default function Comprar() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [precos, setPrecos] = useState({ camisa: 50, short: 35, combo: 85 })
  const [imagens, setImagens] = useState({ camisa: '', short: '' })
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')
  const [loadingPrecos, setLoadingPrecos] = useState(true)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [tamanhoCamisa, setTamanhoCamisa] = useState('')
  const [desejaShort, setDesejaShort] = useState(false)
  const [tamanhoShort, setTamanhoShort] = useState('')
  const [sexoShort, setSexoShort] = useState('')
  const [nomePersonalizado, setNomePersonalizado] = useState('')
  const [numeroPersonalizado, setNumeroPersonalizado] = useState('')
  const [observacao, setObservacao] = useState('')

  useEffect(() => { carregarPrecos() }, [])

  const carregarPrecos = async () => {
    try {
      const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
      if (data) {
        setPrecos({ camisa: data.preco_camisa || 50, short: data.preco_short || 35, combo: data.preco_combo || 85 })
        setImagens({ camisa: data.imagem_camisa || '', short: data.imagem_short || '' })
        setNumeroWhatsapp(data.numero_whatsapp || '')
      }
    } catch (e) { }
    setLoadingPrecos(false)
  }

  const buscarNumeroWhatsapp = async () => {
    const { data } = await supabase.from('configuracoes').select('numero_whatsapp').eq('id', 1).single()
    return data?.numero_whatsapp || ''
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const valorTotal = desejaShort ? precos.combo : precos.camisa

  const limparTelefone = (tel) => tel.replace(/[^0-9]/g, '')

  const handleWhatsapp = async () => {
    const telefoneLimpo = limparTelefone(telefone)
    if (!nome || !telefoneLimpo || !tamanhoCamisa) {
      toast.error('Preencha os campos obrigatórios: Nome, Telefone e Tamanho da camisa')
      return
    }
    if (telefoneLimpo.length < 10) {
      toast.error('Telefone inválido. Digite um número com DDD.')
      return
    }

    const numeroAtual = await buscarNumeroWhatsapp()
    if (!numeroAtual) {
      toast.error('Número do WhatsApp não configurado. Entre em contato com o administrador.')
      return
    }

    const mensagem = `*NOVO PEDIDO - OS BOLEIRO*

*Dados do Cliente:*
Nome: ${nome}
Telefone: ${telefone}

*Detalhes do Pedido:*
Tamanho da Camisa: ${tamanhoCamisa}
Deseja Short: ${desejaShort ? 'Sim' : 'Não'}
${desejaShort ? `Tamanho do Short: ${tamanhoShort}` : ''}
${desejaShort ? `Sexo do Short: ${sexoShort}` : ''}
Nome Personalizado: ${nomePersonalizado || 'Não'}
Número Personalizado: ${numeroPersonalizado || 'Não'}
Observação: ${observacao || 'Nenhuma'}

*Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}*`

    window.open(`https://wa.me/${numeroAtual}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  if (loadingPrecos) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 45%, #EEF2FF 75%, #FCE7F3 100%)' }}><div className="text-[#0F172A] text-xl">Carregando...</div></div>

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 45%, #EEF2FF 75%, #FCE7F3 100%)' }}>
      <header className="bg-[#0F172A] shadow-lg py-3 relative">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-300 hover:text-cyan-400 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 onClick={() => navigate('/')} className="text-2xl md:text-3xl font-bold cursor-pointer transition">
              OS <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">BOLEIRO</span>
            </h1>
          </div>
          <button onClick={() => navigate('/admin')} className="hidden md:block px-4 py-2 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-200 transition">
            Admin
          </button>
          <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden p-2 text-gray-300 hover:text-cyan-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAberto ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuAberto && (
          <div ref={menuRef} className="absolute top-full left-0 right-0 bg-[#0F172A] border-t border-gray-700 md:hidden animate-slide-down z-50">
            <button onClick={() => { navigate('/'); setMenuAberto(false) }} className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-cyan-400 transition">Início</button>
            <button onClick={() => { navigate('/admin'); setMenuAberto(false) }} className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-cyan-400 transition">Admin</button>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] text-center mb-8">
          Escolha seus produtos
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2">
              <span className="text-white font-semibold text-sm">Camisa Oficial</span>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl h-56 flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition">
                {imagens.camisa ? <img src={imagens.camisa} alt="Camisa" className="h-full object-contain" /> : <div className="text-center text-gray-400"><svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-sm">Imagem da Camisa</p></div>}
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">R$ {precos.camisa.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2">
              <span className="text-white font-semibold text-sm">Short Oficial</span>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl h-56 flex items-center justify-center mb-4 group-hover:from-pink-100 group-hover:to-rose-100 transition">
                {imagens.short ? <img src={imagens.short} alt="Short" className="h-full object-contain" /> : <div className="text-center text-gray-400"><svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-sm">Imagem do Short</p></div>}
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">R$ {precos.short.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Monte Seu Pedido
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Dados Pessoais</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition placeholder-gray-400" placeholder="Seu nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition placeholder-gray-400" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">Tamanhos</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da Camisa *</label>
                  <select value={tamanhoCamisa} onChange={(e) => setTamanhoCamisa(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition">
                    <option value="">Selecione</option>
                    {TAMANHOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deseja Short?</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setDesejaShort(true); if (!tamanhoShort) setTamanhoShort('M'); if (!sexoShort) setSexoShort('Masculino') }} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${desejaShort ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Sim</button>
                    <button type="button" onClick={() => { setDesejaShort(false); setTamanhoShort(''); setSexoShort('') }} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${!desejaShort ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Não</button>
                  </div>
                </div>
              </div>

              {desejaShort && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho do Short</label>
                    <select value={tamanhoShort} onChange={(e) => setTamanhoShort(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-800 transition">
                      <option value="">Selecione</option>
                      {TAMANHOS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo do Short</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSexoShort('Masculino')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${sexoShort === 'Masculino' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Masculino</button>
                      <button type="button" onClick={() => setSexoShort('Feminino')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${sexoShort === 'Feminino' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Feminino</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-pink-600 mb-3 uppercase tracking-wide">Personalização (Opcional)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Personalizado</label>
                  <input type="text" value={nomePersonalizado} onChange={(e) => setNomePersonalizado(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-800 transition placeholder-gray-400" placeholder="Seu nome na camisa" maxLength={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número Personalizado</label>
                  <input type="text" value={numeroPersonalizado} onChange={(e) => setNumeroPersonalizado(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-4 py-3 bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-800 transition placeholder-gray-400" placeholder="Número na camisa" maxLength={3} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition placeholder-gray-400" placeholder="Alguma observação especial?" rows={3} />
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-lg font-bold text-[#0F172A] mb-4 text-center">Resumo do Pedido</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Camisa ({tamanhoCamisa || '-'})</span><span className="font-medium">R$ {precos.camisa.toFixed(2).replace('.', ',')}</span></div>
              {desejaShort && <div className="flex justify-between text-gray-600"><span>Short {sexoShort} ({tamanhoShort || '-'})</span><span className="font-medium">R$ {precos.short.toFixed(2).replace('.', ',')}</span></div>}
              {nomePersonalizado && <div className="flex justify-between text-gray-500 text-xs"><span>Nome: {nomePersonalizado}</span><span>✓</span></div>}
              {numeroPersonalizado && <div className="flex justify-between text-gray-500 text-xs"><span>Número: #{numeroPersonalizado}</span><span>✓</span></div>}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button onClick={handleWhatsapp} className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.174-.132.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            Comprar pelo WhatsApp
          </button>
        </div>

        <footer className="text-center mt-8 text-gray-500 py-4">
          <p>&copy; 2024 Os Boleiro - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  )
}