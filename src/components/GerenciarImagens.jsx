import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function GerenciarImagens({ onAtualizado }) {
  const navigate = useNavigate()

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/admin')
    }
    verificarAuth()
  }, [navigate])
  const [imagemCamisa, setImagemCamisa] = useState(null)
  const [imagemShort, setImagemShort] = useState(null)
  const [urlCamisa, setUrlCamisa] = useState('')
  const [urlShort, setUrlShort] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const inputCamisaRef = useRef(null)
  const inputShortRef = useRef(null)

  useEffect(() => {
    carregarUrls()
  }, [])

  const carregarUrls = async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('imagem_camisa, imagem_short')
      .eq('id', 1)
      .single()

    if (data) {
      setUrlCamisa(data.imagem_camisa || '')
      setUrlShort(data.imagem_short || '')
    }
  }

  const handleUpload = async (file, tipo) => {
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setMensagem('Apenas JPG, JPEG e PNG são permitidos')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setMensagem('Arquivo muito grande. Máximo: 5MB')
      return
    }

    const extensao = file.name.split('.').pop().toLowerCase()
    const nomeArquivo = `${tipo}_${Date.now()}.${extensao}`

    setSalvando(true)
    setMensagem('')

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imagens-produtos')
      .upload(nomeArquivo, file)

    if (uploadError) {
      setMensagem('Erro ao fazer upload')
      setSalvando(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('imagens-produtos')
      .getPublicUrl(nomeArquivo)

    const urlPublica = urlData.publicUrl

    if (tipo === 'camisa') {
      setImagemCamisa(null)
      setUrlCamisa(urlPublica)
    } else {
      setImagemShort(null)
      setUrlShort(urlPublica)
    }

    setSalvando(false)
    setMensagem('Upload realizado! Clique em Salvar para aplicar.')
  }

  const salvarUrl = async () => {
    setSalvando(true)
    setMensagem('')

    const { error } = await supabase
      .from('configuracoes')
      .update({
        imagem_camisa: urlCamisa,
        imagem_short: urlShort
      })
      .eq('id', 1)

    if (error) {
      setMensagem('Erro ao salvar: ' + error.message)
    } else {
      setMensagem('Imagens salvas com sucesso!')
      if (onAtualizado) onAtualizado()
    }
    setSalvando(false)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
      <h3 className="font-bold text-2xl text-gray-800 mb-6 border-b-2 border-pink-500 pb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Camisas e Shorts - Editar Imagens
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem da Camisa</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            ref={inputCamisaRef}
            onChange={(e) => handleUpload(e.target.files[0], 'camisa')}
            className="hidden"
          />
          <div
            onClick={() => inputCamisaRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition"
          >
            {imagemCamisa ? (
              <img src={URL.createObjectURL(imagemCamisa)} alt="Preview" className="h-40 mx-auto object-contain" />
            ) : urlCamisa ? (
              <img src={urlCamisa} alt="Camisa atual" className="h-40 mx-auto object-contain" />
            ) : (
              <div className="py-8 text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-sm font-medium">Clique para selecionar imagem</p>
              </div>
            )}
          </div>
          {urlCamisa && (
            <button onClick={() => { setUrlCamisa(''); setImagemCamisa(null) }} className="text-red-600 text-sm mt-2 hover:text-red-700 hover:underline font-medium">
              Remover imagem
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem do Short</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            ref={inputShortRef}
            onChange={(e) => handleUpload(e.target.files[0], 'short')}
            className="hidden"
          />
          <div
            onClick={() => inputShortRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition"
          >
            {imagemShort ? (
              <img src={URL.createObjectURL(imagemShort)} alt="Preview" className="h-40 mx-auto object-contain" />
            ) : urlShort ? (
              <img src={urlShort} alt="Short atual" className="h-40 mx-auto object-contain" />
            ) : (
              <div className="py-8 text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-sm font-medium">Clique para selecionar imagem</p>
              </div>
            )}
          </div>
          {urlShort && (
            <button onClick={() => { setUrlShort(''); setImagemShort(null) }} className="text-red-600 text-sm mt-2 hover:text-red-700 hover:underline font-medium">
              Remover imagem
            </button>
          )}
        </div>
      </div>

      <button
        onClick={salvarUrl}
        disabled={salvando}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg"
      >
        {salvando ? 'Salvando...' : 'Salvar Imagens'}
      </button>

      {mensagem && (
        <p className={`mt-3 text-center font-medium ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
          {mensagem}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        As imagens são salvas no storage do Supabase automaticamente
      </p>
    </div>
  )
}