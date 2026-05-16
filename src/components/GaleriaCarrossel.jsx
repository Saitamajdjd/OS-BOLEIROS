import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GaleriaCarrossel() {
  const [imagens, setImagens] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => { carregarGaleria() }, [])

  const carregarGaleria = async () => {
    const { data } = await supabase.from('galeria_home').select('*').order('ordem', { ascending: true })
    if (data && data.length > 0) setImagens(data)
  }

  if (imagens.length === 0) return null

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % imagens.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + imagens.length) % imagens.length)

  if (imagens.length === 1) {
    return (
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-2xl shadow-2xl">
        <img src={imagens[0].imagem_url} alt="Galeria" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-2xl shadow-2xl group">
      <div className="absolute inset-0">
        {imagens.map((img, index) => (
          <div key={img.id} className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img.imagem_url} alt="Galeria" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-rosa-principal text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-rosa-principal text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {imagens.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-rosa-principal w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
        ))}
      </div>
    </div>
  )
}