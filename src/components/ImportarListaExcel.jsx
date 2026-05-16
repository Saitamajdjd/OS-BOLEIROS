import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const PRECOS = { camisa: 50, short: 35, combo: 85 }

export default function ImportarListaExcel({ onImportacaoConcluida }) {
  const navigate = useNavigate()

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/admin')
    }
    verificarAuth()
  }, [navigate])
  const [arquivo, setArquivo] = useState(null)
  const [dadosPreview, setDadosPreview] = useState([])
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erros, setErros] = useState([])

  const processarArquivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setArquivo(file)
    setResultado(null)
    setErros([])
    setDadosPreview([])

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const primeiraFolha = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(primeiraFolha, { header: 1 })

      if (json.length < 2) {
        toast.error('Arquivo vazio ou sem dados')
        return
      }

      const headers = json[0].map(h => h?.toString().toLowerCase().trim())
      const linhas = json.slice(1).filter(linha => linha.some(cell => cell !== null && cell !== undefined && cell !== ''))

      const dados = linhas.map((linha, index) => {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = linha[i]
        })

        const tamanhoCamisa = obj.tamanho_camisa?.toString().toUpperCase().trim() || ''
        const tamanhoShort = obj.tamanho_short?.toString().toUpperCase().trim() || ''

        return {
          nome: obj.nome?.toString().trim() || '',
          telefone: obj.telefone?.toString().trim() || '',
          tamanho_camisa: tamanhoCamisa,
          deseja_short: tamanhoShort !== '',
          tamanho_short: tamanhoShort || null,
          sexo_short: obj.sexo_short?.toString().trim() || null,
          nome_personalizado: obj.nome_personalizado?.toString().trim() || '',
          numero_personalizado: obj.numero_personalizado?.toString().trim() || '',
          observacao: obj.observacao?.toString().trim() || '',
          pago: obj.pago === true || obj.pago === 'true' || obj.pago === 1 || obj.pago === '1' || obj.pago === 'sim',
          valor_total: obj.valor_total ? parseFloat(obj.valor_total) : (
            tamanhoShort ? PRECOS.combo : PRECOS.camisa
          ),
          linha: index + 2
        }
      }).filter(d => d.nome && d.tamanho_camisa)

      setDadosPreview(dados)
    }
    reader.readAsArrayBuffer(file)
  }

  const importarDados = async () => {
    if (dadosPreview.length === 0) {
      toast.error('Nenhum dado para importar')
      return
    }

    setImportando(true)
    setErros([])

    const errosImportacao = []
    let importados = 0

    for (const dado of dadosPreview) {
      try {
        const { error } = await supabase.from('pedidos').insert([{
          nome: dado.nome,
          telefone: dado.telefone || '00000000000',
          tamanho_camisa: dado.tamanho_camisa,
          deseja_short: dado.deseja_short,
          tamanho_short: dado.tamanho_short,
          sexo_short: dado.sexo_short,
          nome_personalizado: dado.nome_personalizado || null,
          numero_personalizado: dado.numero_personalizado || null,
          observacao: dado.observacao || null,
          valor_total: dado.valor_total,
          pago: dado.pago
        }])

        if (error) {
          errosImportacao.push(`Linha ${dado.linha}: ${error.message}`)
        } else {
          importados++
        }
      } catch (e) {
        errosImportacao.push(`Linha ${dado.linha}: Erro ao salvar`)
      }
    }

    setResultado({ sucesso: importados, erros: errosImportacao.length })
    setErros(errosImportacao)
    setImportando(false)
    setDadosPreview([])
    setArquivo(null)

    if (onImportacaoConcluida) {
      onImportacaoConcluida()
    }
  }

  const limparSelecao = () => {
    setArquivo(null)
    setDadosPreview([])
    setResultado(null)
    setErros([])
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
      <h3 className="font-bold text-2xl text-gray-800 mb-6 border-b-2 border-pink-500 pb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        Importar Lista Excel
      </h3>

      {!arquivo && (
        <div className="mb-6">
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition">
            <input type="file" accept=".xlsx, .xls" onChange={processarArquivo} className="hidden" />
            <div className="text-gray-600">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="font-medium text-gray-700">Clique para selecionar o arquivo Excel</p>
              <p className="text-sm text-gray-500 mt-1">Formato: .xlsx ou .xls</p>
            </div>
          </label>
        </div>
      )}

      {arquivo && !dadosPreview.length && !resultado && (
        <div className="text-center py-8">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl inline-block">
            <p className="text-blue-700 font-medium">📄 {arquivo.name}</p>
          </div>
          <p className="text-gray-500">Processando arquivo...</p>
        </div>
      )}

      {arquivo && dadosPreview.length > 0 && !resultado && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-medium">📄 {arquivo.name}</p>
              <p className="text-sm text-green-600">{dadosPreview.length} registros encontrados</p>
            </div>
            <button
              onClick={limparSelecao}
              className="text-gray-600 hover:text-gray-800 hover:underline text-sm font-medium"
            >
              Trocar arquivo
            </button>
          </div>

          <div className="mb-4 overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-700 font-semibold">Nome</th>
                  <th className="px-3 py-2 text-left text-gray-700 font-semibold">Camisa</th>
                  <th className="px-3 py-2 text-left text-gray-700 font-semibold">Short</th>
                  <th className="px-3 py-2 text-center text-gray-700 font-semibold">Pago</th>
                  <th className="px-3 py-2 text-right text-gray-700 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dadosPreview.slice(0, 10).map((d, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{d.nome}</td>
                    <td className="px-3 py-2 text-gray-600">{d.tamanho_camisa}</td>
                    <td className="px-3 py-2 text-gray-600">{d.tamanho_short || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.pago ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {d.pago ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-800 font-medium">R$ {d.valor_total.toFixed(2).replace('.', ',')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dadosPreview.length > 10 && (
            <p className="text-sm text-gray-500 mb-4">Mostrando 10 de {dadosPreview.length} registros</p>
          )}

          <button
            onClick={importarDados}
            disabled={importando}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {importando ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importando...
              </>
            ) : (
              '✅ Confirmar Importação'
            )}
          </button>
        </div>
      )}

      {resultado && (
        <div className={`p-5 rounded-xl ${resultado.erros > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`font-semibold text-lg ${resultado.erros > 0 ? 'text-orange-700' : 'text-green-700'}`}>
            ✅ Importação concluída!
          </p>
          <p className="text-gray-700 mt-2">
            {resultado.sucesso} registro(s) importados com sucesso.
            {resultado.erros > 0 && <span className="text-orange-600 font-medium"> {resultado.erros} erro(s) encontrado(s).</span>}
          </p>
          {erros.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-orange-600 font-medium hover:text-orange-700">Ver erros</summary>
              <ul className="mt-2 text-xs text-orange-600 list-disc list-inside">
                {erros.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {erros.length > 5 && <li>...e mais {erros.length - 5} erros</li>}
              </ul>
            </details>
          )}
          <button
            onClick={limparSelecao}
            className="mt-4 text-pink-600 hover:text-pink-700 hover:underline text-sm font-medium"
          >
            Importar outro arquivo
          </button>
        </div>
      )}
    </div>
  )
}