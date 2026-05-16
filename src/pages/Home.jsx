import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XG', 'EXGG']

export default function Home() {
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

  useEffect(() => {
    carregarPrecos()
  }, [])

  const carregarPrecos = async () => {
    try {
      const { data } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setPrecos({
          camisa: data.preco_camisa || 50,
          short: data.preco_short || 35,
          combo: data.preco_combo || 85
        })
        setImagens({
          camisa: data.imagem_camisa || '',
          short: data.imagem_short || ''
        })
        setNumeroWhatsapp(data.numero_whatsapp || '')
      }
    } catch (e) {
    }
    setLoadingPrecos(false)
  }

  const buscarNumeroWhatsapp = async () => {
    const { data } = await supabase.from('configuracoes').select('numero_whatsapp').eq('id', 1).single()
    return data?.numero_whatsapp || ''
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
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

    const url = `https://wa.me/${numeroAtual}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  if (loadingPrecos) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-verde-boleiro to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-verde-boleiro to-green-900">
      <div className="bg-preto-boleiro py-4 shadow-lg relative">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              OS <span className="text-dourado-boleiro">BOLEIRO</span>
            </h1>
            <p className="text-gray-400 mt-1 hidden md:block">Camisas Oficiais do Evento</p>
          </div>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 text-white hover:text-dourado-boleiro transition"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAberto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {menuAberto && (
          <div ref={menuRef} className="absolute top-full left-0 right-0 bg-preto-boleiro border-t border-gray-700 md:hidden animate-slide-down z-50">
            <button
              onClick={() => { navigate('/admin'); setMenuAberto(false) }}
              className="w-full px-4 py-4 text-left text-white hover:bg-gray-800 hover:text-dourado-boleiro transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Área Admin
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-preto-boleiro mb-4 border-b-2 border-dourado-boleiro pb-2">
              Camisa Oficial
            </h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
              {imagens.camisa ? (
                <img src={imagens.camisa} alt="Camisa" className="h-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p>Imagem da Camisa</p>
                </div>
              )}
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-verde-boleiro">R$ {precos.camisa.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-preto-boleiro mb-4 border-b-2 border-dourado-boleiro pb-2">
              Short Oficial
            </h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
              {imagens.short ? (
                <img src={imagens.short} alt="Short" className="h-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p>Imagem do Short</p>
                </div>
              )}
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-verde-boleiro">R$ {precos.short.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-preto-boleiro mb-6 border-b-2 border-dourado-boleiro pb-2">
            Monte Seu Pedido
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro focus:border-verde-boleiro"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone *</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tamanho da Camisa *</label>
              <select
                value={tamanhoCamisa}
                onChange={(e) => setTamanhoCamisa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
              >
                <option value="">Selecione</option>
                {TAMANHOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deseja Short?</label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDesejaShort(true)
                    if (!tamanhoShort) setTamanhoShort('M')
                    if (!sexoShort) setSexoShort('Masculino')
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    desejaShort
                      ? 'bg-verde-boleiro text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDesejaShort(false)
                    setTamanhoShort('')
                    setSexoShort('')
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    !desejaShort
                      ? 'bg-verde-boleiro text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>

            {desejaShort && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tamanho do Short</label>
                  <select
                    value={tamanhoShort}
                    onChange={(e) => setTamanhoShort(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
                  >
                    <option value="">Selecione</option>
                    {TAMANHOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sexo do Short</label>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setSexoShort('Masculino')}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        sexoShort === 'Masculino'
                          ? 'bg-verde-boleiro text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setSexoShort('Feminino')}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        sexoShort === 'Feminino'
                          ? 'bg-verde-boleiro text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Personalizado</label>
              <input
                type="text"
                value={nomePersonalizado}
                onChange={(e) => setNomePersonalizado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
                placeholder="Seu nome na camisa"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Número Personalizado</label>
              <input
                type="text"
                value={numeroPersonalizado}
                onChange={(e) => setNumeroPersonalizado(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
                placeholder="Número na camisa"
                maxLength={3}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-boleiro"
              placeholder="Alguma observação especial?"
              rows={3}
            />
          </div>

          <div className="mt-8 bg-gradient-to-r from-verde-boleiro to-green-700 rounded-xl p-6 text-center">
            <p className="text-white text-lg mb-2">Valor Total</p>
            <p className="text-4xl font-bold text-dourado-boleiro">
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {desejaShort ? `Camisa + Short (${precos.combo.toFixed(2).replace('.', ',')})` : 'Apenas Camisa'}
            </p>
          </div>

          <button
            onClick={handleWhatsapp}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.174-.132.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            Comprar pelo WhatsApp
          </button>
        </div>

        <footer className="text-center mt-8 text-white/70 py-4 relative">
          <p>&copy; 2024 Os Boleiro - Todos os direitos reservados</p>
          <a href="/admin" className="absolute right-0 bottom-0 text-[8px] text-white/20 hover:text-white/40 no-underline">admin</a>
        </footer>
      </div>
    </div>
  )
}