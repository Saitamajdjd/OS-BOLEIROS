import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAdminSessionTimeout } from '../hooks/useAdminSessionTimeout'
import ConfirmModal from '../components/ConfirmModal'
import RelatoriosAdmin from '../components/RelatoriosAdmin'
import ImportarListaExcel from '../components/ImportarListaExcel'
import GerenciarImagens from '../components/GerenciarImagens'
import GerenciarGaleria from '../components/GerenciarGaleria'

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XG', 'EXGG']

const ABAS = [
  { id: 'pedidos', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'galeria', label: 'Galeria Inicial', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'imagens', label: 'Imagens Produtos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'relatorios', label: 'Relatórios', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'importar', label: 'Importar', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  const [menuMobileOpen, setMenuMobileOpen] = useState(false)

  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroPago, setFiltroPago] = useState('')
  const [filtroTamanho, setFiltroTamanho] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showModalPrecos, setShowModalPrecos] = useState(false)
  const [showModalWhatsapp, setShowModalWhatsapp] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null })
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')
  const [editando, setEditando] = useState(null)
  const [precos, setPrecos] = useState({ camisa: 50, short: 35, combo: 85 })

  const [form, setForm] = useState({
    nome: '', telefone: '', tamanho_camisa: '', deseja_short: false,
    tamanho_short: '', sexo_short: '', nome_personalizado: '',
    numero_personalizado: '', observacao: '', valor_total: 50, pago: false
  })

  const [formPrecos, setFormPrecos] = useState({ preco_camisa: 50, preco_short: 35, preco_combo: 85 })

  useAdminSessionTimeout()

  useEffect(() => {
    verificarAuth()
    carregarPedidos()
    carregarPrecos()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const verificarAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin')
  }

  const carregarPedidos = async () => {
    setLoading(true)
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })
    if (data) setPedidos(data)
    setLoading(false)
  }

  const carregarPrecos = async () => {
    const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
    if (data) {
      setPrecos({ camisa: data.preco_camisa || 50, short: data.preco_short || 35, combo: data.preco_combo || 85 })
      setFormPrecos({ preco_camisa: data.preco_camisa || 50, preco_short: data.preco_short || 35, preco_combo: data.preco_combo || 85 })
      setNumeroWhatsapp(data.numero_whatsapp || '')
    }
  }

  const salvarPrecos = async () => {
    await supabase.from('configuracoes').update({ preco_camisa: parseFloat(formPrecos.preco_camisa), preco_short: parseFloat(formPrecos.preco_short), preco_combo: parseFloat(formPrecos.preco_combo) }).eq('id', 1)
    setPrecos({ camisa: parseFloat(formPrecos.preco_camisa), short: parseFloat(formPrecos.preco_short), combo: parseFloat(formPrecos.preco_combo) })
    setShowModalPrecos(false)
    toast.success('Preços atualizados!')
  }

  const salvarNumeroWhatsapp = async () => {
    const numeroLimpo = numeroWhatsapp.replace(/[^0-9]/g, '')
    if (numeroLimpo.length < 10) { toast.error('Número inválido'); return }
    await supabase.from('configuracoes').update({ numero_whatsapp: numeroLimpo }).eq('id', 1)
    setShowModalWhatsapp(false)
    toast.success('Número atualizado!')
  }

  const logout = async () => { await supabase.auth.signOut(); navigate('/admin') }

  const filtrarPedidos = () => pedidos.filter(p => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroPago === 'pago' && !p.pago) return false
    if (filtroPago === 'pendente' && p.pago) return false
    if (filtroTamanho && p.tamanho_camisa !== filtroTamanho) return false
    if (filtroSexo && p.sexo_short !== filtroSexo) return false
    return true
  })

  const abrirModal = (pedido = null) => {
    if (pedido) {
      setEditando(pedido.id)
      setForm({ nome: pedido.nome || '', telefone: pedido.telefone || '', tamanho_camisa: pedido.tamanho_camisa || '', deseja_short: pedido.deseja_short || false, tamanho_short: pedido.tamanho_short || '', sexo_short: pedido.sexo_short || '', nome_personalizado: pedido.nome_personalizado || '', numero_personalizado: pedido.numero_personalizado || '', observacao: pedido.observacao || '', valor_total: pedido.valor_total || 50, pago: pedido.pago || false })
    } else {
      setEditando(null)
      setForm({ nome: '', telefone: '', tamanho_camisa: '', deseja_short: false, tamanho_short: '', sexo_short: '', nome_personalizado: '', numero_personalizado: '', observacao: '', valor_total: precos.camisa, pago: false })
    }
    setShowModal(true)
  }

  const calcularValor = () => form.deseja_short ? precos.combo : precos.camisa

  const salvarPedido = async () => {
    if (!form.nome || !form.telefone || !form.tamanho_camisa) { toast.error('Preencha os campos obrigatórios'); return }
    const dados = { ...form, valor_total: calcularValor(), tamanho_short: form.deseja_short ? form.tamanho_short : null, sexo_short: form.deseja_short ? form.sexo_short : null }
    if (editando) { await supabase.from('pedidos').update(dados).eq('id', editando) }
    else { await supabase.from('pedidos').insert([dados]) }
    setShowModal(false)
    carregarPedidos()
    toast.success('Pedido salvo!')
  }

  const togglePago = async (pedido) => {
    await supabase.from('pedidos').update({ pago: !pedido.pago }).eq('id', pedido.id)
    carregarPedidos()
  }

  const excluirPedido = (id) => {
    setConfirmModal({
      open: true,
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir este pedido?',
      onConfirm: async () => {
        await supabase.from('pedidos').delete().eq('id', id)
        carregarPedidos()
        toast.success('Pedido excluído!')
        setConfirmModal({ ...confirmModal, open: false })
      }
    })
  }

  const apagarTodosPedidos = () => {
    setConfirmModal({
      open: true,
      title: 'Apagar todos os pedidos',
      message: 'Tem certeza que deseja excluir TODOS os pedidos? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        carregarPedidos()
        toast.success('Todos os pedidos foram excluídos!')
        setConfirmModal({ ...confirmModal, open: false })
      }
    })
  }

  const stats = { total: pedidos.length, pagos: pedidos.filter(p => p.pago).length, pendentes: pedidos.filter(p => !p.pago).length, camisas: TAMANHOS.map(t => ({ tamanho: t, quantidade: pedidos.filter(p => p.tamanho_camisa === t).length })), shortsM: TAMANHOS.map(t => ({ tamanho: t, quantidade: pedidos.filter(p => p.sexo_short === 'Masculino' && p.tamanho_short === t).length })), shortsF: TAMANHOS.map(t => ({ tamanho: t, quantidade: pedidos.filter(p => p.sexo_short === 'Feminino' && p.tamanho_short === t).length })) }

  const renderizarAba = () => {
    switch (abaAtiva) {
      case 'pedidos': return <PedidosSection stats={stats} precos={precos} />
      case 'galeria': return <GerenciarGaleria />
      case 'imagens': return <GerenciarImagens onAtualizado={carregarPrecos} />
      case 'relatorios': return <RelatoriosAdmin pedidos={pedidos} />
      case 'importar': return <ImportarListaExcel onImportacaoConcluida={carregarPedidos} />
      default: return null
    }
  }

  function PedidosSection({ stats, precos }) {
    const pedidosFiltrados = filtrarPedidos()
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-blue-100 hover:shadow-xl hover:shadow-blue-200/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-green-100 hover:shadow-xl hover:shadow-green-200/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{stats.pagos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-orange-100 hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-pink-100 hover:shadow-xl hover:shadow-pink-200/30 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Valor Total</p>
                <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">R$ {pedidos.reduce((acc, p) => acc + (p.pago ? p.valor_total : 0), 0).toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Resumo por Tamanho
            </h3>
            <div className="text-xs flex flex-wrap gap-2">
              <span className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-200 px-3 py-1.5 rounded-full font-medium text-blue-700">Camisa: R$ {precos.camisa}</span>
              <span className="bg-gradient-to-r from-pink-500/10 to-pink-500/5 border border-pink-200 px-3 py-1.5 rounded-full font-medium text-pink-700">Short: R$ {precos.short}</span>
              <span className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-200 px-3 py-1.5 rounded-full font-medium text-purple-700">Combo: R$ {precos.combo}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-3 text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Camisas</p>
              <div className="flex flex-wrap gap-2">{stats.camisas.map(c => <span key={c.tamanho} className="bg-white border border-blue-200 px-2.5 py-1 rounded-full text-xs font-medium text-blue-700">{c.tamanho}: <span className="font-bold">{c.quantidade}</span></span>)}</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl p-4 border border-cyan-100">
              <p className="font-semibold text-cyan-700 mb-3 text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Shorts Masculino</p>
              <div className="flex flex-wrap gap-2">{stats.shortsM.map(c => <span key={c.tamanho} className="bg-white border border-cyan-200 px-2.5 py-1 rounded-full text-xs font-medium text-cyan-700">{c.tamanho}: <span className="font-bold">{c.quantidade}</span></span>)}</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-4 border border-pink-100">
              <p className="font-semibold text-pink-700 mb-3 text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Shorts Feminino</p>
              <div className="flex flex-wrap gap-2">{stats.shortsF.map(c => <span key={c.tamanho} className="bg-white border border-pink-200 px-2.5 py-1 rounded-full text-xs font-medium text-pink-700">{c.tamanho}: <span className="font-bold">{c.quantidade}</span></span>)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-start md:items-center mb-5">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm w-full md:w-44 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 placeholder-gray-400" />
              </div>
              <select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"><option value="">Status</option><option value="pago">Pago</option><option value="pendente">Pendente</option></select>
              <select value={filtroTamanho} onChange={(e) => setFiltroTamanho(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"><option value="">Tamanho</option>{TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"><option value="">Sexo</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option></select>
            </div>
            <button onClick={() => abrirModal()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 sm:px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Novo Pedido
            </button>
          </div>

          {loading ? <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="text-gray-500 mt-3">Carregando...</p></div> : (
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                <table className="w-full"><thead className="bg-gradient-to-r from-gray-50 to-gray-100"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nome</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Camisa</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Short</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Personalização</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Valor</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th></tr></thead><tbody>
                  {pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3"><p className="font-semibold text-sm text-gray-800">{pedido.nome}</p><p className="text-xs text-gray-500">{pedido.telefone}</p></td>
                      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{pedido.tamanho_camisa}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pedido.deseja_short ? <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${pedido.sexo_short === 'Feminino' ? 'bg-pink-100 text-pink-700' : 'bg-cyan-100 text-cyan-700'}`}>{pedido.sexo_short?.slice(0,1)} {pedido.tamanho_short}</span> : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pedido.nome_personalizado || '-'} {pedido.numero_personalizado && <span className="text-pink-600 font-semibold">#{pedido.numero_personalizado}</span>}</td>
                      <td className="px-4 py-3 font-bold text-sm bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">R$ {pedido.valor_total.toFixed(2).replace('.', ',')}</td>
                      <td className="px-4 py-3"><button onClick={() => togglePago(pedido)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pedido.pago ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg'}`}>{pedido.pago ? 'Pago' : 'Pendente'}</button></td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={() => abrirModal(pedido)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition">Editar</button><button onClick={() => excluirPedido(pedido.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition">Excluir</button></div></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="md:hidden space-y-3">
                {pedidosFiltrados.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3"><div><p className="font-semibold text-gray-800">{pedido.nome}</p><p className="text-xs text-gray-500">{pedido.telefone}</p></div><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pedido.pago ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'}`}>{pedido.pago ? 'Pago' : 'Pendente'}</span></div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-blue-50 rounded-lg p-2"><span className="text-gray-500">Camisa</span><p className="font-semibold text-blue-700">{pedido.tamanho_camisa}</p></div>
                      <div className="bg-pink-50 rounded-lg p-2"><span className="text-gray-500">Short</span><p className="font-semibold text-pink-700">{pedido.deseja_short ? `${pedido.sexo_short} ${pedido.tamanho_short}` : 'Não'}</p></div>
                      <div className="bg-purple-50 rounded-lg p-2"><span className="text-gray-500">Personalização</span><p className="font-semibold text-purple-700">{pedido.nome_personalizado || '-'}</p></div>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-2"><span className="text-gray-500">Valor</span><p className="font-bold text-pink-600">R$ {pedido.valor_total.toFixed(2).replace('.', ',')}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => togglePago(pedido)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">{pedido.pago ? 'Pendente' : 'Pago'}</button>
                      <button onClick={() => abrirModal(pedido)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition">Editar</button>
                      <button onClick={() => excluirPedido(pedido.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 transition">Excluir</button>
                    </div>
                  </div>
                ))}
                {pedidosFiltrados.length === 0 && <div className="text-center py-12 text-gray-500"><svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p>Nenhum pedido encontrado</p></div>}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div><p className="font-bold text-red-700 text-center sm:text-left">Zerar Banco de Dados</p><p className="text-sm text-red-500 text-center sm:text-left">Excluir todos os pedidos definitivamente</p></div>
          </div>
          <button onClick={apagarTodosPedidos} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Apagar Todos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 45%, #EEF2FF 75%, #FCE7F3 100%)' }}>
      <header className="bg-[#0F172A] shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">OS <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">BOLEIRO</span> <span className="text-sm font-normal text-gray-300">Admin</span></h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModalWhatsapp(true)} className="hidden md:inline-flex text-sm text-gray-300 hover:text-cyan-400 transition">Editar Número</button>
            <button onClick={() => setShowModalPrecos(true)} className="hidden md:inline-flex text-sm text-gray-300 hover:text-cyan-400 transition">Editar Preços</button>
            <button onClick={logout} className="text-sm text-gray-300 hover:text-red-400 transition">Sair</button>
            <button onClick={() => setMenuMobileOpen(!menuMobileOpen)} className="md:hidden p-2 text-gray-300 hover:text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{menuMobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {ABAS.map(aba => (
              <button key={aba.id} onClick={() => setAbaAtiva(aba.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${abaAtiva === aba.id ? 'border-purple-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>
                {aba.label}
              </button>
            ))}
          </nav>
        </div>

        {menuMobileOpen && (
          <div ref={menuRef} className="md:hidden bg-[#0F172A] border-t border-gray-700 px-4 py-2 flex flex-col gap-2">
            <button onClick={() => { setShowModalWhatsapp(true); setMenuMobileOpen(false) }} className="text-left py-2 text-gray-300 hover:text-cyan-400 transition">Editar Número</button>
            <button onClick={() => { setShowModalPrecos(true); setMenuMobileOpen(false) }} className="text-left py-2 text-gray-300 hover:text-cyan-400 transition">Editar Preços</button>
            <button onClick={() => { logout(); setMenuMobileOpen(false) }} className="text-left py-2 text-gray-300 hover:text-red-400 transition">Sair</button>
            <div className="border-t border-gray-700 pt-2 mt-2">
              {ABAS.map(aba => (<button key={aba.id} onClick={() => { setAbaAtiva(aba.id); setMenuMobileOpen(false) }} className={`block w-full text-left py-2 text-sm ${abaAtiva === aba.id ? 'text-white font-medium' : 'text-gray-400'}`}>{aba.label}</button>))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">{renderizarAba()}</main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8 shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                {editando ? 'Editar Pedido' : 'Novo Pedido'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome *</label><input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Nome completo" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone *</label><input type="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="(00) 00000-0000" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamanho Camisa *</label><select value={form.tamanho_camisa} onChange={(e) => setForm({ ...form, tamanho_camisa: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"><option value="">Selecione</option>{TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Deseja Short?</label><div className="flex gap-2"><button type="button" onClick={() => setForm({ ...form, deseja_short: true })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.deseja_short ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Sim</button><button type="button" onClick={() => setForm({ ...form, deseja_short: false, tamanho_short: '', sexo_short: '' })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!form.deseja_short ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Não</button></div></div>
              {form.deseja_short && (<div className="grid grid-cols-2 gap-4 pt-2"><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamanho Short</label><select value={form.tamanho_short} onChange={(e) => setForm({ ...form, tamanho_short: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition bg-white"><option value="">Selecione</option>{TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Sexo Short</label><select value={form.sexo_short} onChange={(e) => setForm({ ...form, sexo_short: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition bg-white"><option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option></select></div></div>)}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Personalizado</label><input type="text" value={form.nome_personalizado} onChange={(e) => setForm({ ...form, nome_personalizado: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition" placeholder="Seu nome" maxLength={20} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Número</label><input type="text" value={form.numero_personalizado} onChange={(e) => setForm({ ...form, numero_personalizado: e.target.value.replace(/[^0-9]/g, '') })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition" placeholder="Número" maxLength={3} /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Observação</label><textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" rows={2} placeholder="Alguma observação..." /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Status de Pagamento</label><div className="flex gap-2"><button type="button" onClick={() => setForm({ ...form, pago: true })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.pago ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Pago</button><button type="button" onClick={() => setForm({ ...form, pago: false })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!form.pago ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Pendente</button></div></div>
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 rounded-xl border border-blue-100 text-center">
                <span className="text-sm text-gray-600">Valor total: </span><span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">R$ {calcularValor().toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3"><button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Cancelar</button><button onClick={salvarPedido} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg">Salvar Pedido</button></div>
          </div>
        </div>
      )}

      {showModalPrecos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Editar Preços
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                <div className="flex-1"><label className="block text-sm font-semibold text-gray-700">Camisa</label><input type="number" step="0.01" value={formPrecos.preco_camisa} onChange={(e) => setFormPrecos({ ...formPrecos, preco_camisa: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" /></div>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                <div className="flex-1"><label className="block text-sm font-semibold text-gray-700">Short</label><input type="number" step="0.01" value={formPrecos.preco_short} onChange={(e) => setFormPrecos({ ...formPrecos, preco_short: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition" /></div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                <div className="flex-1"><label className="block text-sm font-semibold text-gray-700">Combo</label><input type="number" step="0.01" value={formPrecos.preco_combo} onChange={(e) => setFormPrecos({ ...formPrecos, preco_combo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" /></div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3"><button onClick={() => setShowModalPrecos(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Cancelar</button><button onClick={salvarPrecos} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg">Salvar Preços</button></div>
          </div>
        </div>
      )}

      {showModalWhatsapp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.174-.132.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                Editar WhatsApp
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.174-.132.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Número do WhatsApp</label>
                  <input type="tel" value={numeroWhatsapp} onChange={(e) => setNumeroWhatsapp(e.target.value)} placeholder="5575999999999" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition mt-1" />
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3"><button onClick={() => setShowModalWhatsapp(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Cancelar</button><button onClick={salvarNumeroWhatsapp} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg">Salvar Número</button></div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}