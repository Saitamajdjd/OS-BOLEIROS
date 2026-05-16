import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ExcelJS from 'exceljs'
import toast from 'react-hot-toast'

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XG', 'EXGG']

const formatarData = () => {
  const hoje = new Date()
  return hoje.toLocaleDateString('pt-BR')
}

export default function RelatoriosAdmin({ pedidos }) {
  const navigate = useNavigate()

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate('/admin')
    }
    verificarAuth()
  }, [navigate])
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('')
  const [sexoSelecionado, setSexoSelecionado] = useState('')

  const gerarExcelCamisas = async () => {
    if (!tamanhoSelecionado) {
      toast.error('Selecione um tamanho de camisa')
      return
    }

    const filtrados = pedidos.filter(p => p.tamanho_camisa && p.tamanho_camisa.toUpperCase() === tamanhoSelecionado.toUpperCase())

    if (filtrados.length === 0) {
      toast.error('Nenhum pedido encontrado para este tamanho')
      return
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Os Boleiro'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Camisas', {
      properties: { tabColor: { argb: '2563EB' } }
    })

    worksheet.mergeCells('A1:F1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = `CAMISAS ${tamanhoSelecionado} — ${filtrados.length} pessoas`
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(1).height = 40

    worksheet.mergeCells('A2:F2')
    const subtitleCell = worksheet.getCell('A2')
    subtitleCell.value = `Relatório gerado em ${formatarData()}`
    subtitleCell.font = { size: 11, color: { argb: '666666' } }
    subtitleCell.alignment = { horizontal: 'center' }

    worksheet.addRow([])
    worksheet.addRow([])

    const headerRow = worksheet.addRow(['Nº', 'Nome', 'Nome Personalizado', 'Número Personalizado', 'Tamanho Camisa'])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.getRow(5).height = 25

    filtrados.forEach((pedido, index) => {
      const row = worksheet.addRow([
        index + 1,
        pedido.nome,
        pedido.nome_personalizado || '-',
        pedido.numero_personalizado || '-',
        pedido.tamanho_camisa
      ])

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        cell.alignment = { vertical: 'middle' }
      })

      const numeroCell = row.getCell(1)
      numeroCell.alignment = { horizontal: 'center' }
      numeroCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } }

      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } }
      }
    })

    worksheet.columns = [
      { key: 'n', width: 8 },
      { key: 'nome', width: 30 },
      { key: 'nome_pers', width: 25 },
      { key: 'numero', width: 18 },
      { key: 'tamanho', width: 15 }
    ]

    worksheet.addRow([])
    const totalRow = worksheet.addRow(['', '', '', '', 'Total:', `${filtrados.length} pessoas`])
    totalRow.getCell(5).font = { bold: true, size: 12 }
    totalRow.getCell(6).font = { bold: true, size: 12, color: { argb: '2563EB' } }
    totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-camisas-${tamanhoSelecionado}.xlsx`
    link.click()
  }

  const gerarExcelShorts = async () => {
    if (!sexoSelecionado) {
      toast.error('Selecione o tipo de short')
      return
    }

    const filtrados = pedidos.filter(p => p.deseja_short && p.sexo_short && p.sexo_short.toUpperCase() === sexoSelecionado.toUpperCase())

    if (filtrados.length === 0) {
      toast.error(`Nenhum short ${sexoSelecionado.toLowerCase()} encontrado`)
      return
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Os Boleiro'
    workbook.created = new Date()

    const ws1 = workbook.addWorksheet('Resumo por Tamanho', { properties: { tabColor: { argb: 'EC4899' } } })

    ws1.mergeCells('A1:C1')
    const titleCell = ws1.getCell('A1')
    titleCell.value = `SHORTS ${sexoSelecionado.toUpperCase()}S — ${filtrados.length} shorts`
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EC4899' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(1).height = 40

    ws1.mergeCells('A2:C2')
    const subtitleCell = ws1.getCell('A2')
    subtitleCell.value = `Relatório gerado em ${formatarData()}`
    subtitleCell.font = { size: 11, color: { argb: '666666' } }
    subtitleCell.alignment = { horizontal: 'center' }

    ws1.addRow([])
    ws1.addRow([])

    const headerRow = ws1.addRow(['Tamanho', 'Quantidade', 'Porcentagem'])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F472B6' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    ws1.getRow(5).height = 25

    TAMANHOS.forEach((t, index) => {
      const qtd = filtrados.filter(p => p.tamanho_short === t).length
      const pct = filtrados.length > 0 ? ((qtd / filtrados.length) * 100).toFixed(1) + '%' : '0%'
      const row = ws1.addRow([t, qtd, pct])

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })

      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } }
      }
    })

    ws1.columns = [
      { key: 'tamanho', width: 15 },
      { key: 'qtd', width: 15 },
      { key: 'pct', width: 15 }
    ]

    ws1.addRow([])
    const totalRow = ws1.addRow(['TOTAL', filtrados.length, '100%'])
    totalRow.getCell(1).font = { bold: true, size: 12 }
    totalRow.getCell(2).font = { bold: true, size: 12, color: { argb: 'EC4899' } }
    totalRow.getCell(3).font = { bold: true, size: 12 }
    totalRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE7F3' } }

    const ws2 = workbook.addWorksheet('Detalhes dos Pedidos', { properties: { tabColor: { argb: '7C3AED' } } })

    ws2.mergeCells('A1:D1')
    const titleCell2 = ws2.getCell('A1')
    titleCell2.value = `SHORTS ${sexoSelecionado.toUpperCase()}S - Detalhes`
    titleCell2.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } }
    titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EC4899' } }
    titleCell2.alignment = { horizontal: 'center', vertical: 'middle' }
    ws2.getRow(1).height = 40

    ws2.mergeCells('A2:D2')
    const subtitleCell2 = ws2.getCell('A2')
    subtitleCell2.value = `Relatório gerado em ${formatarData()}`
    subtitleCell2.font = { size: 11, color: { argb: '666666' } }
    subtitleCell2.alignment = { horizontal: 'center' }

    ws2.addRow([])
    ws2.addRow([])

    const headerRow2 = ws2.addRow(['Nº', 'Nome do Cliente', 'Tamanho'])
    headerRow2.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F472B6' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    ws2.getRow(5).height = 25

    filtrados.forEach((pedido, index) => {
      const row = ws2.addRow([index + 1, pedido.nome, pedido.tamanho_short])

      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        cell.alignment = { vertical: 'middle' }
      })

      row.getCell(1).alignment = { horizontal: 'center' }
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE7F3' } }

      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } }
      }
    })

    ws2.columns = [
      { key: 'n', width: 8 },
      { key: 'nome', width: 40 },
      { key: 'tamanho', width: 15 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-shorts-${sexoSelecionado.toLowerCase()}.xlsx`
    link.click()
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
      <h3 className="font-bold text-2xl text-gray-800 mb-6 border-b-2 border-pink-500 pb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Relatórios em Excel
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Relatório de Camisas
          </h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o tamanho:</label>
            <select
              value={tamanhoSelecionado}
              onChange={(e) => setTamanhoSelecionado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition bg-white"
            >
              <option value="">Escolha um tamanho</option>
              {TAMANHOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={gerarExcelCamisas}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Baixar Excel de Camisas
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Relatório de Shorts
          </h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o tipo:</label>
            <select
              value={sexoSelecionado}
              onChange={(e) => setSexoSelecionado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition bg-white"
            >
              <option value="">Escolha o tipo</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <button
            onClick={gerarExcelShorts}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Baixar Excel de Shorts
          </button>
        </div>
      </div>
    </div>
  )
}