import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function GerenciarGaleria() {
  const navigate = useNavigate()

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/admin')
    }
    verificarAuth()
  }, [navigate])
  const [imagens, setImagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    carregarGaleria()
  }, [])

  const carregarGaleria = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('galeria_home')
      .select('*')
      .order('ordem', { ascending: true })

    if (!error && data) {
      setImagens(data)
    }
    setLoading(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error('Apenas JPG, JPEG e PNG são permitidos')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 5MB')
      return
    }

    setUploadFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const uploadImagem = async () => {
    if (!uploadFile) return

    setUploading(true)
    const fileName = `${Date.now()}-${uploadFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('imagens-produtos')
      .upload(`galeria-home/${fileName}`, uploadFile)

    if (uploadError) {
      toast.error('Erro ao fazer upload')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('imagens-produtos')
      .getPublicUrl(`galeria-home/${fileName}`)

    const maxOrdem = imagens.length > 0 ? Math.max(...imagens.map(i => i.ordem || 0)) : 0

    const { error: dbError } = await supabase
      .from('galeria_home')
      .insert([{
        imagem_url: urlData.publicUrl,
        destaque: false,
        ordem: maxOrdem + 1
      }])

    if (dbError) {
      toast.error('Erro ao salvar no banco')
    } else {
      toast.success('Imagem adicionada!')
      setUploadFile(null)
      setPreviewUrl(null)
      carregarGaleria()
    }
    setUploading(false)
  }

  const excluirImagem = async (id, url) => {
    const caminho = url.split('/').slice(-2).join('/')

    await supabase.storage
      .from('imagens-produtos')
      .remove([caminho])

    await supabase
      .from('galeria_home')
      .delete()
      .eq('id', id)

    toast.success('Imagem removida')
    carregarGaleria()
  }

  const toggleDestaque = async (id, atual) => {
    await supabase
      .from('galeria_home')
      .update({ destaque: !atual })
      .eq('id', id)
    carregarGaleria()
  }

  const reordenar = async (id, novaOrdem) => {
    await supabase
      .from('galeria_home')
      .update({ ordem: novaOrdem })
      .eq('id', id)
    carregarGaleria()
  }

  const moverCima = (index) => {
    if (index === 0) return
    const item = imagens[index]
    const acima = imagens[index - 1]
    reordenar(item.id, acima.ordem)
    reordenar(acima.id, item.ordem)
  }

  const moverBaixo = (index) => {
    if (index === imagens.length - 1) return
    const item = imagens[index]
    const abaixo = imagens[index + 1]
    reordenar(item.id, abaixo.ordem)
    reordenar(abaixo.id, item.ordem)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
      <h3 className="font-bold text-2xl text-gray-800 mb-6 border-b-2 border-pink-500 pb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Galeria Inicial
      </h3>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-pink-400 transition-colors">
          <h4 className="font-semibold text-gray-800 mb-4">Adicionar Nova Imagem</h4>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="hidden"
            id="upload-galeria"
          />
          <label
            htmlFor="upload-galeria"
            className="block w-full cursor-pointer"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
            ) : (
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4 border border-gray-200">
                <div className="text-center text-gray-500">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm">Clique para selecionar imagem</p>
                </div>
              </div>
            )}
          </label>
          <p className="text-xs text-gray-500 mb-4">Formatos: JPG, JPEG, PNG • Tamanho máximo: 5MB</p>
          <button
            onClick={uploadImagem}
            disabled={!uploadFile || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Enviar Imagem
              </>
            )}
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Instruções
          </h4>
          <ul className="text-sm text-gray-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Adicione imagens para a galeria da página inicial
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Marque a estrela para definir a imagem de destaque
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Use as setas para reordenar as imagens
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              As imagens aparecem no carrossel da home
            </li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : imagens.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p>Nenhuma imagem na galeria. Adicione acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagens.map((img, index) => (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden shadow-md ${img.destaque ? 'ring-4 ring-pink-500' : 'border border-gray-200'}`}>
              <img src={img.imagem_url} alt={`Galeria ${index + 1}`} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleDestaque(img.id, img.destaque)}
                  className={`p-2.5 rounded-full transition ${img.destaque ? 'bg-pink-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  title="Definir destaque"
                >
                  <svg className="w-5 h-5" fill={img.destaque ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={() => moverCima(index)}
                  disabled={index === 0}
                  className="p-2.5 bg-white/20 text-white rounded-full disabled:opacity-30 hover:bg-white/30 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moverBaixo(index)}
                  disabled={index === imagens.length - 1}
                  className="p-2.5 bg-white/20 text-white rounded-full disabled:opacity-30 hover:bg-white/30 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => excluirImagem(img.id, img.imagem_url)}
                  className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              {img.destaque && (
                <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-lg">Destaque</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}